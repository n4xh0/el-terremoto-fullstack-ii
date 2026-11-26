# El Terremoto — Fullstack II

Aplicación web para una fonda, con catálogo y carrito, frontend React y API Spring Boot conectada a MySQL.

## Sitio desplegado

http://el-terremoto-eva3-441558313469.s3-website-us-east-1.amazonaws.com/

La API requiere que el laboratorio AWS y la instancia EC2 estén activos.

## Estructura

- `src/` y `public/`: frontend React y recursos.
- `backend-spring/`: API Spring Boot y Dockerfile.
- `base-de-datos/estructura.sql`: esquema de la base de datos.
- `docker-compose.yml`: servicios de API y MySQL.

## Ejecución local

Copiar `.env.example` a `.env` y configurar valores propios para las claves. Ejecutar `docker compose up --build` para iniciar la API y MySQL. En otra terminal, ejecutar `npm ci` y `npm run dev` para iniciar el frontend. No compartir el archivo `.env`.
