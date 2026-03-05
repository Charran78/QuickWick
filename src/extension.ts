import * as vscode from 'vscode';
import * as path from 'path';
import { initializeLLMClient, callLLM, setApiKey, clearApiKey } from './llmClient';

// Reutilizamos el generador existente en app/generator.js (CommonJS).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateProject } = require('../app/generator');

export function activate(context: vscode.ExtensionContext) {
  console.log('QuickWick extension is now active!');

  initializeLLMClient(context);

  // Comando principal: generar proyecto desde la configuración del wizard
  context.subscriptions.push(
    vscode.commands.registerCommand('quickwick.generateFromConfig', async (config: any) => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Abre una carpeta de trabajo antes de generar un proyecto.');
        return;
      }

      const targetPath = workspaceFolders[0].uri.fsPath;

      try {
        await generateProject(config, targetPath, vscode);
        vscode.window.showInformationMessage('Proyecto generado con éxito por QuickWick.');
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error al generar el proyecto: ${error?.message || String(error)}`);
        console.error('Error al generar proyecto:', error);
      }
    })
  );

  // Gestión de API keys (BYOK)
  context.subscriptions.push(
    vscode.commands.registerCommand('quickwick.setGeminiApiKey', () => setApiKey('gemini'))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('quickwick.setOpenAIApiKey', () => setApiKey('openai'))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('quickwick.clearGeminiApiKey', () => clearApiKey('gemini'))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('quickwick.clearOpenAIApiKey', () => clearApiKey('openai'))
  );

  // Comando para abrir el wizard (webview)
  let currentPanel: vscode.WebviewPanel | undefined;

  context.subscriptions.push(
    vscode.commands.registerCommand('quickwick.openWizard', () => {
      const columnToShowIn = (vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined) || vscode.ViewColumn.One;

      if (currentPanel) {
        currentPanel.reveal(columnToShowIn);
        return;
      }

      currentPanel = vscode.window.createWebviewPanel(
        'quickWickGenesis',
        'QuickWick Génesis',
        columnToShowIn,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
        }
      );

      const webviewUri = currentPanel.webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'media', 'main.js'))
      );

      currentPanel.webview.html = getWebviewContent(webviewUri);

      currentPanel.webview.onDidReceiveMessage(
        async (message) => {
          if (message.type === 'llm.call') {
            const { requestId, provider, model, prompt, systemInstruction } = message;
            try {
              const resultText = await callLLM({ provider, model, prompt, systemInstruction });
              currentPanel?.webview.postMessage({ type: 'llm.result', requestId, text: resultText });
            } catch (error: any) {
              console.error(`Error al llamar a la IA desde el host: ${error?.message || String(error)}`);
              currentPanel?.webview.postMessage({
                type: 'llm.error',
                requestId,
                message: error?.message || 'Error desconocido al llamar a la IA.'
              });
              vscode.window.showErrorMessage(`Error de IA: ${error?.message || String(error)}`);
            }
          } else if (message.type === 'generateProject') {
            vscode.commands.executeCommand('quickwick.generateFromConfig', message.config);
          }
        },
        undefined,
        context.subscriptions
      );

      currentPanel.onDidDispose(
        () => {
          currentPanel = undefined;
        },
        undefined,
        context.subscriptions
      );
    })
  );
}

function getWebviewContent(webviewUri: vscode.Uri): string {
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; script-src 'unsafe-inline' 'unsafe-eval' ${webviewUri}; style-src 'unsafe-inline'; font-src https: data:;" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>QuickWick Génesis</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="${webviewUri}"></script>
  </body>
</html>`;
}

export function deactivate() {
  // No-op por ahora
}


