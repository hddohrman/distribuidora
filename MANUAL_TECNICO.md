# MANUAL TÉCNICO DE PUESTA EN PRODUCCIÓN - DISTRIPRO S.A.
**Sistema Móvil de Preventa, Autogestión de Clientes y Sincronización WhatsApp**
*Versión de Plataforma: v3.9.0 Production-Ready*

---

## 1. RESUMEN EJECUTIVO Y ARQUITECTURA

**DistriPro** es una solución híbrida (App Móvil PWA + Aplicación Web Comercial) diseñada para distribuidoras mayoristas y empresas de logística comercial. Permite a preventistas y repartidores operar en campo ("modo calle") con o sin conexión a internet, y a los clientes autorizados autogestionar sus pedidos desde su propio teléfono o navegador.

### Componentes de la Arquitectura:
1. **Frontend / Mobile PWA (React 19 + Vite + TypeScript + Tailwind CSS)**:
   - Interfaz táctil optimizada para teléfonos móviles, tablets y terminales portátiles.
   - Modo Dual:
     - **Perfil Vendedor / Preventista**: Toma de pedidos in situ, stock en furgón y depósito central, ruteo georreferenciado, cobranzas, emisión de recibos y arqueo de caja.
     - **Perfil Cliente / Comercio**: Catálogo mayorista exclusivo, precios vigentes, pedido directo, cálculo de bonificación por pago contado en efectivo (10% OFF), datos bancarios para transferencia/QR y validación en tiempo real de límite de crédito en cuenta corriente.
   - Sincronización híbrida: Conexión online vía REST/WebSocket o canal asíncrono sin consumo de datos mediante paquetes cifrados `.dist` por WhatsApp.
2. **Capa de Servicio y Servidor Web (Nginx / Express / Node.js)**:
   - Manejo de compresión Gzip/Brotli, cache de activos estáticos, headers de seguridad HTTPS (HSTS, CSP, X-Frame-Options).
3. **Mecanismo de Intercambio de Datos (`.dist` / JSON Payload)**:
   - Formato liviano para sincronizar lotes comerciales, altas de clientes con cupo crediticio y listas de precios sin necesidad de VPN o IP fija en los vehículos.

---

## 2. REQUISITOS DEL SISTEMA

