<<<<<<< HEAD
# Family Office Núñez — Web Awesome

Aplicación web estática/PWA para GitHub Pages.

## Funciones
- Importación del CSV de cartera de DivvyDiary.
- Actualización por ISIN o reemplazo completo.
=======
﻿# Family Office Núñez — Web Awesome

Aplicación web estática/PWA para GitHub Pages y uso local-first.

## Funciones
- Importación del CSV de cartera de DivvyDiary con vista previa detallada.
- Sincronización por ISIN con dos modos: `update` y `replace`.
- Copia automática previa a cada importación y deshacer de la última importación.
>>>>>>> 434302f (Añadir importación de cartera desde DivvyDiary)
- Dashboard con valor, coste, plusvalía, dividendos, yield y YOC.
- Distribución por sector y país.
- Tabla con búsqueda y filtros.
- Cierres mensuales.
- Copia/restauración JSON.
- Informe Markdown para ChatGPT.
- Datos guardados únicamente en `localStorage` del navegador.

<<<<<<< HEAD
## Publicar en GitHub Pages
1. Sustituye el contenido del repositorio por estos archivos.
2. Haz commit en la rama `main`.
3. En **Settings → Pages**, usa **Deploy from a branch**, `main`, carpeta `/ (root)`.
4. Fuerza una recarga de la web. Si tenías la versión anterior instalada, puede ser necesario cerrar y abrir la PWA.
=======
## Probar la importación
1. Abre `index.html` o publícalo en GitHub Pages.
2. Pulsa `Importar DivvyDiary` y selecciona un CSV exportado por DivvyDiary.
3. Revisa la preview: posiciones nuevas, actualizadas, ausentes e incidencias.
4. Elige `Actualizar` o `Reemplazar`.
5. Confirma la importación.
6. Si necesitas revertirla, usa `Deshacer importación`.

## Publicar en GitHub Pages
1. Sube estos archivos a la rama `main` del repositorio.
2. En **Settings → Pages**, usa **Deploy from a branch**, `main`, carpeta `/ (root)`.
3. Fuerza una recarga de la web. Si ya tenías la PWA instalada, puede ser necesario reabrirla para tomar el nuevo service worker.
>>>>>>> 434302f (Añadir importación de cartera desde DivvyDiary)

## Privacidad
No hay servidor ni base de datos. El CSV se procesa dentro del navegador. Haz copias JSON periódicamente porque al borrar los datos del navegador se pierde la información local.

## Dependencias externas
- Web Awesome 3.10.0 desde su CDN oficial.
- Papa Parse 5.5.3 desde jsDelivr.

<<<<<<< HEAD
La interfaz básica dispone de CSS propio para mantener una presentación legible, pero Web Awesome y Papa Parse requieren conexión la primera vez que se abre la aplicación.
=======
La aplicación sigue siendo local-first, pero Web Awesome y Papa Parse requieren conexión la primera vez que se abre la app.
>>>>>>> 434302f (Añadir importación de cartera desde DivvyDiary)
