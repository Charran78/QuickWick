# 🤝 Contrato Técnico del Proyecto QuickWick (Prototipo Local)

Este documento establece la filosofía, arquitectura y estándares de calidad para el desarrollo y evolución de QuickWick, una extensión de VS Code concebida como arquitecto de software y generador de proyectos.

---

## 1. 🤝 Filosofía y Roles

En QuickWick, operamos bajo una filosofía de **Senior Partnership** y mejora continua (Kaizen). Cada contribución busca no solo añadir funcionalidad, sino elevar la calidad y mantenibilidad del sistema.

*   **Visión Kaizen**: Nos comprometemos a refinar constantemente la calidad de los proyectos generados y la experiencia del desarrollador. Priorizamos la anticipación y mitigación de la deuda técnica desde la concepción del proyecto, asegurando que QuickWick sea una herramienta que *genera* código robusto y bien estructurado, no lo contrario.
*   **Rol del Arquitecto (QuickWick)**: La extensión QuickWick actúa como el arquitecto principal, traduciendo ideas en lenguaje natural y decisiones guiadas en estructuras de proyecto completas y stacks tecnológicos alineados. Su objetivo es generar proyectos "sin deuda técnica".
*   **Rol del Desarrollador**: El desarrollador es el catalizador que alimenta QuickWick con la visión del proyecto y valida las decisiones de stack. Su rol es extender y mejorar las plantillas (`templates/`), afinar la lógica de generación (`app/generator.js`) y asegurar la fiabilidad de la interfaz (`app/QUICKWICK.jsx`).

---

## 2. 🏗️ Arquitectura y Límites

QuickWick se concibe como un sistema modular, centrado en la flexibilidad de sus plantillas y la robustez de su lógica de generación.

### 2.1. Stack Tecnológico Detectado (Actual)

*   **Runtime Principal**: `Node.js 18+` (para `app/generator.js` y el host de la extensión VS Code).
*   **Interfaz de Usuario (Webview)**: `React` (implementado en `app/QUICKWICK.jsx`).
*   **Motor de Plantillas**: `Handlebars` (utilizado en `app/generator.js` para procesar `templates/*.hbs`).
*   **Extensión VS Code**: `VS Code Extension API` (interacción con `vscode` en el host).
*   **Integración LLM (BYOK)**:
    *   `Gemini (Cloud)`: Modelo por defecto `gemini-2.5-flash-preview-09-2025` (configurable).
    *   `OpenAI (Cloud)`: Modelos como `gpt-4o`, `gpt-4o-mini` (configurable).
    *   `Ollama (Local)`: Detección automática de modelos locales a través de `/api/tags`.
*   **Stacks Generables (Current Template Set)**:
    *   **Frontend**: `React + Vite`, `Vanilla HTML/CSS/JS`.
    *   **Backend**: `Node.js + Express`, `Python + FastAPI`.
    *   **Base de Datos**: `PostgreSQL + Docker Compose`.
    *   **Autenticación**: `Firebase Auth`, `Auth0`, `JWT (middleware Express)`.
    *   **Despliegue**: `Vercel`, `Netlify`, `Dockerfile` (multientorno).
*   **Dependencias Explícitas**: No se ha proporcionado un `package.json` para este prototipo de laboratorio, por lo que las dependencias exactas no pueden ser listadas aquí. Se asume el uso de librerías estándar para React y Handlebars.

### 2.2. Estructura de Directorios Clave

text
QuickWick/
├─ app/                     # Lógica principal y UI del wizard
│  ├─ QUICKWICK.jsx          # Componente React principal (UI del wizard Génesis)
│  └─ generator.js           # Lógica Node.js para la generación de proyectos
├─ templates/               # Repositorio de plantillas Handlebars
│  ├─ base/                  # Plantillas base (.gitignore, README, LICENSE)
│  ├─ frontend/              # Plantillas para stacks frontend
│  ├─ backend/               # Plantillas para stacks backend
│  ├─ database/              # Plantillas para configuraciones de base de datos
│  ├─ auth/                  # Plantillas para sistemas de autenticación
│  ├─ deployment/            # Plantillas para configuraciones de despliegue
│  └─ docs/                  # Plantillas para documentación (explanation.md, next-steps.md, glossary.md)
├─ codigo legacy/           # Referencia histórica, no para uso activo
└─ TXT/                     # Notas de diseño funcional, no para uso activo


