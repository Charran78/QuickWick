# Especificaciones del Proyecto QuickWick

## 1. Requisitos Funcionales (RF)

### RF1: Generación de Proyectos
*   **RF1.1**: Permitir al usuario introducir una descripción del proyecto en lenguaje natural o una URL de repositorio para inicializar la configuración del stack.
*   **RF1.2**: Guiar al usuario a través de una serie de decisiones estructuradas (Metadatos, Frontend, Backend/DB, Infra, Gobernanza, IA, Docs) para configurar el stack tecnológico deseado.
*   **RF1.3**: Generar una estructura de proyecto completa, incluyendo archivos de configuración, código fuente base y scripts, basada en la configuración seleccionada.
*   **RF1.4**: Utilizar plantillas Handlebars (`templates/`) para la generación dinámica del contenido de los archivos.
*   **RF1.5**: Escribir los archivos del proyecto generado directamente en el workspace abierto de VS Code del usuario.
*   **RF1.6**: Ofrecer la opción de inicializar un repositorio Git en el proyecto generado.

### RF2: Integración con Modelos de Lenguaje Grandes (LLM)
*   **RF2.1**: Permitir la selección del proveedor de IA entre Gemini, OpenAI y Ollama.
*   **RF2.2**: Implementar un mecanismo "Bring Your Own Key" (BYOK) para API keys de Gemini y OpenAI, asegurando que las claves no persistan en el código fuente ni en el almacenamiento local del navegador (webview).
*   **RF2.3**: Permitir al usuario elegir el modelo específico dentro del proveedor seleccionado (e.g., `gemini-2.5-flash-preview-09-2025`, `gpt-4o`, `gpt-4o-mini`).
*   **RF2.4**: Detectar y listar automáticamente los modelos locales disponibles de Ollama a través de la API `/api/tags`.
*   **RF2.5**: Consolidar la lógica de llamada a los diferentes proveedores de LLM en una función unificada (`callLLM` en `app/QUICKWICK.jsx`).
*   **RF2.6**: Utilizar el LLM para sugerir un stack tecnológico inicial basado en la descripción del proyecto del usuario.

### RF3: Interfaz de Usuario (UI)
*   **RF3.1**: Proporcionar una interfaz de usuario interactiva y responsiva implementada en React (`app/QUICKWICK.jsx`) que se ejecuta como una webview dentro de VS Code.
*   **RF3.2**: Mostrar visualmente las decisiones del usuario y el stack tecnológico seleccionado durante el proceso de configuración.
*   **RF3.3**: Generar y mostrar una vista previa del "contrato técnico" (`contract.md`) que QuickWick creará para el proyecto generado, antes de su despliegue final.

### RF4: Generación de Documentación para Proyectos Objetivo
*   **RF4.1**: Generar un archivo `README.md` completo para el proyecto destino, describiendo su propósito, setup y uso.
*   **RF4.2**: Generar un archivo `explanation.md` detallando las decisiones arquitectónicas y tecnológicas clave del proyecto generado.
*   **RF4.3**: Generar un archivo `next-steps.md` con recomendaciones claras para el desarrollo futuro y la evolución del proyecto.
*   **RF4.4**: Generar un archivo `glossary.md` con términos técnicos y conceptos clave específicos del proyecto.
*   **RF4.5**: (Roadmap) Generar un `contract.md` y una carpeta `.context/` con artefactos contextuales detallados (e.g., diagramas, glosarios) para el proyecto *generado*, sirviendo como una fuente de verdad compactada para futuras interacciones.

## 2. Requisitos No Funcionales (RNF)

### RNF1: Rendimiento
*   **RNF1.1**: La generación de un proyecto de complejidad media debe completarse en un tiempo razonable (ej. < 10 segundos para la escritura de archivos). 
*   **RNF1.2**: Las llamadas a los LLM deben ser asíncronas y no bloquear la interfaz de usuario.

### RNF2: Usabilidad
*   **RNF2.1**: La interfaz del wizard debe ser intuitiva y fácil de usar, incluso para desarrolladores sin experiencia profunda en arquitectura o con la extensión.
*   **RNF2.2**: Los mensajes de error y las guías de usuario deben ser claros, concisos y útiles, ofreciendo acciones correctivas cuando sea posible.

### RNF3: Mantenibilidad
*   **RNF3.1**: El código base de QuickWick debe seguir los principios de alta cohesión (cada módulo o función hace una única cosa bien) y bajo acoplamiento (dependencias mínimas entre módulos).
*   **RNF3.2**: Las funciones en `app/generator.js` y los métodos en `app/QUICKWICK.jsx` no deben exceder las 50 líneas de código significativas (excluyendo comentarios y declaraciones triviales), a menos que se justifique explícitamente la complejidad.
*   **RNF3.3**: La arquitectura debe ser modular y extensible, facilitando la adición de nuevas plantillas, stacks tecnológicos y funcionalidades sin afectar el core.
*   **RNF3.4**: (Roadmap) El código de `app/QUICKWICK.jsx` y `app/generator.js` debería migrar a TypeScript para mejorar la robustez, la detección de errores en tiempo de desarrollo y la facilidad de mantenimiento a largo plazo.

### RNF4: Seguridad
*   **RNF4.1**: Las API keys de LLM son introducidas por el usuario (BYOK) y **no deben persistir** en el código fuente, en el almacenamiento local del navegador (webview), ni ser transmitidas a servicios de IA de forma no explícita o sin consentimiento claro.
*   **RNF4.2**: Se debe implementar validación y sanitización estricta de todas las entradas del usuario para prevenir inyecciones de código o otras vulnerabilidades.
*   **RNF4.3**: (Recomendación de Producción) Para una extensión publicada, las llamadas a la IA deberían originarse desde el host de la extensión (Node.js) utilizando las API de secretos de VS Code o variables de entorno del sistema (`process.env`) para una gestión de claves más segura.

### RNF5: Calidad del Código (DoD)
*   **RNF5.1**: (Roadmap) Implementar pruebas unitarias para las funciones críticas en `app/generator.js` (aspirando a un 80% de cobertura) y para los componentes clave de `app/QUICKWICK.jsx` (aspirando a un 70% de cobertura).
*   **RNF5.2**: Adherencia a los estándares de código definidos (ESLint y Prettier configuraciones para el futuro producto).
*   **RNF5.3**: Todo cambio significativo de código (Pull Request) debe pasar por una revisión y aprobación por al menos otro desarrollador senior del equipo, verificando la adherencia a los estándares y la arquitectura.
*   **RNF5.4**: La documentación interna y los comentarios de código deben ser claros, completos y actualizados para reflejar cualquier nueva característica o modificación.

### RNF6: Gobernanza de IA
*   **RNF6.1**: El usuario siempre será consciente de qué proveedor de IA (Gemini, OpenAI, Ollama) y qué modelo se está utilizando para generar sugerencias o contenido.
*   **RNF6.2**: El usuario tendrá control total sobre la elección del proveedor, el modelo y el suministro de claves (BYOK), garantizando la flexibilidad y la soberanía sobre el uso de la IA.
*   **RNF6.3**: Se fomentará la revisión y validación del código y la documentación generada por la IA para asegurar la adherencia a las buenas prácticas, la exactitud y la ausencia de sesgos o vulnerabilidades.