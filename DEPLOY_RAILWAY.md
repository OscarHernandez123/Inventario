# Publicar Aromas con Railway

## 1. Base de datos

En el proyecto de Railway ya existe el servicio PostgreSQL `aromas-inventario`. No habilites acceso público para la base de datos.

## 2. Backend

1. En Railway, pulsa **New** y selecciona **GitHub Repo**.
2. Elige este repositorio y deja que Railway use el `Dockerfile` de la raíz.
3. Cuando se cree el servicio backend, abre **Variables** y agrega:

```text
DB_URL=jdbc:postgresql://${{aromas-inventario.PGHOST}}:${{aromas-inventario.PGPORT}}/${{aromas-inventario.PGDATABASE}}
DB_USERNAME=${{aromas-inventario.PGUSER}}
DB_PASSWORD=${{aromas-inventario.PGPASSWORD}}
CORS_ALLOWED_ORIGINS=https://TU-FRONTEND.vercel.app
```

4. En **Settings > Networking**, genera un dominio público. Guárdalo como `https://TU-BACKEND.up.railway.app`.

## 3. Frontend

1. En [Vercel](https://vercel.com), importa el mismo repositorio de GitHub.
2. Define **Root Directory** como `frontend`.
3. Agrega esta variable de entorno antes de desplegar:

```text
VITE_API_URL=https://TU-BACKEND.up.railway.app/api
```

4. Despliega el sitio y copia su URL pública.

## 4. Autorizar el frontend

Actualiza `CORS_ALLOWED_ORIGINS` del backend con la URL real de Vercel, sin una barra final, y redepliega Railway.

Ejemplo:

```text
CORS_ALLOWED_ORIGINS=https://aromas-inventario.vercel.app
```

La persona que use Aromas accederá únicamente a la URL pública de Vercel. PostgreSQL nunca debe exponerse públicamente.
