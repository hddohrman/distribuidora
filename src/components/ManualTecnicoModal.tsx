import React, { useState } from 'react';
import { LocalIcon } from './LocalIcon';

interface ManualTecnicoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualTecnicoModal: React.FC<ManualTecnicoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<
    'arquitectura' | 'despliegue' | 'docker' | 'sync' | 'pwa'
  >('despliegue');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadManual = () => {
    // Generate download of the technical manual
    const content = `# MANUAL TÉCNICO DE PUESTA EN PRODUCCIÓN - DISTRIPRO S.A.
Versión: v3.9.0 Production-Ready

1. RESUMEN Y ARQUITECTURA
Frontend: React 19 + Vite + TypeScript + Tailwind CSS (PWA)
Servidor Web: Nginx 1.24+ o Docker Engine
Sincronización: Canales duales (API REST / WebSocket y Archivos .dist por WhatsApp)

2. COMANDOS DE COMPILACIÓN
$ git clone https://github.com/tu-empresa/distripro.git
$ cd distripro
$ npm ci
$ npm run build
-> Carpeta generada: /dist lista para servir en Nginx o CDN.

3. CONFIGURACIÓN NGINX PRODUCCIÓN
server {
    listen 80;
    server_name pedidos.distripro.com.ar;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name pedidos.distripro.com.ar;
    root /var/www/distripro/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}

4. ARCHIVO .dist
Formato JSON que consolida catálogo de precios, nuevos clientes dados de alta en la web con límites de crédito en cuenta corriente, porcentaje de descuento por pago en efectivo y datos bancarios.`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MANUAL_TECNICO_PRODUCCION_DISTRIPRO.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCommands = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-[#dce9ff] animate-in fade-in zoom-in-95 my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#00236f] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <LocalIcon name="menu_book" className="w-6 h-6 text-[#82f5c1]" />
            <div>
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] leading-tight">
                Manual Técnico de Puesta en Producción
              </h2>
              <p className="text-[11px] text-[#90a8ff]">
                DistriPro S.A. • Guía para Administradores de Sistemas y DevOps
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <LocalIcon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Pills */}
        <div className="bg-[#f0f4ff] p-2 border-b border-[#dce9ff] flex items-center gap-1.5 overflow-x-auto shrink-0 text-[12px]">
          <button
            type="button"
            onClick={() => setActiveSection('despliegue')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'despliegue'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#444651] hover:bg-white'
            }`}
          >
            1. Despliegue VPS / Nginx
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('docker')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'docker'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#444651] hover:bg-white'
            }`}
          >
            2. Docker Container
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('sync')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'sync'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#444651] hover:bg-white'
            }`}
          >
            3. Integración ERP & .dist
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('pwa')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'pwa'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#444651] hover:bg-white'
            }`}
          >
            4. Instalación PWA Móvil
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('arquitectura')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'arquitectura'
                ? 'bg-[#00236f] text-white shadow-xs'
                : 'text-[#444651] hover:bg-white'
            }`}
          >
            5. Arquitectura
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-[13px] text-[#0b1c30]">
          {activeSection === 'despliegue' && (
            <div className="space-y-3">
              <div className="bg-[#eefcf5] p-3 rounded-xl border border-[#a7f3d0] text-[#065f46]">
                <h4 className="font-bold text-[14px] flex items-center gap-1.5">
                  <LocalIcon name="verified" className="w-4.5 h-4.5" />
                  Despliegue Recomendado en Servidor Nginx (Ubuntu / Debian)
                </h4>
                <p className="text-[12px] mt-1">
                  La aplicación compila a archivos estáticos puros HTML/JS/CSS, permitiendo ser servida con latencia ultra baja, compresión Gzip/Brotli y SSL con renovación automática.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#00236f] mb-1.5">Paso 1: Compilación de Código para Producción</h5>
                <div className="bg-[#0b1c30] text-emerald-400 p-3 rounded-xl font-mono text-[12px] relative">
                  <pre className="overflow-x-auto whitespace-pre">
                    {`# 1. Instalar dependencias del proyecto
npm ci --only=production=false

# 2. Compilar aplicación web y móvil
npm run build

