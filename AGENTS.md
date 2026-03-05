## Contexto del proyecto
Antes de realizar cualquier cambio, lee:
1. .context/STATUS.md — estado actual y bloqueadores del proyecto QuickWick.
2. .context/SPECS.md — requisitos funcionales y no funcionales detallados de QuickWick.
3. .context/SOW.md — alcance definido para el prototipo actual de QuickWick (qué está dentro y fuera del alcance).
4. .context/ARCHITECTURE.md — decisiones arquitectónicas clave, componentes, stack tecnológico y patrones de diseño de QuickWick.
5. contract.md — la constitución del proyecto (filosofía, roles, reglas de gobernanza, y la 'Definición de Hecho').

## Roles y Responsabilidades en el Ecosistema QuickWick

### 1. El Desarrollador / Contribuidor
Tu rol es fundamental para la evolución y calidad de QuickWick. Eres el **catalizador** y el **artesano** que refina la herramienta.

*   **Entiende el Contrato**: Antes de cualquier tarea, familiarízate con el `contract.md` y el contexto (`.context/`) para asegurar la alineación con la filosofía Kaizen y la visión de "cero deuda técnica" de QuickWick.
*   **Mejora Continua**: Busca no solo implementar funcionalidades, sino elevar la calidad, mantenibilidad, seguridad y rendimiento del código base de QuickWick.
*   **Extensión de Plantillas**: Crea, refina y mejora las plantillas de Handlebars (`templates/`) para incorporar nuevos stacks tecnológicos, patrones arquitectónicos o mejorar los existentes, asegurando que generen código robusto.
*   **Refinamiento de la Lógica de Generación**: Afina `app/generator.js` para optimizar la selección de plantillas, la compilación de Handlebars, la gestión de dependencias y la escritura eficiente de archivos en el workspace.
*   **Fiabilidad de la Interfaz**: Asegura que `app/QUICKWICK.jsx` sea intuitiva, robusta y funcione sin fallos, comunicándose eficazmente con el host de la extensión de VS Code.
*   **Adhesión al DoD**: Asegura que cada tarea cumpla con la "Definición de Hecho" establecida en `contract.md`, incluyendo la calidad del código, la claridad, y la implementación progresiva de pruebas.
*   **Documentación**: Contribuye activamente a la documentación interna y a los comentarios de código, asegurando que QuickWick sea comprensible y extensible para otros desarrolladores.

### 2. QuickWick (La Extensión) - El Arquitecto Principal
La extensión QuickWick actúa como el **arquitecto principal** del proyecto *generado* para el usuario.

*   **Traducción de Visión**: Transforma la idea del desarrollador (en lenguaje natural) y las decisiones guiadas en una estructura de proyecto concreta, bien organizada y fundamentada en buenas prácticas.
*   **Generación "Sin Deuda Técnica"**: Su objetivo primordial es generar proyectos que cumplan con altos estándares de calidad, robustez, seguridad y mantenibilidad, anticipando y mitigando la deuda técnica desde la concepción del proyecto.
*   **Orquestación**: Selecciona y ensambla los componentes del stack tecnológico (plantillas) de manera coherente y óptima, basándose en la configuración del usuario.
*   **Documentador**: Genera la documentación esencial para el proyecto de destino, incluyendo el `contract.md` y la carpeta `.context/` (como roadmap) para el proyecto generado, facilitando su comprensión y mantenimiento.

### 3. Los LLMs (Gemini, OpenAI, Ollama) - Los Expertos Consultores
Los Modelos de Lenguaje Grandes actúan como **expertos consultores** para QuickWick, enriqueciendo el proceso de arquitectura y generación.

*   **Sugerencia de Stack**: Su función principal es analizar la descripción del proyecto del usuario y sugerir un stack tecnológico adecuado, alineado con las mejores prácticas y los objetivos del proyecto, que luego el usuario puede refinar.
*   **Asistencia Contextual**: En futuras interacciones, pueden ayudar a refinar la arquitectura, a generar componentes de código o a resolver problemas basándose en el contexto compacto provisto por el `contract.md` y `.context/` del proyecto generado.
*   **Generación de Contenido Dinámico**: Aportan la capacidad de generar explicaciones detalladas, glosarios o resúmenes en lenguaje natural, enriqueciendo significativamente la documentación del proyecto de destino.
*   **Control del Usuario (BYOK)**: El usuario mantiene el control total sobre qué LLM usar y con qué credenciales (BYOK), asegurando la privacidad, la transparencia y la soberanía sobre los modelos y los datos utilizados.