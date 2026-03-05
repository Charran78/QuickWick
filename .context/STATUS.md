# Estado del Proyecto QuickWick

## Estado Actual
**QuickWick** se encuentra en una fase de **prototipo funcional** para desarrollo y uso local. Ha demostrado la capacidad de actuar como un arquitecto de software y generador de proyectos dentro de VS Code, traduciendo ideas en lenguaje natural y decisiones guiadas en estructuras de proyecto completas con stacks tecnológicos alineados. Actualmente, no está publicado en el VS Code Marketplace.

## Hitos Completados
*   **Wizard Genesis UI (React)**: Interfaz de usuario interactiva en `app/QUICKWICK.jsx` para la configuración de proyectos.
*   **Lógica de Generación (Node.js)**: `app/generator.js` para procesar configuraciones y aplicar plantillas.
*   **Integración LLM (BYOK)**: Conectividad con Gemini, OpenAI y Ollama (local), con selección de proveedor/modelo y gestión de claves por el usuario.
*   **Set de Plantillas Inicial**: Soporte para stacks Frontend (React+Vite, Vanilla), Backend (Node+Express, Python+FastAPI), DB (PostgreSQL), Auth (Firebase, Auth0, JWT), y Despliegue (Vercel, Netlify, Docker) en `templates/`.
*   **Generación de Documentación Básica**: Inclusión de plantillas para `README`, `explanation.md`, `next-steps.md`, `glossary.md` en los proyectos generados.
*   **Definición de Contrato Técnico**: El proyecto QuickWick tiene una base sólida en su "Contrato Técnico del Proyecto QuickWick" como documento fundacional.

## Bloqueadores y Limitaciones Actuales
*   **Despliegue/Publicación**: El prototipo no está empaquetado para su distribución en el VS Code Marketplace.
*   **Seguridad de Secretos en Producción**: La gestión de API Keys en la UI (BYOK) es funcional para el prototipo, pero requiere una implementación de producción más robusta (e.g., VS Code Secrets API) para evitar la persistencia y exposición en entornos no efímeros.
*   **Pruebas Exhaustivas**: Las pruebas unitarias y de integración son parte del roadmap y no están completamente implementadas para cubrir la "Definición de Hecho" en su totalidad.
*   **Tipado Estricto**: La migración a TypeScript para `QUICKWICK.jsx` y `generator.js` es una recomendación y no está implementada.
*   **Gestión de Dependencias**: No se ha proporcionado un `package.json` explícito para este prototipo, lo que asume el uso de librerías estándar y puede dificultar la replicación del entorno exacto.

## Próximos Pasos (Roadmap)
*   Implementación de pruebas unitarias y de integración (80% para lógica, 70% para UI).
*   Migración de `app/QUICKWICK.jsx` y `app/generator.js` a TypeScript.
*   Reforzar las medidas de seguridad para el manejo de secretos en un entorno de producción (VS Code Secrets API).
*   Desarrollar la funcionalidad para que QuickWick genere su propio `contract.md` y carpeta `.context/` para los proyectos *generados*, encapsulando su contexto arquitectónico y de stack.
*   Exploración de la publicación en el VS Code Marketplace.