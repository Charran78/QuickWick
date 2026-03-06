import * as Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { ProjectConfig, TemplateEntry } from './types';

// vscode NO se importa aquí para mantener el módulo desacoplado y testeable.
// Se recibe como dependencia inyectada en generateProject().

/** Ruta absoluta a la carpeta raíz de templates (una carpeta arriba de /app). */
const TEMPLATES_ROOT = path.join(__dirname, '..', '..', 'templates');

// ============================================================
// Helpers de Handlebars
// ============================================================
Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
Handlebars.registerHelper('currentDate', () => new Date().toLocaleDateString());

/**
 * Genera el proyecto a partir de la configuración del usuario.
 * @param config - JSON de configuración.
 * @param targetPath - Ruta del workspace donde se crearán los archivos.
 * @param vscode - Instancia de la API de VS Code (inyectada desde el host).
 */
export async function generateProject(config: ProjectConfig, targetPath: string, vscode: any): Promise<void> {
      console.log('QuickWick :: Generando proyecto con config:', JSON.stringify(config, null, 2));

      const templatesToUse = determineTemplates(config);

      await ensureDirectories(templatesToUse, targetPath);

      for (const template of templatesToUse) {
            await processTemplate(template, config, targetPath);
      }

      await initGit(targetPath, vscode);

      vscode.window.showInformationMessage(`✅ Proyecto ${config.project_meta?.name || 'sin-nombre'} generado correctamente`);
}

/**
 * Determina qué plantillas se necesitan según la configuración.
 */
export function determineTemplates(config: ProjectConfig): TemplateEntry[] {
      const templates: TemplateEntry[] = [];

      // ---------------- Base ----------------
      templates.push({ source: 'base/.gitignore', dest: '.gitignore', type: 'static' });
      templates.push({ source: 'base/README.md.hbs', dest: 'README.md', type: 'hbs' });

      if (config.project_meta?.license) {
            templates.push({ source: 'base/LICENSE.hbs', dest: 'LICENSE', type: 'hbs' });
      }

      // ---------------- Frontend ----------------
      const frontend = config.tech_stack?.frontend;
      if (frontend && frontend.framework && frontend.framework !== 'None') {
            const framework = frontend.framework.toLowerCase();

            if (framework.includes('react')) {
                  templates.push(
                        { source: 'frontend/react-vite/package.json.hbs', dest: 'package.json', type: 'hbs' },
                        { source: 'frontend/react-vite/vite.config.js.hbs', dest: 'vite.config.js', type: 'hbs' },
                        { source: 'frontend/react-vite/index.html', dest: 'index.html', type: 'static' },
                        { source: 'frontend/react-vite/src/App.jsx.hbs', dest: 'src/App.jsx', type: 'hbs' },
                        { source: 'frontend/react-vite/src/main.jsx', dest: 'src/main.jsx', type: 'static' },
                        { source: 'frontend/react-vite/src/App.css', dest: 'src/App.css', type: 'static' },
                        { source: 'frontend/react-vite/src/index.css', dest: 'src/index.css', type: 'static' },
                  );
            } else if (framework.includes('html') || framework.includes('vanilla')) {
                  templates.push(
                        { source: 'frontend/vanilla-html/index.html.hbs', dest: 'index.html', type: 'hbs' },
                        { source: 'frontend/vanilla-html/style.css', dest: 'style.css', type: 'static' },
                        { source: 'frontend/vanilla-html/script.js.hbs', dest: 'script.js', type: 'hbs' },
                  );
            }
      }

      // ---------------- Backend ----------------
      const backend = config.tech_stack?.backend;
      if (backend && backend.runtime && backend.runtime !== 'None') {
            const runtime = backend.runtime.toLowerCase();

            if (runtime === 'node.js' || runtime === 'node') {
                  templates.push(
                        { source: 'backend/node-express/package.json.hbs', dest: 'backend/package.json', type: 'hbs' },
                        { source: 'backend/node-express/server.js.hbs', dest: 'backend/server.js', type: 'hbs' },
                        { source: 'backend/node-express/routes/api.js.hbs', dest: 'backend/routes/api.js', type: 'hbs' },
                        { source: 'backend/node-express/.env.example', dest: 'backend/.env.example', type: 'static' },
                  );
            } else if (runtime === 'python') {
                  templates.push(
                        { source: 'backend/python-fastapi/requirements.txt.hbs', dest: 'backend/requirements.txt', type: 'hbs' },
                        { source: 'backend/python-fastapi/main.py.hbs', dest: 'backend/main.py', type: 'hbs' },
                        { source: 'backend/python-fastapi/.env.example', dest: 'backend/.env.example', type: 'static' },
                  );
            }
      }

      // ---------------- Base de datos SQL / NoSQL ----------------
      const db = config.tech_stack?.persistence_layer;
      if (db && db.sql_databases && db.sql_databases !== 'None') {
            const sqlDb = db.sql_databases.toLowerCase();

            if (sqlDb.includes('postgres')) {
                  templates.push(
                        { source: 'database/postgresql/docker-compose.yml.hbs', dest: 'database/docker-compose.yml', type: 'hbs' },
                        { source: 'database/postgresql/schema.sql.hbs', dest: 'database/schema.sql', type: 'hbs' },
                        { source: 'database/postgresql/README-db.md.hbs', dest: 'database/README.md', type: 'hbs' },
                  );
            }
      }

      // ---------------- Autenticación ----------------
      const auth = config.governance_quality_security?.security;
      if (auth && auth.authentication && auth.authentication !== 'None') {
            const provider = auth.authentication.toLowerCase();

            if (provider === 'firebase auth') {
                  templates.push(
                        { source: 'auth/firebase/firebase-config.js.hbs', dest: 'src/firebase-config.js', type: 'hbs' },
                        { source: 'auth/firebase/firebase-auth.js.hbs', dest: 'src/firebase-auth.js', type: 'hbs' },
                  );
            } else if (provider === 'auth0') {
                  templates.push({ source: 'auth/auth0/auth0-config.js.hbs', dest: 'src/auth0-config.js', type: 'hbs' });
            } else if (provider === 'jwt' || provider.includes('jwt')) {
                  templates.push({ source: 'auth/jwt/auth.middleware.js.hbs', dest: 'backend/middleware/auth.js', type: 'hbs' });
            }
      }

      // ---------------- Despliegue ----------------
      const deploy = config.infrastructure_devops;
      if (deploy && deploy.cloud_provider) {
            const platform = deploy.cloud_provider.toLowerCase();

            if (platform === 'vercel') {
                  templates.push({ source: 'deployment/vercel/vercel.json.hbs', dest: 'vercel.json', type: 'hbs' });
            } else if (platform === 'netlify') {
                  templates.push({ source: 'deployment/netlify/netlify.toml.hbs', dest: 'netlify.toml', type: 'hbs' });
            } else if (platform === 'docker') {
                  templates.push({ source: 'deployment/docker/Dockerfile.hbs', dest: 'Dockerfile', type: 'hbs' });
            }
      }

      // ---------------- Documentación y Gobernanza (siempre) ----------------
      templates.push(
            { source: 'docs/explanation.md.hbs', dest: 'docs/explanation.md', type: 'hbs' },
            { source: 'docs/next-steps.md.hbs', dest: 'docs/next-steps.md', type: 'hbs' },
            { source: 'docs/glossary.md.hbs', dest: 'docs/glossary.md', type: 'hbs' },

            // Artefactos de Gobernanza Críticos
            { source: 'docs/contract.md.hbs', dest: 'contract.md', type: 'hbs' },
            { source: 'docs/context/ARCHITECTURE.md.hbs', dest: '.context/ARCHITECTURE.md', type: 'hbs' },
            { source: 'docs/context/SPECS.md.hbs', dest: '.context/SPECS.md', type: 'hbs' },
            { source: 'docs/context/STATUS.md.hbs', dest: '.context/STATUS.md', type: 'hbs' },
      );

      return templates;
}

