# Descargador de Iconos Flaticon

Una extensión de Chrome que descarga automáticamente todos los iconos de Flaticon de una página web en un archivo ZIP comprimido. ¡Herramienta perfecta para diseñadores, desarrolladores y creadores de contenido!

## ✨ Características

- 📥 **Descarga automática** de iconos desde páginas de Flaticon
- 📦 **Empaquetado ZIP** automático con compresión
- 📊 **Estadísticas en tiempo real** durante la descarga
- 🎯 **Nombre personalizable** para el archivo ZIP
- ⚡ **Interfaz moderna y responsiva** con diseño de gradiente
- ❌ **Cancelación de descargas** en cualquier momento
- �️ **Privacidad garantizada** - todo se procesa localmente

## 📋 Requisitos

- Chrome 88 o superior (o navegadores basados en Chromium)
- Acceso a Internet
- Permisos para ejecutar scripts en páginas web

## 🚀 Instalación

1. Clona o descarga este repositorio
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo de desarrollador" (esquina superior derecha)
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta `flaticon-downloader`

## 📁 Estructura del Proyecto

```
flaticon-downloader/
├── manifest.json              # Configuración de la extensión
├── package.json               # Metadatos del proyecto
├── README.md                  # Este archivo
├── .gitignore                 # Archivos ignorados por Git
├── assets/
│   └── icons/
│       ├── icon-16.png        # Icono pequeño (16x16)
│       ├── icon-48.png        # Icono mediano (48x48)
│       └── icon-128.png       # Icono grande (128x128)
├── libs/
│   └── jszip.min.js           # Librería para crear archivos ZIP (v3.10.0)
└── src/
    ├── popup.html             # Interfaz principal
    ├── popup.css              # Estilos (gradiente y responsive)
    └── popup.js               # Lógica de la extensión
```

## 💡 Cómo usar

1. Navega a una página de Flaticon con iconos
2. Haz clic en el icono de la extensión en la barra de herramientas
3. Haz clic en "Iniciar Descarga"
4. Espera a que se detecten y descarguen los iconos
5. Personaliza el nombre del archivo ZIP si lo deseas
6. Haz clic en "Guardar" para descargar el ZIP

## 🎨 Características Técnicas

- **Manifest v3** - Último estándar de Chrome (más seguro y eficiente)
- **Scripting API** - Acceso seguro a las páginas web
- **Fetch API** - Descargas eficientes y paralelas
- **JSZip** - Creación de archivos ZIP en el navegador sin servidor
- **Responsive Design** - Interfaz adaptable a cualquier pantalla
- **Gradient UI** - Diseño moderno con efectos visuales atractivos

## 📊 Estadísticas en Tiempo Real

Durante la descarga se muestran:
- 🔍 Imágenes encontradas en total
- ✅ Imágenes descargadas correctamente
- ❌ Errores durante la descarga
- ⏱️ Tiempo total de descarga
- 📦 Tamaño total del archivo ZIP

## 🐛 Solución de Problemas

### ❓ ¿No encuentra iconos?
- Asegúrate de estar en una página de Flaticon válida (flaticon.com)
- Verifica que los iconos sean de `cdn-icons-png.flaticon.com`
- Recarga la página e intenta de nuevo

### ❓ ¿Error de CORS?
- Es una limitación del navegador por seguridad
- La extensión intenta trabajar alrededor de estas limitaciones
- Algunos iconos pueden no descargarse debido a restricciones CORS

### ❓ ¿La descarga es muy lenta?
- Los servidores de Flaticon pueden estar bajo carga
- Prueba descargando una cantidad menor de iconos primero
- Revisa tu conexión a Internet

### ❓ ¿El ZIP está vacío o corrupto?
- Cierra Chrome completamente e intenta de nuevo
- Vacía la caché de la extensión
- Recarga la extensión en `chrome://extensions/`

## 🔒 Privacidad

Esta extensión:
- ✅ No recopila datos personales
- ✅ No envía información a servidores externos
- ✅ Procesa todo localmente en tu navegador
- ✅ Código 100% libre y open source
- ✅ Sin cookies ni rastreo

## 📝 Licencia

Este proyecto es de código abierto y está disponible para uso personal y educativo.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, siéntete libre de:
- Reportar bugs
- Sugerir mejoras
- Enviar pull requests

---

**Versión:** 1.0  
**Última actualización:** Octubre 2025