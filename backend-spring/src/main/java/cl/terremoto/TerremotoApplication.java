package cl.terremoto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import java.sql.Statement;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@SpringBootApplication
public class TerremotoApplication {
    public static void main(String[] args) { SpringApplication.run(TerremotoApplication.class, args); }
}

@Configuration
class CorsConfig implements WebMvcConfigurer {
    @Value("${CORS_ORIGINS:http://localhost:5173}") String origins;
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toArray(String[]::new)).allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS").allowedHeaders("Authorization","Content-Type");
    }
}

@RestController
@RequestMapping("/api")
class ApiController {
    private final JdbcTemplate db;
    private final ObjectMapper json;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder(12);
    private final SecretKey key;
    private final String adminPassword;
    ApiController(JdbcTemplate db, ObjectMapper json, @Value("${JWT_SECRET}") String secret, @Value("${ADMIN_PASSWORD}") String adminPassword) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32 || adminPassword.length() < 8) throw new IllegalArgumentException("Configura JWT_SECRET y ADMIN_PASSWORD seguros.");
        this.db=db; this.json=json; this.key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.adminPassword=adminPassword;
    }
    @PostConstruct void init() throws Exception {
        db.execute("CREATE TABLE IF NOT EXISTS productos (id INT AUTO_INCREMENT PRIMARY KEY,nombre VARCHAR(100) NOT NULL,categoria VARCHAR(40) NOT NULL,precio INT NOT NULL,`desc` VARCHAR(500) NOT NULL,disponible BOOLEAN NOT NULL,foto MEDIUMTEXT NOT NULL,descuento INT NOT NULL)");
        db.execute("CREATE TABLE IF NOT EXISTS categorias (id INT PRIMARY KEY,nombre VARCHAR(40) NOT NULL)");
        db.execute("CREATE TABLE IF NOT EXISTS usuarios (id VARCHAR(25) PRIMARY KEY,nombre VARCHAR(150) NOT NULL,rol VARCHAR(20) NOT NULL,password_hash VARCHAR(100) NOT NULL,email VARCHAR(150) NOT NULL DEFAULT '',telefono VARCHAR(150) NOT NULL DEFAULT '',direccion VARCHAR(150) NOT NULL DEFAULT '',comuna VARCHAR(150) NOT NULL DEFAULT '')");
        db.execute("CREATE TABLE IF NOT EXISTS pedidos (id CHAR(36) PRIMARY KEY,datos JSON NOT NULL,creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
        db.execute("CREATE TABLE IF NOT EXISTS consultas (id INT AUTO_INCREMENT PRIMARY KEY,mensaje VARCHAR(500) NOT NULL,creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
        db.execute("CREATE TABLE IF NOT EXISTS configuracion (clave VARCHAR(50) PRIMARY KEY)");
        Map<String,Object> seed=json.readValue(new ClassPathResource("seed.json").getInputStream(),new TypeReference<>(){});
        if (db.queryForObject("SELECT COUNT(*) FROM configuracion WHERE clave='datos_iniciales'",Integer.class)==0) {
            for (Map<String,Object> p : maps(seed.get("productos"))) db.update("INSERT INTO productos (id,nombre,categoria,precio,`desc`,disponible,foto,descuento) VALUES (?,?,?,?,?,?,?,?)",p.get("id"),p.get("nombre"),p.get("categoria"),p.get("precio"),p.get("desc"),p.get("disponible"),p.get("foto"),p.get("descuento"));
            db.update("INSERT INTO configuracion (clave) VALUES ('datos_iniciales')");
        }
        for (Map<String,Object> c : maps(seed.get("categorias"))) db.update("INSERT IGNORE INTO categorias (id,nombre) VALUES (?,?)",c.get("id"),c.get("nombre"));
        if (db.queryForObject("SELECT COUNT(*) FROM usuarios WHERE id='admin'",Integer.class)==0) db.update("INSERT INTO usuarios (id,nombre,rol,password_hash) VALUES ('admin','Administrador','admin',?)",bcrypt.encode(adminPassword));
    }
    @SuppressWarnings("unchecked") private static List<Map<String,Object>> maps(Object o) { return (List<Map<String,Object>>)o; }
    private static String str(Object o) { return o instanceof String ? (String)o : ""; }
    private static ApiError err(int status,String message) { return new ApiError(status,message); }
    private Map<String,Object> one(String sql,Object... args) { List<Map<String,Object>> rows=db.queryForList(sql,args); if(rows.isEmpty()) throw err(404,"No encontrado."); return rows.get(0); }
    private Map<String,Object> user(HttpServletRequest req,boolean admin) {
        try {
            String h=req.getHeader("Authorization"); if(h==null || !h.startsWith("Bearer ")) throw new IllegalArgumentException();
            var claims=Jwts.parser().verifyWith(key).build().parseSignedClaims(h.substring(7)).getPayload();
            Map<String,Object> u=one("SELECT id,nombre,rol,email,telefono,direccion,comuna FROM usuarios WHERE id=?",claims.getSubject());
            if(admin && !"admin".equals(u.get("rol"))) throw err(403,"Acceso reservado al administrador.");
            return u;
        } catch(ApiError e) { if(e.status==403) throw e; throw err(401,"Inicia sesión para continuar."); }
        catch(Exception e) { throw err(401,"Inicia sesión para continuar."); }
    }
    private Map<String,Object> perfil(Map<String,Object> u) { Map<String,Object> r=new LinkedHashMap<>(); for(String k:List.of("id","nombre","rol","email","telefono","direccion","comuna")) r.put(k,u.get(k)); r.put("usuario",u.get("id")); return r; }
    private void validateProduct(Map<String,Object> p) {
        String n=str(p.get("nombre")), c=str(p.get("categoria")), d=str(p.get("desc")), f=str(p.get("foto"));
        if(n.isBlank()||n.length()>100||!List.of("Tragos","Piqueos","Bebidas frías").contains(c)||!(p.get("precio") instanceof Integer price)||price<0||price>100000000||!(p.get("descuento") instanceof Integer discount)||discount<0||discount>90||!(p.get("desc") instanceof String)||d.length()>500||!(p.get("disponible") instanceof Boolean)||!(p.get("foto") instanceof String)||f.length()>1100000||(!f.isEmpty()&&!f.matches("(?s)(/?img/[^<>]+|data:image/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+)"))) throw err(400,"Datos del producto inválidos.");
    }
    @GetMapping("/productos") List<Map<String,Object>> products() { List<Map<String,Object>> rows=db.queryForList("SELECT * FROM productos ORDER BY id"); rows.forEach(p->{ Object value=p.get("disponible"); p.put("disponible", value instanceof Boolean ? value : ((Number)value).intValue()!=0); }); return rows; }
    @PostMapping("/productos") ResponseEntity<?> createProduct(@RequestBody Map<String,Object> p,HttpServletRequest req) { user(req,true); validateProduct(p); GeneratedKeyHolder keys=new GeneratedKeyHolder(); db.update(connection->{ var statement=connection.prepareStatement("INSERT INTO productos (nombre,categoria,precio,`desc`,disponible,foto,descuento) VALUES (?,?,?,?,?,?,?)",Statement.RETURN_GENERATED_KEYS); statement.setString(1,str(p.get("nombre")).trim()); statement.setString(2,str(p.get("categoria"))); statement.setInt(3,(Integer)p.get("precio")); statement.setString(4,str(p.get("desc"))); statement.setBoolean(5,(Boolean)p.get("disponible")); statement.setString(6,str(p.get("foto"))); statement.setInt(7,(Integer)p.get("descuento")); return statement; },keys); p.put("id",Objects.requireNonNull(keys.getKey()).longValue()); return ResponseEntity.status(201).body(p); }
    @PutMapping("/productos/{id}") Object updateProduct(@PathVariable long id,@RequestBody Map<String,Object> p,HttpServletRequest req) { user(req,true); validateProduct(p); if(db.update("UPDATE productos SET nombre=?,categoria=?,precio=?,`desc`=?,disponible=?,foto=?,descuento=? WHERE id=?",str(p.get("nombre")).trim(),p.get("categoria"),p.get("precio"),p.get("desc"),p.get("disponible"),p.get("foto"),p.get("descuento"),id)==0) throw err(404,"Producto no encontrado."); p.put("id",id); return p; }
    @DeleteMapping("/productos/{id}") ResponseEntity<?> deleteProduct(@PathVariable long id,HttpServletRequest req) { user(req,true); if(db.update("DELETE FROM productos WHERE id=?",id)==0) throw err(404,"Producto no encontrado."); return ResponseEntity.noContent().build(); }
    @GetMapping("/categorias") Object categories() { return db.queryForList("SELECT * FROM categorias ORDER BY id"); }
    @GetMapping("/usuarios") Object users(HttpServletRequest req) { user(req,true); return db.queryForList("SELECT id,nombre,rol FROM usuarios ORDER BY id"); }
    @PostMapping("/auth/registro") ResponseEntity<?> register(@RequestBody Map<String,Object> p) { String id=str(p.get("usuario")).trim().toLowerCase(Locale.ROOT), name=str(p.get("nombre")).trim(), pass=str(p.get("password")); if(!id.matches("[a-z][a-z0-9_-]{2,24}")||name.length()<2||name.length()>100||pass.length()<8||pass.getBytes(StandardCharsets.UTF_8).length>72) throw err(400,"Revisa el nombre, alias y contraseña (mínimo 8 caracteres)."); try { db.update("INSERT INTO usuarios (id,nombre,rol,password_hash) VALUES (?,?,'cliente',?)",id,name,bcrypt.encode(pass)); } catch(DuplicateKeyException e) { throw err(409,"Ese alias ya está registrado."); } return ResponseEntity.status(201).body(Map.of("mensaje","Cuenta creada.")); }
    @PostMapping("/auth/login") Object login(@RequestBody Map<String,Object> p) { String id=str(p.get("usuario")).trim().toLowerCase(Locale.ROOT), pass=str(p.get("password")); List<Map<String,Object>> rows=db.queryForList("SELECT * FROM usuarios WHERE id=?",id); if(rows.isEmpty()||pass.isEmpty()||!bcrypt.matches(pass,str(rows.get(0).get("password_hash")))) throw err(401,"Usuario o contraseña incorrectos."); var u=rows.get(0); long expiry=System.currentTimeMillis()+1800000; String token=Jwts.builder().subject(id).claim("rol",u.get("rol")).expiration(new Date(expiry)).signWith(key).compact(); Map<String,Object> result=perfil(u); result.put("token",token); result.put("expira",expiry); return result; }
    @PatchMapping("/perfil") Object profile(@RequestBody Map<String,Object> p,HttpServletRequest req) { var u=user(req,false); for(String k:List.of("nombre","email","telefono","direccion","comuna")) if(!(p.get(k) instanceof String)||str(p.get(k)).length()>150) throw err(400,"Datos de perfil inválidos."); db.update("UPDATE usuarios SET nombre=?,email=?,telefono=?,direccion=?,comuna=? WHERE id=?",p.get("nombre"),p.get("email"),p.get("telefono"),p.get("direccion"),p.get("comuna"),u.get("id")); return perfil(one("SELECT id,nombre,rol,email,telefono,direccion,comuna FROM usuarios WHERE id=?",u.get("id"))); }
    @PostMapping("/consultas") ResponseEntity<?> contact(@RequestBody Map<String,Object> p) { String s=str(p.get("mensaje")).trim(); if(s.isEmpty()||s.length()>500) throw err(400,"Mensaje inválido."); db.update("INSERT INTO consultas (mensaje) VALUES (?)",s); return ResponseEntity.status(201).body(Map.of("mensaje","Consulta guardada.")); }
    @PostMapping("/pedidos") ResponseEntity<?> order(@RequestBody Map<String,Object> body) throws Exception {
        if(!(body.get("lineas") instanceof List<?> lines)||lines.isEmpty()||lines.size()>100||!(body.get("cliente") instanceof Map<?,?>)) throw err(400,"Pedido inválido.");
        String delivery=str(body.get("entrega")), method=str(body.get("metodo")); if(!List.of("retiro","despacho").contains(delivery)||!List.of("transferencia","efectivo").contains(method)) throw err(400,"Pedido inválido.");
        @SuppressWarnings("unchecked") Map<String,Object> client=(Map<String,Object>)body.get("cliente");
        for(String k:List.of("nombre","email","telefono","direccion","comuna")) if(!(client.get(k) instanceof String)||str(client.get(k)).length()>150) throw err(400,"Datos del cliente inválidos.");
        if(str(client.get("nombre")).isBlank()||!str(client.get("email")).matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")||str(client.get("telefono")).isBlank()||(delivery.equals("despacho")&&(str(client.get("direccion")).isBlank()||str(client.get("comuna")).isBlank()))) throw err(400,"Completa los datos del cliente.");
        List<Map<String,Object>> items=new ArrayList<>(); Set<Integer> ids=new HashSet<>(); long subtotal=0;
        for(Object obj:lines) { if(!(obj instanceof Map<?,?> line)||!(line.get("id") instanceof Integer id)||!(line.get("cantidad") instanceof Integer qty)||qty<1||qty>99||!ids.add(id)) throw err(400,"Cantidad inválida."); var rows=db.queryForList("SELECT * FROM productos WHERE id=? AND disponible=1",id); if(rows.isEmpty()) throw err(400,"Un producto ya no está disponible."); var p=rows.get(0); long price=Math.round(((Number)p.get("precio")).doubleValue()*(1-((Number)p.get("descuento")).doubleValue()/100)); subtotal+=price*qty; items.add(Map.of("id",id,"nombre",p.get("nombre"),"cantidad",qty,"precio",price)); }
        int shipping=delivery.equals("despacho")?2500:0; Map<String,Object> o=new LinkedHashMap<>(); o.put("id",UUID.randomUUID().toString()); o.put("fecha",Instant.now().toString()); o.put("cliente",client); o.put("entrega",delivery); o.put("metodo",method); o.put("items",items); o.put("subtotal",subtotal); o.put("envio",shipping); o.put("total",subtotal+shipping); o.put("estado","Recibido"); db.update("INSERT INTO pedidos (id,datos) VALUES (?,?)",o.get("id"),json.writeValueAsString(o)); return ResponseEntity.status(201).body(o);
    }
    @GetMapping("/pedidos") Object orders(HttpServletRequest req) throws Exception { user(req,true); List<Map<String,Object>> result=new ArrayList<>(); for(String s:db.queryForList("SELECT datos FROM pedidos ORDER BY creado",String.class)) result.add(json.readValue(s,new TypeReference<>(){})); return result; }
    @PatchMapping("/pedidos/{id}") Object status(@PathVariable String id,@RequestBody Map<String,Object> p,HttpServletRequest req) throws Exception { user(req,true); String state=str(p.get("estado")); if(!List.of("Recibido","Preparando","Entregado","Cancelado").contains(state)) throw err(400,"Estado inválido."); Map<String,Object> row=one("SELECT datos FROM pedidos WHERE id=?",id); Map<String,Object> order=json.readValue(row.get("datos").toString(),new TypeReference<>(){}); order.put("estado",state); db.update("UPDATE pedidos SET datos=? WHERE id=?",json.writeValueAsString(order),id); return order; }
}
class ApiError extends RuntimeException { final int status; ApiError(int status,String message) { super(message); this.status=status; } }
@RestControllerAdvice
class ErrorHandler {
    @ExceptionHandler(ApiError.class) ResponseEntity<?> known(ApiError e) { return ResponseEntity.status(e.status).body(Map.of("error",e.getMessage())); }
    @ExceptionHandler(Exception.class) ResponseEntity<?> other(Exception e) { e.printStackTrace(); return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error","Error interno del servidor.")); }
}