/**
 * Asegura que los directorios necesarios existen.
 */
async function ensureDirectories(templates: TemplateEntry[], targetPath: string): Promise<void> {
      const dirs = new Set<string>();

      for (const t of templates) {
            const dir = path.dirname(path.join(targetPath, t.dest));
            dirs.add(dir);
      }

      for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
      }
}

/**
 * Procesa una plantilla: si es tipo hbs, la compila con Handlebars;
 * si es static, la copia tal cual.
 */
async function processTemplate(template: TemplateEntry, config: ProjectConfig, targetPath: string): Promise<void> {
      const sourcePath = path.join(TEMPLATES_ROOT, template.source);
      const destPath = path.join(targetPath, template.dest);

      let content: string;
      try {
            content = await fs.readFile(sourcePath, 'utf-8');
      } catch (err: any) {
            console.error(`QuickWick :: No se pudo leer la plantilla ${sourcePath}:`, err.message);
            return;
      }

      try {
            if (template.type === 'hbs') {
                  const templateFn = Handlebars.compile(content);
                  const rendered = templateFn(config);
                  await fs.writeFile(destPath, rendered, 'utf-8');
            } else {
                  await fs.writeFile(destPath, content, 'utf-8');
            }
            console.log(`QuickWick :: Generado ${destPath}`);
      } catch (err: any) {
            console.error(`QuickWick :: Error procesando plantilla ${sourcePath}:`, err.message);
      }
}

/**
 * Inicializa git en el proyecto si el usuario lo desea.
 */
async function initGit(targetPath: string, vscode: any): Promise<void> {
      const answer = await vscode.window.showQuickPick(['Sí', 'No'], {
            placeHolder: '¿Quieres inicializar un repositorio Git en este proyecto?'
      });

      if (answer === 'Sí') {
            return new Promise((resolve) => {
                  exec('git init', { cwd: targetPath }, (err: any) => {
                        if (err) {
                              vscode.window.showErrorMessage('Error al inicializar git: ' + err.message);
                        } else {
                              vscode.window.showInformationMessage('Repositorio Git inicializado en ' + targetPath);
                        }
                        resolve();
                  });
            });
      }
}
