# Property Portals Reference Scraper

API service para extraer códigos de referencia de propiedades desde múltiples portales inmobiliarios usando Playwright. Arquitectura extensible basada en el patrón Strategy para agregar nuevos sitios fácilmente.

## 🚀 Características

- ✅ Scraping de códigos de referencia de múltiples portales
- ✅ Soporte actual: ZonaProp y ArgenProp
- ✅ Arquitectura extensible (patrón Strategy)
- ✅ API REST para integración
- ✅ Browser pooling para mejor performance
- ✅ Rate limiting configurable
- ✅ Docker ready para deployment

## 📋 Requisitos

- Node.js >= 18
- (Opcional) API Key de OpenAI para smart selectors

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# OpenAI Configuration (opcional, para smart selectors)
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Scraper Configuration
HEADLESS=true
SLOW_MO=0
BROWSER_TIMEOUT=30000

# Rate Limiting (milliseconds between requests)
RATE_LIMIT_DELAY=1000
```

### 3. Instalar browsers de Playwright

```bash
npx playwright install chromium
```

## 🏃 Ejecución

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

### Test manual de scrapers

```bash
npm run test
```

## 📡 API Endpoints

### POST `/api/properties/extract`

Extrae el código de referencia de una propiedad.

**Request body:**
```json
{
  "url": "https://www.zonaprop.com.ar/propiedades/departamento-..."
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `url` | string | ✅ | URL del aviso de propiedad |

**Response:**
```json
{
  "success": true,
  "data": {
    "referenceCode": "AMP0515_LP794215_1",
    "source": "zonaprop.com.ar",
    "url": "https://...",
    "scrapedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

**Ejemplo curl:**
```bash
curl -X POST http://localhost:3000/api/properties/extract \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.zonaprop.com.ar/propiedades/..."
  }'
```

**Ejemplos de códigos extraídos:**

- **ZonaProp**: `AMP0515_LP794215_1` (Cód. del anunciante) o `57306410` (Cód. Zonaprop)
- **ArgenProp**: `6KX2_1` (Código de aviso)

### GET `/api/properties/portals`

Obtiene la lista de portales soportados.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "portals": [
      {
        "domain": "zonaprop.com.ar",
        "exampleUrl": "https://www.zonaprop.com.ar"
      },
      {
        "domain": "argenprop.com",
        "exampleUrl": "https://www.argenprop.com"
      }
    ]
  }
}
```

### GET `/api/properties/health`

Health check del servicio.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🐳 Docker

### Build y run con Docker

```bash
docker build -t property-scraper .
docker run -p 3000:3000 --env-file .env property-scraper
```

### Con Docker Compose

```bash
docker-compose up -d
```

## 🔧 Agregar un nuevo portal

Para agregar soporte para un nuevo portal (ej: MercadoLibre):

### 1. Crear el archivo de estrategia

Crear `src/scrapers/strategies/mercadolibre-strategy.js`:

```javascript
import { BaseStrategy } from './base-strategy.js';
import { logger } from '../../utils/logger.js';

export class MercadoLibreStrategy extends BaseStrategy {
  constructor() {
    super('mercadolibre.com.ar');
  }

  async extractReferenceCode() {
    // Implementar lógica de extracción específica para MercadoLibre
    logger.debug('Extracting reference code from MercadoLibre');
    
    // Estrategia 1: Buscar en el HTML del sitio
    const code = await this.page.evaluate(() => {
      // Buscar el código en la estructura específica de MercadoLibre
      const codeElement = document.querySelector('[class*="item-code"]');
      return codeElement ? codeElement.textContent.trim() : null;
    });
    
    return code;
  }
}
```

### 2. Registrar la estrategia

Editar `src/scrapers/strategy-factory.js`:

```javascript
import { MercadoLibreStrategy } from './strategies/mercadolibre-strategy.js';

// En el constructor:
this.strategies = new Map([
  ['zonaprop.com.ar', ZonaPropStrategy],
  ['argenprop.com', ArgenPropStrategy],
  ['mercadolibre.com.ar', MercadoLibreStrategy], // ← Agregar aquí
]);
```

¡Listo! El nuevo portal ya está disponible en el API.

## 📁 Estructura del Proyecto

```
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   └── properties.js      # Endpoints de la API
│   │   └── server.js              # Express server
│   ├── config/
│   │   └── index.js               # Configuración centralizada
│   ├── scrapers/
│   │   ├── strategies/
│   │   │   ├── base-strategy.js   # Clase base abstracta
│   │   │   ├── zonaprop-strategy.js
│   │   │   └── argenprop-strategy.js
│   │   ├── strategy-factory.js    # Factory pattern
│   │   ├── index.js               # Orquestador principal
│   │   └── test-scraper.js        # Test manual
│   ├── utils/
│   │   ├── logger.js              # Winston logger
│   │   ├── url-parser.js          # URL parsing y validación
│   │   └── browser-pool.js        # Pool de browsers
│   └── index.js                   # Entry point
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## 🎯 Arquitectura: Strategy Pattern

El proyecto usa el **patrón Strategy** para manejar diferentes portales:

- **BaseStrategy**: Clase abstracta con métodos comunes
- **Estrategias concretas**: Una por portal (ZonaPropStrategy, ArgenPropStrategy)
- **StrategyFactory**: Selecciona la estrategia correcta según el dominio
- **Scraper Orchestrator**: Coordina el proceso completo

### Ventajas

✅ **Extensibilidad**: Agregar un nuevo portal no requiere modificar código existente  
✅ **Mantenibilidad**: Cada portal tiene su lógica aislada  
✅ **Reusabilidad**: Browser pool, logging y utils son compartidos  
✅ **Testabilidad**: Cada estrategia se puede testear independientemente  

## ⚠️ Consideraciones

- **Rate limiting**: El scraper incluye delays configurables entre requests
- **Browser pooling**: Los browsers se reutilizan para mejor performance
- **Respeto a robots.txt**: Asegúrate de cumplir con las políticas de cada sitio
- **Selectores CSS**: Si un sitio cambia su HTML, actualiza la estrategia correspondiente

## 📝 Licencia

ISC