### 2.3. Patrones de Diseño Utilizados

*   **Webview Architecture**: La UI de React (`QUICKWICK.jsx`) se ejecuta como una webview dentro de VS Code, comunicándose con la extensión mediante `postMessage`.
*   **Command Pattern**: La extensión de VS Code expone comandos (e.g., `quickwick.generateFromConfig`) para la ejecución de la lógica de generación.
*   **Template Method / Strategy**: La función `determineTemplates(config)` en `generator.js` orquesta la selección de plantillas basadas en la configuración del usuario, aplicando el contenido dinámicamente.
*   **BYOK (Bring Your Own Key)**: Para las integraciones con LLM, se prioriza que el usuario provea sus propias API Keys, garantizando flexibilidad y control.

### 2.4. Límites de Funciones y Componentes

*   **Cohesión y Acoplamiento**: Las funciones y componentes deben tener una alta cohesión (hacer una única cosa bien) y un bajo acoplamiento.
*   **Longitud de Funciones**: Las funciones en `app/generator.js` y los métodos en `app/QUICKWICK.jsx` no deben exceder las **50 líneas de código significativas** (excluyendo comentarios y declaraciones triviales), a menos que se justifique con una explicación clara de la complejidad inherente. Se prioriza la legibilidad y la capacidad de prueba.
*   **Componentes React**: Los componentes funcionales deben ser puros cuando sea posible y manejar su propio estado mínimo. La lógica compleja de efectos secundarios debe ser encapsulada en `useEffect` o custom hooks.

---

## 3. 🛡️ Auditoría y Seguridad

La seguridad y la calidad del código son pilares fundamentales, especialmente al generar código para terceros.

### 3.1. Reglas de Código Estático

Aunque no se han especificado configuraciones de linting para este prototipo, para la fase de producto se aplicarán:

*   **ESLint**: Con configuraciones `eslint:recommended`, `plugin:react/recommended` (para JSX), y reglas de consistencia de código.
*   **TypeScript**: Se recomienda la migración de `QUICKWICK.jsx` y `generator.js` a TypeScript para mejorar la robustez y facilitar el mantenimiento, utilizando `tsconfig.json` con `strict: true`.
*   **Prettier**: Formateo automático de código (`.js`, `.jsx`, `.md`, `.json`) para garantizar una base de código consistente.

### 3.2. Manejo de Secretos y Variables de Entorno

*   **API Keys (BYOK)**: Las API keys de Gemini y OpenAI son introducidas por el usuario en la UI (`app/QUICKWICK.jsx`) y **no deben persistir** en el código fuente ni en el almacenamiento local del navegador (webview).
*   **Riesgos Actuales del Prototipo**: En el modo de desarrollo actual (local, webview sin empaquetar), las claves permanecen en el estado efímero de la webview.
*   **Recomendación de Producción**: Para una extensión publicada, se deberá:
    *   Mover las llamadas a la IA desde la webview al host de la extensión (Node.js) o a un servicio backend dedicado.
    *   Utilizar las API de secretos de VS Code o variables de entorno del sistema (`process.env`) para manejar las claves de forma segura en el host.
    *   Implementar validación y sanitización estricta de todas las entradas del usuario para prevenir inyecciones o vulnerabilidades.

### 3.3. Gobernanza de IA

*   **Transparencia**: El usuario siempre será consciente de qué proveedor de IA (Gemini, OpenAI, Ollama) y qué modelo se está utilizando.
*   **Control del Usuario**: La capacidad de elegir el proveedor y el modelo, así como de traer sus propias claves (BYOK), otorga al usuario el control total sobre el uso de la IA.
*   **Privacidad**: Ninguna clave o dato sensible del usuario será almacenado o transmitido a servicios de IA de forma no explícita o sin consentimiento claro. El código generado por la IA debe ser revisado y validado antes de ser persistido.
*   **Auditoría de Salida**: Se fomentará la revisión del código y la documentación generada por la IA para asegurar la adherencia a buenas prácticas y la ausencia de sesgos o vulnerabilidades.

