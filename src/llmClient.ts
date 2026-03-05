import * as vscode from 'vscode';
import fetch from 'node-fetch';

export interface LLMCallOptions {
  provider: 'gemini' | 'openai' | 'ollama';
  model: string;
  prompt: string;
  systemInstruction?: string;
}

let secretStorage: vscode.SecretStorage | undefined;

export function initializeLLMClient(context: vscode.ExtensionContext) {
  secretStorage = context.secrets;
}

export async function callLLM(options: LLMCallOptions): Promise<string> {
  const { provider, model, prompt, systemInstruction } = options;

  switch (provider) {
    case 'gemini': {
      const apiKey =
        (secretStorage && (await secretStorage.get('quickwick.geminiApiKey'))) ||
        process.env.QUICKWICK_GEMINI_KEY;
      if (!apiKey) {
        throw new Error('No se encontró la API Key de Gemini. Configúrala primero.');
      }
      return callGeminiAPI(apiKey, model, prompt, systemInstruction);
    }

    case 'openai': {
      const apiKey =
        (secretStorage && (await secretStorage.get('quickwick.openaiApiKey'))) ||
        process.env.QUICKWICK_OPENAI_KEY;
      if (!apiKey) {
        throw new Error('No se encontró la API Key de OpenAI. Configúrala primero.');
      }
      return callOpenAIAPI(apiKey, model, prompt, systemInstruction);
    }

    case 'ollama': {
      const cfg = vscode.workspace.getConfiguration('quickwick');
      const ollamaUrl = cfg.get<string>('ollamaUrl', 'http://localhost:11434');
      return callOllamaAPI(ollamaUrl, model, prompt, systemInstruction);
    }

    default:
      throw new Error(`Proveedor de IA desconocido: ${provider as string}`);
  }
}

async function callGeminiAPI(
  apiKey: string,
  model: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const contents = systemInstruction
    ? [{ parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }]
    : [{ parts: [{ text: prompt }] }];

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7 }
    })
  } as any);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error en la API de Gemini (${response.status}): ${errorBody}`);
  }

  const data: any = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Respuesta vacía o inesperada de Gemini.');
  }
  return text;
}

async function callOpenAIAPI(
  apiKey: string,
  model: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const messages: Array<{ role: string; content: string }> = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7
    })
  } as any);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error en la API de OpenAI (${response.status}): ${errorBody}`);
  }

  const data: any = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Respuesta vacía o inesperada de OpenAI.');
  }
  return text;
}

async function callOllamaAPI(
  ollamaUrl: string,
  model: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const url = `${ollamaUrl.replace(/\/+$/, '')}/api/generate`;
  const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: fullPrompt,
      stream: false
    })
  } as any);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error en la API de Ollama (${response.status}): ${errorBody}`);
  }

  const data: any = await response.json();
  const text = data?.response;
  if (!text) {
    throw new Error('Respuesta vacía o inesperada de Ollama.');
  }
  return text;
}

export async function setApiKey(provider: 'gemini' | 'openai'): Promise<void> {
  if (!secretStorage) {
    throw new Error('LLM client no inicializado. Llama a initializeLLMClient() en activate().');
  }

  const keyName = provider === 'gemini' ? 'quickwick.geminiApiKey' : 'quickwick.openaiApiKey';
  const promptMessage = `Introduce tu API key de ${provider === 'gemini' ? 'Gemini' : 'OpenAI'}:`;

  const apiKey = await vscode.window.showInputBox({
    prompt: promptMessage,
    password: true,
    ignoreFocusOut: true
  });

  if (apiKey) {
    await secretStorage.store(keyName, apiKey);
    vscode.window.showInformationMessage(`API key de ${provider} guardada con éxito.`);
  } else {
    vscode.window.showWarningMessage(`No se guardó la API key de ${provider}.`);
  }
}

export async function clearApiKey(provider: 'gemini' | 'openai'): Promise<void> {
  if (!secretStorage) {
    throw new Error('LLM client no inicializado. Llama a initializeLLMClient() en activate().');
  }

  const keyName = provider === 'gemini' ? 'quickwick.geminiApiKey' : 'quickwick.openaiApiKey';
  await secretStorage.delete(keyName);
  vscode.window.showInformationMessage(`API key de ${provider} eliminada.`);
}

