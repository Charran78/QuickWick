# QuickWick – Génesis de proyectos sin deuda técnica (VS Code Extension, WIP local dev setup)

> **Estado**: prototipo funcional para uso local (no publicado aún en Marketplace).

## 🎯 Qué es QuickWick

QuickWick es una extensión para VS Code que actúa como **arquitecto de software + generador de proyectos**.  
A partir de una **idea en lenguaje natural** (o la URL de un repositorio) y unas cuantas decisiones guiadas, genera:

- La **estructura completa del proyecto** (frontend, backend, base de datos, auth, deployment).
- Un **stack tecnológico alineado** con tus objetivos (MVP, escalabilidad, presupuesto, equipo, etc.).
- Plantillas de **documentación y gobernanza** (README, explicación, próximos pasos, glosario, contrato técnico, etc.).

Todo ello con plantillas Handlebars en `templates/` y un generador en Node (`app/generator.js`) que escribe el proyecto en tu workspace.

---

## 🧠 Cerebro IA – BYOK (Bring Your Own Key)

Desde la interfaz React (`app/QUICKWICK.jsx`) puedes elegir el proveedor de IA:

- **Gemini (Cloud)** – modelo por defecto `gemini-2.5-flash-preview-09-2025` (configurable).
- **OpenAI (Cloud)** – ej. `gpt-4o`, `gpt-4o-mini`, etc.
- **Ollama (Local)** – cualquier modelo local cargado en tu máquina.

Características clave:

- Selector de proveedor: `Gemini / OpenAI / Ollama`.
- **BYOK**: campos para introducir tu propia API key de Gemini u OpenAI (no se hardcodean claves).
- Campo para elegir el **modelo** (tanto en Gemini como en OpenAI).
- Detección automática de modelos locales de **Ollama** (`/api/tags`) y selector en la UI.

Toda la lógica está centralizada en `callLLM` dentro de `app/QUICKWICK.jsx`, que unifica el modo de llamar a cada proveedor.

---

## 🗂 Estructura del proyecto (dev local)

```text
QuickWick/
├─ app/
│  ├─ QUICKWICK.jsx          # React UI del wizard Génesis (webview)
│  ├─ generator.js           # Lógica Node que aplica las plantillas al workspace VS Code
├─ templates/                # Plantillas Handlebars para stacks y docs
│  ├─ base/                  # .gitignore, README, LICENSE
│  ├─ frontend/
│  │  ├─ react-vite/         # React + Vite
│  │  └─ vanilla-html/       # HTML/CSS/JS plano
│  ├─ backend/
│  │  ├─ node-express/       # API REST con Express
│  │  └─ python-fastapi/     # API con FastAPI
│  ├─ database/
│  │  └─ postgresql/         # docker-compose + schema.sql
│  ├─ auth/
│  │  ├─ firebase/           # Auth Firebase
│  │  ├─ auth0/              # Configuración Auth0
│  │  └─ jwt/                # Middleware JWT para Express
│  ├─ deployment/
│  │  ├─ vercel/
│  │  ├─ netlify/
│  │  └─ docker/
│  └─ docs/                  # explanation.md, next-steps.md, glossary.md
├─ codigo legacy/            # Versiones antiguas de la UI (referencia)
└─ TXT/                      # Notas y diseño funcional del wizard
```

> En un repo real de extensión VS Code, `QUICKWICK.jsx` viviría en la carpeta `media/` o similar y se empaquetaría como bundle para la webview. Aquí lo mantenemos en `app/` para desarrollar la UI por separado.

---

## ⚙️ Requisitos

- **Node.js 18+**
- **VS Code** (para desarrollar/probar la extensión)
- (Opcional) **Ollama** instalado y corriendo en `http://localhost:11434` para usar modelos locales.
- API key de **Gemini** y/o **OpenAI** si quieres usar la IA en la nube (BYOK).

---

## 🧩 Cómo funciona a alto nivel

1. El usuario abre el wizard (UI React de `QUICKWICK.jsx`) en una webview.
2. Describe su proyecto o pega la URL de un repo.
3. La IA sugiere un **stack completo** (frontend, backend, DB, auth, infra, gobernanza, docs).
4. El usuario revisa/ajusta en pestañas (`Metadatos`, `Frontend`, `Backend/DB`, `Infra`, `Gobernanza`, `IA`, `Docs`).  
5. El wizard genera un **contrato técnico** (`contract.md`) y vista previa.
6. Al pulsar “Desplegar estructura” se envía el JSON de configuración a la extensión.
7. La extensión llama a `generateProject(config, workspacePath)` en `app/generator.js`.
8. `generator.js`:
   - Elige las plantillas adecuadas (`determineTemplates(config)`).
   - Compila `.hbs` con Handlebars usando el JSON del wizard.
   - Escribe los archivos finales en el workspace del usuario.
   - Ofrece inicializar un repo **Git** si el usuario quiere.

