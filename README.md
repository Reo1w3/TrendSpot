# TrendSpot

Analista de tendencias en vivo que evalúa la intencionalidad del mercado mediante señales sociales de YouTube Shorts, volumen de medios en Google News y sugerencias de búsqueda de Amazon, cruzando los datos en tiempo real con el inventario de la API de CJ Dropshipping.

## Estructura del Proyecto

* **`/backend`**: API de análisis construida en Node.js y Express.
* **`/frontend`**: Dashboard de visualización e interfaz de usuario construida en Next.js.

## Características Técnicas (MVP)

* **Paralelismo Optimizado**: Uso de `Promise.allSettled` para consultar señales de forma concurrente, garantizando tiempos de respuesta ultrarrápidos.
* **Clasificador de Intencionalidad**: Algoritmo que determina automáticamente si una búsqueda es un nicho genérico o un producto específico.
* **Caché en Memoria**: Access Token de CJ Dropshipping almacenado en RAM, minimizando peticiones innecesarias de autenticación.
* **Stateless**: Historial de búsquedas gestionado 100% en memoria, sin bases de datos locales ni archivos de disco.

## Configuración del Entorno

### Servidor (Backend)

**Paso 1: Navega al directorio del backend**

```bash
cd backend
```

**Paso 2: Instala las dependencias necesarias**

```bash
npm install
```

**Paso 3: Configura tus credenciales**
Crea un archivo `.env` en la raíz de la carpeta `/backend` y añade:

```env
PORT=3001
CJ_EMAIL=tu_correo@dominio.com
CJ_API_KEY=tu_api_key_oficial
```

**Paso 4: Inicia el servidor**

```bash
npm run dev
```

### Interfaz (Frontend)

**Paso 1: Navega al directorio del frontend**

```bash
cd ../frontend
```

**Paso 2: Instala las dependencias**

```bash
npm install
```

**Paso 3: Inicia el entorno de desarrollo**

```bash
npm run dev
```

## Endpoints del Analista

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/api/research?niche=query` | Analiza el nicho, extrae métricas de Google/YouTube e inyecta productos. |
| `GET` | `/api/trends/keywords?niche=query` | Recupera sugerencias de términos clave en vivo de Amazon. |
| `GET` | `/api/hot-tags` | Devuelve las 4 búsquedas más frecuentes almacenadas en la RAM. |
