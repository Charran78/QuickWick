# Declaración de Trabajo (Statement of Work - SOW) para QuickWick (Prototipo Local)

## 1. Propósito
Este documento define el alcance del prototipo actual del proyecto QuickWick, una extensión de VS Code diseñada para arquitectar y generar proyectos, enfatizando la visión de "cero deuda técnica" desde el inicio y funcionando como un arquitecto de software virtual.

## 2. Alcance del Prototipo (In-Scope)

### 2.1. Funcionalidad del Generador
*   **Generación de Proyectos Base**: Implementación de la lógica en `app/generator.js` para crear la estructura de carpetas y archivos base de un proyecto según el stack seleccionado por el usuario.
*   **Soporte de Stacks Tecnológicos**: Implementación de plantillas en `templates/` para los siguientes stacks:
    *   **Frontend**: React + Vite, Vanilla HTML/CSS/JS.
    *   **Backend**: Node.js + Express, Python + FastAPI.
    *   **Base de Datos**: PostgreSQL (con configuración Docker Compose).
    *   **Autenticación**: Firebase Auth, Auth0, JWT (middleware Express).
    *   **Despliegue**: Vercel, Netlify, Dockerfile (multientorno).
*   **Aplicación de Plantillas**: Uso del motor Handlebars para procesar las plantillas (`templates/*.hbs`) y generar el contenido de los archivos finales utilizando los datos de configuración.
*   **Escritura en Workspace**: Capacidad de escribir los archivos generados directamente en el workspace activo de VS Code del usuario.
*   **Inicialización de Git**: Opción para inicializar un repositorio Git en el directorio raíz del proyecto generado.

### 2.2. Interfaz de Usuario (UI)
*   **Wizard Interactivo**: Desarrollo de una interfaz de usuario React funcional (`app/QUICKWICK.jsx`) dentro de una webview de VS Code para guiar al usuario a través del proceso de configuración del proyecto.
*   **BYOK para LLMs**: Implementación de campos en la UI para que el usuario introduzca sus propias API Keys de Gemini y OpenAI, y seleccione el modelo de LLM deseado.
*   **Detección de Ollama Local**: Funcionalidad en la UI para detectar y listar los modelos de Ollama disponibles localmente (`/api/tags`) y permitir su selección.
*   **Vista Previa del Contrato**: Presentación de una vista previa del `contract.md` que se generaría para el proyecto destino, permitiendo la revisión antes de la generación.

### 2.3. Integración con LLMs
*   **Conectividad Multi-LLM**: Capacidad de interactuar con Gemini (Cloud), OpenAI (Cloud) y Ollama (Local) a través de una API unificada (`callLLM` en `app/QUICKWICK.jsx`).
*   **Sugerencia de Stack**: Utilización de la IA para analizar la descripción del proyecto del usuario y sugerir un stack tecnológico inicial, que el usuario puede ajustar.

### 2.4. Gestión de Contexto y Documentación
*   **Serialización de Configuración**: Creación de un objeto JSON (`selections` o `config`) que encapsula todas las decisiones del usuario, sirviendo como el único punto de verdad para el proceso de generación en `generator.js`.
*   **Generación de Documentación Básica para Proyectos Destino**: Creación de plantillas para `README.md`, `explanation.md`, `next-steps.md`, `glossary.md` en la carpeta `docs/` de los proyectos generados, proporcionando una base documental.
*   **Roadmap: Generación de Contexto Persistente para Proyectos Destino**: Planificado para generar `contract.md` y la carpeta `.context/` (con artefactos más detallados) dentro de los proyectos creados por QuickWick, sirviendo como un resumen persistente de decisiones arquitectónicas.

## 3. Fuera del Alcance del Prototipo (Out-of-Scope)
*   **Publicación en VS Code Marketplace**: El alcance actual se limita al desarrollo y prueba local del prototipo; la publicación es una fase posterior y requiere consideraciones adicionales de empaquetado y seguridad.
*   **Implementación Completa de Seguridad en Producción**: Aunque se han identificado recomendaciones de seguridad (ej., uso de VS Code Secrets API para API Keys), su implementación robusta y certificada para un entorno de producción de la extensión queda fuera de este prototipo.
*   **Suite de Pruebas Completa**: Aunque se define una "Definición de Hecho" que incluye requisitos de pruebas unitarias y de integración, la implementación completa de suites exhaustivas para el 80% de cobertura en lógica y 70% en UI está en el roadmap, no en el alcance inicial del prototipo.
*   **Migración a TypeScript**: La refactorización de `app/QUICKWICK.jsx` y `app/generator.js` a TypeScript, aunque recomendada, está planificada para una fase posterior y no es parte del alcance del prototipo inicial.
*   **Funcionalidades Avanzadas de IA**: Más allá de la sugerencia inicial del stack y la generación de contenido basado en plantillas, la IA no se utilizará para refactorización de código existente, análisis de deuda técnica *en vivo* en proyectos generados, o gestión continua del ciclo de vida del software en el proyecto destino.
*   **Integración de CI/CD para QuickWick**: La automatización de pruebas y despliegue para el propio QuickWick está fuera del alcance de este prototipo.
*   **Monitoreo y Telemetría**: La recopilación de métricas de uso o rendimiento de la extensión no está incluida en el prototipo actual.