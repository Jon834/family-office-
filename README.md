# Family Office Núñez — Web Awesome

Aplicación web estática/PWA para GitHub Pages y uso local-first.

## Funciones
- Importación del CSV de cartera de DivvyDiary con vista previa detallada.
- Sincronización por ISIN con dos modos: `update` y `replace`.
- Copia automática previa a cada importación y deshacer de la última importación.
- Dashboard con valor, coste, plusvalía, dividendos, yield y YOC.
- Distribución por sector y país.
- Tabla con búsqueda y filtros.
- Cierres mensuales.
- Copia/restauración JSON.
- Informe Markdown para ChatGPT.
- Datos guardados únicamente en `localStorage` del navegador.

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

## Privacidad
No hay servidor ni base de datos. El CSV se procesa dentro del navegador. Haz copias JSON periódicamente porque al borrar los datos del navegador se pierde la información local.

## Dependencias externas
- Web Awesome 3.10.0 desde su CDN oficial.
- Papa Parse 5.5.3 desde jsDelivr.

La aplicación sigue siendo local-first, pero Web Awesome y Papa Parse requieren conexión la primera vez que se abre la app.
