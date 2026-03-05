# Registro de Cambios

## 1.0.0-prototype - 2024-07-29 (Fecha de Creación/Incialización)

### ✨ Características Nuevas
*   **Lanzamiento Inicial del Prototipo Funcional**: Se establece la base de QuickWick como arquitecto y generador de proyectos VS Code, siguiendo la visión de "cero deuda técnica".
*   **Wizard Génesis (UI React)**: Implementación de la interfaz de usuario en `app/QUICKWICK.jsx` para la configuración interactiva y guiada de proyectos.
*   **Generador Core (Node.js)**: Desarrollo de `app/generator.js` para procesar configuraciones JSON y aplicar plantillas Handlebars (`templates/`).
*   **Integración Multi-LLM (BYOK)**: Soporte para Gemini, OpenAI y Ollama (local) con gestión de API keys por el usuario y selección de modelo.
*   **Conjunto de Plantillas Inicial**: Inclusión de plantillas para stacks populares (React+Vite, Node+Express, FastAPI, PostgreSQL, Auth0, Firebase, JWT, Vercel, Netlify, Docker).
*   **Generación de Documentación Básica**: Capacidades para generar `README.md`, `explanation.md`, `next-steps.md`, `glossary.md` en el proyecto generado.
*   **Contrato Técnico del Proyecto**: Establecimiento del `Contrato Técnico del Proyecto QuickWick` como documento fundacional que define la filosofía, arquitectura y estándares de calidad de la extensión.

### 🛠 Mejoras
*   **Modularidad de Plantillas**: Estructuración lógica de `templates/` por categorías para facilitar la extensibilidad y mantenibilidad.
*   **Lógica de Llamada a LLM Unificada**: Consolidación de la interacción con diferentes proveedores de LLM en la función `callLLM` para una gestión consistente y simplificada.

### 🐛 Correcciones de Errores
*   *Ninguna corrección de error significativa reportada en esta fase inicial de prototipo funcional.*

### 📝 Documentación
*   Creación del "Contrato Técnico del Proyecto QuickWick" detallando la filosofía, arquitectura y DoD del proyecto.
*   Documentación inicial en `README.md` del repositorio y `TXT/` con notas de diseño funcional para el setup de desarrollo local de QuickWick.

### 🚨 Notas
*   Este es un prototipo para desarrollo y uso local; no está destinado a ser publicado en un entorno de producción en esta etapa.
*   La seguridad de las API keys en un entorno de producción de la extensión debe ser reforzada siguiendo las mejores prácticas de VS Code Extension API.
*   La implementación completa de pruebas unitarias/integración y la migración a TypeScript están definidas como próximos pasos en el roadmap del proyecto.