---

## 🛠 Uso en modo desarrollo (local)

1. Clona este repo en una carpeta de trabajo.
2. Abre la carpeta en VS Code.
3. Asegúrate de tener:
   - La carpeta `templates/` generada (ya incluida).
   - `app/QUICKWICK.jsx` y `app/generator.js` presentes.
4. En tu **proyecto real de extensión VS Code**:
   - Copia `app/generator.js` al root o a `src/generator.js`.
   - Copia la UI (`QUICKWICK.jsx`) y transpílala/empáquetala (por ejemplo con Vite/webpack) para servirla en una webview.
   - En `extension.ts/js`, registra un comando, por ejemplo:

```js
const vscode = require('vscode');
const { generateProject } = require('./generator');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('quickwick.generateFromConfig', async (config) => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('Abre una carpeta primero');
        return;
      }
      const targetPath = workspaceFolders[0].uri.fsPath;
      await generateProject(config, targetPath);
    })
  );
}

module.exports = { activate };
```

5. Desde la webview, cuando el usuario pulse el botón de generar, envías el JSON:

```js
vscode.postMessage({
  type: 'generateProject',
  config: selections   // El gran JSON con project_meta, tech_stack, etc.
});
```

Y en el lado de la extensión lo encadenas con el comando:

```js
webviewView.webview.onDidReceiveMessage(async (message) => {
  if (message.type === 'generateProject') {
    vscode.commands.executeCommand('quickwick.generateFromConfig', message.config);
  }
});
```

---

## 🧱 Plantillas disponibles

Actualmente, `app/generator.js` soporta las siguientes combinaciones (según el JSON de configuración):

- **Base**
  - `.gitignore`
  - `README.md` (Handlbars, sensible al stack elegido)
  - `LICENSE` (MIT parametrizado)
- **Frontend**
  - `React + Vite` (`frontend/react-vite`)
  - `Vanilla HTML/CSS/JS` (`frontend/vanilla-html`)
- **Backend**
  - `Node.js + Express` (`backend/node-express`)
  - `Python + FastAPI` (`backend/python-fastapi`)
- **Base de datos**
  - `PostgreSQL + Docker Compose` (`database/postgresql`)
- **Auth**
  - `Firebase Auth`
  - `Auth0` (config de cliente)
  - `JWT` (middleware Express)
- **Deployment**
  - `Vercel`
  - `Netlify`
  - `Dockerfile` multientorno (Node / Python / Nginx).
- **Docs**
  - `docs/explanation.md`
  - `docs/next-steps.md`
  - `docs/glossary.md`

Puedes extender fácilmente añadiendo más carpetas dentro de `templates/` y ampliando la función `determineTemplates(config)` en `app/generator.js`.

---

## 🔐 BYOK y seguridad

- Las API keys de **Gemini** y **OpenAI** se introducen desde la UI de la pestaña **IA**.
- No se guardan en el código fuente; la idea es que se gestionen como:
  - Variables de entorno de VS Code / sistema, o
  - Estado efímero de la webview (según cómo empaquetes la extensión real).
- Para producción, deberías:
  - Mover la llamada a la IA al lado de la extensión (Node) o a un backend propio.
  - Evitar exponer claves directamente en el código de la webview.

---

## 🧭 Roadmap corto

- Añadir más stacks frontend (Next.js, Vue, SvelteKit, etc.).
- Soporte para más backends (NestJS, Django, Go/Gin real).
- Generación automática de contratos `contract.md` y `.context/` dentro del workspace.
- Integración más directa con comandos de VS Code (por ejemplo, abrir README generado, terminal con `npm install`, etc.).

---

## 🤝 Contribuir

Este repo está montado como **laboratorio local**. Si quieres convertirlo en una extensión lista para publicar:

- Crea una estructura estándar de extensión VS Code (`package.json`, `extension.ts`, `media/`, etc.).
- Integra `app/QUICKWICK.jsx` como bundle de la webview.
- Conecta `app/generator.js` con tus comandos.

Las plantillas están diseñadas para ser legibles y hackeables: adapta el contenido a tus propias guías de arquitectura, linters, CI/CD, etc.

