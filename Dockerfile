# Multi-stage Dockerfile para Puesta en Producción de DistriPro
# Etapa 1: Compilación de Frontend y PWA
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiesto de dependencias e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx de Alto Rendimiento (< 25MB)
FROM nginx:1.27-alpine

# Copiar archivos compilados desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx optimizada para SPA / PWA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto HTTP estándar
EXPOSE 80

# Comando de inicio del servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
