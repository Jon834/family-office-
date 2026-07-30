# Family Office Núñez — Web Awesome

Aplicación web estática/PWA para GitHub Pages.

## Funciones
- Importación del CSV de cartera de DivvyDiary.
- Actualización por ISIN o reemplazo completo.
- Dashboard con valor, coste, plusvalía, dividendos, yield y YOC.
- Distribución por sector y país.
- Tabla con búsqueda y filtros.
- Cierres mensuales.
- Copia/restauración JSON.
- Informe Markdown para ChatGPT.
- Datos guardados únicamente en `localStorage` del navegador.

## Publicar en GitHub Pages
1. Sustituye el contenido del repositorio por estos archivos.
2. Haz commit en la rama `main`.
3. En **Settings → Pages**, usa **Deploy from a branch**, `main`, carpeta `/ (root)`.
4. Fuerza una recarga de la web. Si tenías la versión anterior instalada, puede ser necesario cerrar y abrir la PWA.

## Privacidad
No hay servidor ni base de datos. El CSV se procesa dentro del navegador. Haz copias JSON periódicamente porque al borrar los datos del navegador se pierde la información local.

## Dependencias externas
- Web Awesome 3.10.0 desde su CDN oficial.
- Papa Parse 5.5.3 desde jsDelivr.

La interfaz básica dispone de CSS propio para mantener una presentación legible, pero Web Awesome y Papa Parse requieren conexión la primera vez que se abre la aplicación.