# Salida: Se creará la carpeta /dist con los bundles minificados`}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopyCommands('npm ci && npm run build')}
                    className="absolute top-2.5 right-2.5 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-sans"
                  >
                    {copied ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[#00236f] mb-1.5">Paso 2: Configuración del Virtual Host en Nginx</h5>
                <div className="bg-[#0b1c30] text-blue-200 p-3 rounded-xl font-mono text-[11px]">
                  <pre className="overflow-x-auto whitespace-pre">
                    {`server {
    listen 80;
    server_name pedidos.distripro.com.ar;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pedidos.distripro.com.ar;

    root /var/www/distripro/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'docker' && (
            <div className="space-y-3">
              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff]">
                <h4 className="font-bold text-[14px] text-[#00236f] flex items-center gap-1.5">
                  <LocalIcon name="view_in_ar" className="w-4.5 h-4.5" />
                  Contenedorización con Docker Multi-Stage
                </h4>
                <p className="text-[12px] text-[#444651] mt-1">
                  Ideal para desplegar en Google Cloud Run, AWS ECS, DigitalOcean App Platform o servidores con Docker Compose.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-[#00236f] mb-1.5">Dockerfile Optimizado</h5>
                <div className="bg-[#0b1c30] text-emerald-300 p-3 rounded-xl font-mono text-[11px]">
                  <pre className="overflow-x-auto whitespace-pre">
                    {`# Etapa 1: Compilación
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx liviano (< 25MB)
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`}
                  </pre>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[#00236f] mb-1.5">Comando para Compilar y Ejecutar</h5>
                <div className="bg-[#0b1c30] text-white p-3 rounded-xl font-mono text-[12px] flex justify-between items-center">
                  <span>docker build -t distripro-app . && docker run -p 3000:80 distripro-app</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCommands(
                        'docker build -t distripro-app . && docker run -p 3000:80 distripro-app'
                      )
                    }
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-sans"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'sync' && (
            <div className="space-y-3">
              <div className="bg-[#eff4ff] p-3 rounded-xl border border-[#bfdbfe]">
                <h4 className="font-bold text-[14px] text-[#00236f] flex items-center gap-1.5">
                  <LocalIcon name="sync_alt" className="w-4.5 h-4.5 text-[#006c4a]" />
                  Estructura del Archivo .dist para Integración con ERP
                </h4>
                <p className="text-[12px] text-[#444651] mt-1">
                  Permite exportar e importar lotes mediante WhatsApp sin requerir que los preventistas tengan conexión permanente a la base de datos de Casa Central.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-[12px] text-[#00236f]">Variables Clave del Archivo:</span>
                <ul className="list-disc pl-5 space-y-1 text-[12px] text-[#444651]">
                  <li>
                    <strong>catalog</strong>: Lista de productos con SKU, precios mayoristas y códigos de barras.
                  </li>
                  <li>
                    <strong>clients</strong>: Alta de clientes autorizados en la web con sus <code>creditLimit</code> (límite de cuenta corriente) y <code>currentDebt</code> (saldo deudor).
                  </li>
                  <li>
                    <strong>cashDiscountPercent</strong>: Porcentaje de descuento comercial que la app aplicará automáticamente al seleccionar pago en efectivo (ej: 10%).
                  </li>
                  <li>
                    <strong>bankInfo</strong>: Alias, CBU, Banco, CUIT y Titular para pagos por QR o transferencia bancaria inmediata.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'pwa' && (
            <div className="space-y-3">
              <div className="bg-[#f0fdf4] p-3 rounded-xl border border-[#bbf7d0]">
                <h4 className="font-bold text-[14px] text-[#166534] flex items-center gap-1.5">
                  <LocalIcon name="phone_android" className="w-4.5 h-4.5" />
                  Instalación como Aplicación Nativa en Celulares
                </h4>
                <p className="text-[12px] text-[#15803d] mt-1">
                  Los preventistas y clientes no necesitan descargar nada desde Google Play o App Store. La app funciona como Progressive Web App (PWA) offline.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl space-y-1">
                  <span className="font-bold text-[#00236f] block">En Dispositivos Android:</span>
                  <ol className="list-decimal pl-4 space-y-1 text-[12px] text-[#444651]">
                    <li>Ingresar desde Google Chrome a la URL.</li>
                    <li>Pulsar los tres puntos verticales (⋮).</li>
                    <li>Seleccionar <strong>"Instalar aplicación"</strong>.</li>
                    <li>Se añadirá al escritorio con icono propio.</li>
                  </ol>
                </div>

                <div className="p-3 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl space-y-1">
                  <span className="font-bold text-[#00236f] block">En iPhone / iPad (iOS):</span>
                  <ol className="list-decimal pl-4 space-y-1 text-[12px] text-[#444651]">
                    <li>Abrir la URL en Safari.</li>
                    <li>Tocar el botón Compartir (icono cuadrado con flecha).</li>
                    <li>Seleccionar <strong>"Agregar al inicio"</strong>.</li>
                    <li>Confirmar tocando "Agregar".</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'arquitectura' && (
            <div className="space-y-3 text-[12px] text-[#444651]">
              <div className="p-3 bg-[#f8f9ff] border border-[#dce9ff] rounded-xl space-y-2">
                <h4 className="font-bold text-[14px] text-[#00236f]">Matriz de Permisos por Rol</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#dce9ff] text-[11px] text-[#757682]">
                        <th className="pb-1">Funcionalidad</th>
                        <th className="pb-1">Rol Vendedor</th>
                        <th className="pb-1">Rol Cliente / Comercio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef2f6]">
                      <tr>
                        <td className="py-1 font-semibold">Toma de Pedidos</td>
                        <td className="py-1 text-[#006c4a] font-bold">In Situ y Preventa</td>
                        <td className="py-1 text-[#00236f]">Autogestión Catálogo</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold">Visualización de Stock</td>
                        <td className="py-1 text-[#006c4a] font-bold">Furgón + Central</td>
                        <td className="py-1 text-slate-400">Oculto (Confidencial)</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold">Validación Cuenta Corriente</td>
                        <td className="py-1">Manual / Alerta</td>
                        <td className="py-1 text-[#ba1a1a] font-bold">Bloqueo automático si excede</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold">Cobranzas y Recibos</td>
                        <td className="py-1 text-[#006c4a] font-bold">Habilitado</td>
                        <td className="py-1 text-slate-400">No aplica</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-semibold">Exportación Lote .dist</td>
                        <td className="py-1 text-[#006c4a] font-bold">Lote Completo Cifrado</td>
                        <td className="py-1 text-slate-400">Solo actualización entrante</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-[#f8f9ff] border-t border-[#dce9ff] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-[#757682] flex items-center gap-1.5">
            <LocalIcon name="task_alt" className="w-4 h-4 text-[#006c4a]" />
            <span>Manual listo en archivo <code>/MANUAL_TECNICO.md</code></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadManual}
              className="h-9 px-3 bg-[#00236f] hover:bg-[#1e3a8a] text-white text-[12px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              <LocalIcon name="download" className="w-4 h-4" />
              <span>Descargar Manual (.md)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 bg-white hover:bg-slate-100 text-[#444651] text-[12px] font-semibold rounded-lg border border-[#dce9ff] cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
