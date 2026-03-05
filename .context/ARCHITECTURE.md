# Arquitectura del Proyecto QuickWick

## 1. Visión General
QuickWick se concibe como una extensión modular para VS Code, diseñada para asistir a los desarrolladores en la arquitectura y generación de proyectos "sin deuda técnica". Su arquitectura se basa en la interacción de una interfaz de usuario web (React Webview), un motor de generación de proyectos (Node.js) y un sistema de plantillas flexible (Handlebars), todo orquestado por la API de extensión de VS Code.

## 2. Componentes Clave

### 2.1. Interfaz de Usuario (UI) - `app/QUICKWICK.jsx`
*   **Tecnología**: React (Componentes Funcionales).
*   **Implementación**: Se ejecuta como una Webview aislada dentro de VS Code.
*   **Responsabilidad**: Captura la descripción del proyecto del usuario, guía a través de la selección del stack tecnológico, permite la configuración de parámetros específicos, integra el selector y la gestión BYOK para LLMs, y serializa todas las selecciones en un objeto JSON (`config`). Muestra la vista previa del `contract.md` y comunica el `config` al host de la extensión vía `postMessage`.

### 2.2. Lógica de Generación - `app/generator.js`
*   **Tecnología**: Node.js 18+.
*   **Responsabilidad**: Recibe el objeto `config` JSON desde la extensión de VS Code. Determina el conjunto de plantillas (`templates/`) a utilizar, utiliza `Handlebars` para compilar y renderizar los archivos de plantilla (`.hbs`) con los datos provistos en la `config`, y escribe los archivos resultantes en el sistema de archivos del workspace del usuario. Gestiona la inicialización opcional de un repositorio Git.

### 2.3. Sistema de Plantillas - `templates/`
*   **Tecnología**: Handlebars (`.hbs`).
*   **Estructura**: Directorios organizados por categoría de stack (base, frontend, backend, database, auth, deployment, docs).
*   **Responsabilidad**: Contener las estructuras de código, archivos de configuración y documentación para los diferentes stacks tecnológicos soportados. Actúa como la "base de conocimiento" de arquitecturas y patrones de código para QuickWick.

### 2.4. Integración con VS Code Extension API
*   **Tecnología**: JavaScript (con roadmap a TypeScript).
*   **Responsabilidad**: Activar la Webview que aloja `QUICKWICK.jsx`, escuchar los mensajes (`postMessage`) de la Webview, invocar `app/generator.js` con la `config` recibida, y manejar la interacción con el sistema de archivos de VS Code y el workspace. Expone comandos (e.g., `quickwick.generateFromConfig`).

## 3. Stack Tecnológico Principal
*   **Runtime Principal**: `Node.js 18+` (para `generator.js` y el host de la extensión).
*   **Interfaz de Usuario**: `React` (para la Webview en `QUICKWICK.jsx`).
*   **Motor de Plantillas**: `Handlebars` (para procesar `templates/*.hbs`).
*   **Extensión VS Code**: `VS Code Extension API` (para la interacción con el editor).
*   **Integración LLM**: `Gemini (Cloud)`, `OpenAI (Cloud)`, `Ollama (Local)`.

## 4. Patrones de Diseño Clave
*   **Webview Architecture**: Aislamiento de la UI del host de la extensión, comunicándose vía `postMessage`.
*   **Command Pattern**: La extensión de VS Code expone comandos para la ejecución de la lógica de generación.
*   **Template Method / Strategy**: La función `determineTemplates(config)` en `generator.js` orquesta la selección y aplicación de plantillas de forma modular y extensible, basada en la configuración.
*   **BYOK (Bring Your Own Key)**: Para las integraciones con LLM, se prioriza que el usuario provea sus propias API Keys, garantizando flexibilidad y control.

## 5. Flujo de Datos Principal
1.  **Inicio**: El usuario activa un comando de QuickWick en VS Code.
2.  **UI Webview**: Se lanza la Webview que aloja `QUICKWICK.jsx`.
3.  **Configuración**: El usuario interactúa con la UI, provee detalles del proyecto y selecciona el stack. Opcionalmente, interactúa con LLMs para sugerencias de stack.
4.  **Serialización**: `QUICKWICK.jsx` consolida todas las selecciones en un objeto JSON `config`.
5.  **Comunicación Webview -> Extensión**: La `config` se envía al host de la extensión de VS Code vía `postMessage`.
6.  **Orquestación de Extensión**: La extensión recibe la `config` y llama a `generateProject(config, workspacePath)` en `app/generator.js`.
7.  **Generación de Archivos**: `generator.js` procesa la `config` con las plantillas de `templates/` y escribe los archivos en el `workspacePath` del usuario.
8.  **Finalización**: El proyecto es creado, y se ofrece inicialización de Git.

## 6. Evolución Arquitectónica (Roadmap)
*   **Tipado Estricto**: Migración de la base de código principal a TypeScript para una mayor robustez y mantenibilidad.
*   **Marco de Pruebas**: Implementación de pruebas unitarias y de integración para asegurar la calidad y estabilidad del generador y la UI.
*   **Seguridad Mejorada**: Uso de la API de Secretos de VS Code para una gestión más segura y persistente de las API keys en entornos de producción de la extensión.
*   **Contexto Persistente para Proyectos Generados**: Implementación de la generación del `contract.md` y la carpeta `.context/` para los proyectos que QuickWick crea, facilitando futuras interacciones de IA o comprensión del proyecto.