# TurMaipoView

Interfaz de usuario para visualizar la ubicación de las micros de la empresa **TurMaipo** y seleccionar paraderos cercanos. El proyecto está construido con [Astro](https://astro.build/) y [React](https://react.dev/), utiliza [Supabase](https://supabase.com/) para obtener la información de paraderos y rutas, y emplea [Leaflet](https://leafletjs.com/) para el mapa interactivo.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior (incluido con Node.js)

## Instalación

1. Clona este repositorio:
   ```bash
   git clone <repo-url>
   cd TurMaipoUsuario
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz con tus credenciales de Supabase:
   ```env
   PUBLIC_SUPABASE_URL=<tu-url-de-supabase>
   PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
   ```

## Uso en desarrollo

Inicia el servidor de desarrollo con:

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:4321`. Al ingresar, podrás seleccionar un paradero y ver la micro más cercana en el mapa.

| Comando           | Descripcion                                                
| ----------------- | -----------------------------------------------------------
| `npm run dev`     | Ejecuta el entorno de desarrollo
| `npm run build`   | Genera la version optimizada en `dist/`
| `npm run preview` | Sirve la carpeta `dist/` para comprobar el resultado final
| `npm run astro`   | Acceso directo a la CLI de Astro
## Despliegue
El proyecto puede desplegarse fácilmente en Netlify u otros servicios que soporten sitios estáticos. El archivo `netlify.toml` ya contiene la configuración básica:
```
[build]
  command = "npm run build"
  publish = "dist"
```

Cualquier servidor que sirva los archivos estáticos generados en `dist/` funcionará.

## Estructura del proyecto

```
/
├── public/          # Recursos estáticos (íconos, favicons)
├── src/
│   ├── components/  # Componentes React (MapaPasajero)
│   ├── pages/       # Páginas Astro
│   ├── lib/         # Cliente de Supabase
│   └── styles/      # Hoja de estilos global
├── astro.config.mjs # Configuración de Astro y Tailwind
├── tailwind.config.cjs
└── netlify.toml
```

## Licencia
MIT © 2025 Koour et al.

Compílalo, pruébalo en la pista y comparte tus pull-requests. ¡Buen viaje!