### Requisitos en Servidor de Producción:
- **Sistema Operativo**: Linux Ubuntu Server 22.04 LTS o superior / Debian 12 / Alpine Linux.
- **Node.js**: v20.x LTS o v22.x LTS.
- **Gestor de Paquetes**: `npm` v10+ o `bun` v1.1+.
- **Servidor Web / Proxy Inverso**: Nginx 1.24+ con módulo SSL (Let's Encrypt / Certbot).
- **Contenedores (Opcional recomendado)**: Docker Engine 24+ y Docker Compose v2.
- **Recursos Mínimos**: 1 vCPU, 1 GB RAM, 10 GB SSD.
- **Recursos Recomendados (50+ preventistas)**: 2 vCPU, 4 GB RAM, 40 GB SSD NVMe.

### Requisitos en Dispositivos Clientes:
- **Android**: Chrome 100+ o cualquier navegador basado en Chromium. Android 8.0+.
- **iOS / iPadOS**: Safari en iOS 14.5+. Soporta "Añadir a la pantalla de inicio" como PWA nativa.
- **Escritorio**: Chrome, Edge, Firefox, Safari.

---

## 3. VARIABLES DE ENTORNO

Crear el archivo `.env` en la raíz del proyecto para producción:

```env
# Configuración general
NODE_ENV=production
PORT=3000

# Parámetros comerciales por defecto
VITE_CASH_DISCOUNT_PERCENT=10
VITE_DEFAULT_BANK_ALIAS=DISTRI.PRO.PAGOS
VITE_DEFAULT_BANK_CBU=0000003100012345678901
VITE_DEFAULT_BANK_NAME=Banco Galicia
VITE_DEFAULT_BANK_HOLDER=DistriPro S.A. Mayorista
VITE_DEFAULT_BANK_CUIT=30-71234567-8

# Teléfono WhatsApp oficial de Casa Central para recepción de lotes
VITE_CENTRAL_WHATSAPP_PHONE=5491155551234
```

---

## 4. INSTALACIÓN Y COMPILACIÓN

### Paso 1: Clonar el repositorio en el servidor
```bash
git clone https://github.com/tu-organizacion/distripro-app.git /var/www/distripro
cd /var/www/distripro
```

### Paso 2: Instalar dependencias
```bash
npm ci --only=production=false
```

### Paso 3: Compilar los activos estáticos para producción
```bash
npm run build
```
Este comando generará el directorio optimizado y minificado `/dist` listo para ser servido a máxima velocidad.

---

## 5. DESPLIEGUE EN PRODUCCIÓN

### Opción A: Servidor Nginx Directo (Recomendado para VPS / Servidor Dedicado)

1. Instalar Nginx y Certbot:
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

2. Crear la configuración del virtual host en `/etc/nginx/sites-available/distripro.conf`:
```nginx
server {
    listen 80;
    server_name pedidos.distripro.com.ar;

    # Redirección obligatoria a HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pedidos.distripro.com.ar;

    ssl_certificate /etc/letsencrypt/live/pedidos.distripro.com.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pedidos.distripro.com.ar/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/distripro/dist;
    index index.html;

    # Compresión Gzip para respuesta ultrarrápida en redes 3G/4G
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/json;
    gzip_disable "MSIE [1-6]\.";

    # Cache agresivo para bundles versionados
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # SPA Routing: Cualquier ruta redirige a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cabeceras de seguridad
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
}
```

3. Habilitar el sitio y reiniciar Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/distripro.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. Generar certificado SSL con Let's Encrypt:
```bash
sudo certbot --nginx -d pedidos.distripro.com.ar
```

---

### Opción B: Despliegue con Docker y Docker Compose

1. **`Dockerfile` de producción (Multi-stage build ultraliviano)**:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-prod.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **`docker-compose.yml`**:
```yaml
version: '3.8'

services:
  distripro-web:
    build: .
    container_name: distripro_app
    restart: always
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
```

3. Levantar el servicio:
```bash
docker compose up -d --build
```

---

## 6. PROTOCOLO DE SINCRONIZACIÓN Y FORMATO DEL ARCHIVO `.dist`

El archivo `.dist` es una estructura JSON optimizada que permite actualizar la base de datos de los teléfonos de preventistas y clientes por WhatsApp:

### Estructura de Salida desde el ERP Central hacia los Móviles:
```json
{
  "version": "distripro-catalogo-v3.9",
  "date": "2026-09-02T22:00:00.000Z",
  "vendor": "David C.",
  "zone": "Zona 04 Centro",
  "cashDiscountPercent": 10,
  "bankInfo": {
    "alias": "DISTRI.PRO.PAGOS",
    "cbu": "0000003100012345678901",
    "bankName": "Banco Galicia",
    "accountHolder": "DistriPro S.A. Mayorista",
    "cuit": "30-71234567-8"
  },
  "catalog": [
    {
      "id": "prod-1",
      "sku": "ACE-MAR-900",
      "name": "Aceite Marolio Girasol 900ml",
      "brand": "Marolio",
      "presentation": "cajas x 12 unidades",
      "category": "Almacén",
      "priceWholesale": 21800,
      "unitType": "cajas",
      "unitsPerPack": 12,
      "stockTruck": 14,
      "stockCentral": 320,
      "barcode": "779123456781"
    }
  ],
  "clients": [
    {
      "id": "cli-1048",
      "code": "#CLI-1048",
      "name": "Supermercado San Cayetano",
      "address": "Av. Rivadavia 8420, Floresta",
      "phone": "+54 9 11 4455-6677",
      "creditLimit": 500000,
      "currentDebt": 124500
    }
  ]
}
```

### Reglas de Negocio en la Aplicación Móvil:
1. **Límite de Cuenta Corriente**:
   $$\text{Margen Disponible} = \max(0, \text{creditLimit} - \text{currentDebt})$$
   Si el pedido excede este margen, la aplicación **bloquea la opción de cuenta corriente** y exige abonar en efectivo (con bonificación) o por transferencia.
2. **Descuento de Contado en Efectivo**:
   $$\text{Monto Descuento} = \text{Subtotal} \times \left(\frac{\text{cashDiscountPercent}}{100}\right)$$
   $$\text{Total Final} = \text{Subtotal} - \text{Monto Descuento}$$
3. **Aislamiento de Perfiles**:
   - En **Modo Cliente**, los niveles de stock físico en furgón y depósito central quedan ocultos para preservar la confidencialidad de la distribuidora.

---

## 7. INSTALACIÓN COMO APLICACIÓN NATIVA (PWA)

Para que los preventistas y comercios utilicen la aplicación a pantalla completa como una app nativa:

- **En Android (Chrome)**:
  1. Abrir la URL de producción (ej. `https://pedidos.distripro.com.ar`).
  2. Tocar el menú de tres puntos verticales (`⋮`).
  3. Seleccionar **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
  4. La app aparecerá con icono propio en el cajón de aplicaciones y funcionará offline.

- **En iPhone / iPad (Safari)**:
  1. Abrir la URL en Safari.
  2. Tocar el botón de **Compartir** (icono cuadrado con flecha hacia arriba).
  3. Deslizar y pulsar **"Agregar al inicio"**.
  4. Confirmar el nombre "DistriPro".

---

## 8. PLAN DE CONTINGENCIA Y RESPALDOS

1. **Copia de Lotes Locales**: El archivo `.dist` generado en cada arqueo queda almacenado en el almacenamiento local del navegador (`IndexedDB`/`localStorage`) y puede descargarse directamente desde la pestaña **"Sincronizar"** tocando el botón *"Descargar Backup .dist en Teléfono"*.
2. **Canal de Emergencia**: Si el servidor web sufriera una caída o interrupción de conectividad móvil, las notas de pedido se generan y envían automáticamente formateadas en texto plano enriquecido por WhatsApp directo al número del despachante o preventista, garantizando que ninguna venta se pierda.

---
*Manual elaborado por el Equipo de Ingeniería de Software de DistriPro S.A.*