---

## 4. 🔄 Gestión de Contexto

El contexto es el alimento de QuickWick. Su gestión eficiente es crucial para la precisión y relevancia de los proyectos generados.

*   **Contexto de Entrada (para LLM)**: La descripción del proyecto en lenguaje natural y las selecciones guiadas del usuario (Metadatos, Frontend, Backend/DB, Infra, Gobernanza, IA, Docs) conforman el contexto principal para la IA, que sugiere el stack tecnológico.
*   **Contexto de Generación (JSON `config`)**: Las decisiones consolidadas del wizard se serializan en un objeto JSON (`selections` o `config`). Este JSON es el contrato entre la UI y el `generator.js`, y actúa como el único punto de verdad para la generación del proyecto.
*   **Contexto Generado (`contract.md`, `.context/`)**: QuickWick tiene como roadmap generar su propio contrato técnico (`contract.md`) y una carpeta `.context/` dentro del workspace del proyecto generado. Esto servirá para:
    *   **Compactar Contexto**: Crear un resumen persistente de las decisiones arquitectónicas y del stack.
    *   **Protocolo de Resumen**: `contract.md` actuará como el resumen ejecutivo, mientras que `.context/` podría albergar artefactos más detallados (diagramas, glosarios específicos del proyecto generado, etc.).
    *   **Propósito**: Facilitar la orientación a nuevos miembros del equipo y servir como referencia rápida del proyecto.
*   **Reglas de Compactación (Futuro)**: Para las interacciones futuras con LLMs (por ejemplo, para refactorizaciones o adiciones de características al proyecto generado), el `contract.md` y `.context/` serán la fuente de verdad compactada, evitando tener que re-inferir el stack desde cero.

---

## 5. 🧪 Calidad y DoD — Definición de "Hecho"

Para que una tarea se considere "Hecha" en QuickWick, debe cumplir con los siguientes criterios:

*   **Funcionalidad**:
    *   El código implementado resuelve el problema o añade la característica según lo previsto en la descripción de la tarea.
    *   El wizard (`QUICKWICK.jsx`) genera correctamente la configuración JSON esperada.
    *   El generador (`generator.js`) es capaz de procesar la configuración y escribir los archivos esperados en el workspace, sin errores de compilación o ejecución en las plantillas.
    *   El proyecto generado (en cualquiera de sus stacks) es ejecutable y funcional en su forma más básica (por ejemplo, `npm install` y `npm start` funcionan).
*   **Pruebas (Roadmap)**:
    *   **Unitarias**: Las funciones críticas en `generator.js` (e.g., `determineTemplates`, la lógica de compilación de Handlebars) y los componentes clave de `QUICKWICK.jsx` deben tener pruebas unitarias que cubran los casos principales y los edge cases.
    *   **Integración**: Pruebas que validen el flujo completo desde la UI hasta la generación de archivos, asegurando que el JSON de configuración se transforma correctamente en archivos en disco.
    *   **Cobertura**: Se aspirará a una cobertura de pruebas mínima del **80%** para la lógica de generación (`app/generator.js`) y un **70%** para la UI (`app/QUICKWICK.jsx`).
*   **Revisión de Código (Code Review)**:
    *   Todo cambio significativo de código (Pull Request) debe ser revisado y aprobado por al menos otro desarrollador senior del equipo.
    *   Los revisores verificarán la adherencia a los estándares de código, la claridad, la eficiencia, la seguridad y la adecuación a la arquitectura.
*   **Documentación**:
    *   Cualquier nueva característica o modificación de plantillas debe ir acompañada de una actualización o adición a la documentación interna (si aplica) y a los comentarios de código.
    *   Las plantillas de documentación generadas por QuickWick (ej. `explanation.md`) deben ser claras y completas para el proyecto de destino.
*   **Definición de "Hecho" Específica de QuickWick**:
    *   Un nuevo stack o plantilla es "Hecho" cuando se puede seleccionar desde la UI, se genera correctamente y el proyecto resultante cumple con los requisitos mínimos de funcionalidad y ausencia de deuda técnica.
    *   La generación de un `contract.md` para el proyecto de destino se considera "Hecha" cuando su contenido es preciso, conciso y útil para la orientación inicial.

---