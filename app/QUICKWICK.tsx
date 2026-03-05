import React, { useState, useEffect } from 'react';
import {
      Settings, Database, Layout, ShieldCheck, FileCode, Terminal,
      CheckCircle2, ChevronRight, Info, Rocket, Code2, Cloud, BookOpen,
      Loader2, Sparkles, Send, Bot, User, MessageSquare, X, LayoutDashboard,
      Globe, Github, Zap, Layers, Cpu, Eye
} from 'lucide-react';
import {
      ProjectConfig,
      ChatMessage,
      LLMProvider,
      LLMCallOptions
} from './types';

// ============================================================
// BRIDGE LLM WEBVIEW ↔ HOST
// ============================================================
declare const acquireVsCodeApi: any;

const vscode =
      typeof acquireVsCodeApi !== 'undefined'
            ? acquireVsCodeApi()
            : { postMessage: () => { } };

let llmRequestId = 0;
const pendingLlmRequests = new Map<number, { resolve: (val: string) => void, reject: (err: Error) => void }>();

const ensureLlmListener = () => {
      if (typeof window === 'undefined') return;
      if ((window as any).__quickwick_llm_listener_installed) return;
      (window as any).__quickwick_llm_listener_installed = true;

      (window as any).addEventListener('message', (event: any) => {
            const message = event.data;
            if (!message || (message.type !== 'llm.result' && message.type !== 'llm.error')) return;

            const { requestId } = message;
            const pending = pendingLlmRequests.get(requestId);
            if (!pending) return;

            pendingLlmRequests.delete(requestId);

            if (message.type === 'llm.result') {
                  pending.resolve(message.text);
            } else {
                  pending.reject(new Error(message.message || 'Error al llamar a la IA'));
            }
      });
};

const callLLM = async (
      prompt: string,
      {
            systemInstruction = '',
            provider = 'gemini',
            model = 'gemini-2.5-flash-preview-09-2025'
      }: LLMCallOptions = {}
): Promise<string> => {
      ensureLlmListener();
      const requestId = ++llmRequestId;

      vscode.postMessage({
            type: 'llm.call',
            requestId,
            provider,
            model,
            prompt,
            systemInstruction
      });

      return new Promise((resolve, reject) => {
            pendingLlmRequests.set(requestId, { resolve, reject });
            setTimeout(() => {
                  if (pendingLlmRequests.has(requestId)) {
                        pendingLlmRequests.delete(requestId);
                        reject(new Error('Timeout esperando respuesta de la IA'));
                  }
            }, 60000);
      });
};

const fetchOllamaModels = async (): Promise<string[]> => {
      try {
            const response = await fetch('http://localhost:11434/api/tags');
            if (!response.ok) return [];
            const data = (await response.json()) as any;
            return data.models?.map((m: any) => m.name) || [];
      } catch (error) {
            console.error('Error fetching Ollama models:', error);
            return [];
      }
};

// ============================================================
// Componente principal
// ============================================================
const App: React.FC = () => {
      const [step, setStep] = useState<string>('initial');
      const [userInput, setUserInput] = useState<string>('');
      const [repoUrl, setRepoUrl] = useState<string>('');
      const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
      const [isAnalyzingRepo, setIsAnalyzingRepo] = useState<boolean>(false);
      const [isGeneratingContract, setIsGeneratingContract] = useState<boolean>(false);
      const [generatedContract, setGeneratedContract] = useState<string>('');
      const [activeTab, setActiveTab] = useState<string>('meta');

      const [aiProvider, setAiProvider] = useState<LLMProvider>('gemini');
      const [ollamaModels, setOllamaModels] = useState<string[]>([]);
      const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>('');
      const [cloudModel, setCloudModel] = useState<string>('gemini-2.5-flash-preview-09-2025');

      const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
            { role: 'bot', text: '¡Hola! Soy tu Arquitecto IA. Describe tu proyecto y te ayudaré a configurarlo sin deuda técnica.' }
      ]);
      const [currentChatMessage, setCurrentChatMessage] = useState<string>('');
      const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

      const [selections, setSelections] = useState<ProjectConfig>({
            project_meta: {
                  name: 'mi-nuevo-proyecto',
                  description: '',
                  domain: 'Custom',
                  priority: 'MVP (3 meses)',
                  scalability_target: 'Medium (Growth / 1k-100k users)',
                  budget_context: 'Free-tier-first',
                  team_size: 'Solo dev',
                  timeline_months: 3,
                  internationalization: {
                        required: false,
                        languages: [],
                        strategy: 'Custom'
                  },
                  license: 'MIT'
            },
            tech_stack: {
                  platform: 'Web',
                  paradigm: 'Monolithic',
                  frontend: {
                        framework: 'React',
                        language: 'TypeScript',
                        styling: 'Tailwind CSS',
                        state_management: 'Zustand',
                        animation: 'None',
                        testing_framework: 'Vitest'
                  },
                  mobile_desktop: {
                        mobile_framework: 'None',
                        desktop_framework: 'None'
                  },
                  backend: {
                        runtime: 'Node.js',
                        framework: 'Express',
                        api_type: 'REST',
                        realtime: 'None',
                        background_jobs: 'None',
                        validation: 'Zod'
                  },
                  persistence_layer: {
                        sql_databases: 'PostgreSQL',
                        nosql_databases: 'None',
                        vector_databases: 'None',
                        orm_query_builder: 'Prisma',
                        migrations: 'Prisma Migrate'
                  },
                  ai_intelligence_layer: {
                        use_ai: false,
                        foundational_models: [],
                        orchestration: 'None',
                        deployment: 'None',
                        vector_search_integration: false,
                        agents: 'None'
                  }
            },
            infrastructure_devops: {
                  cloud_provider: 'Vercel',
                  hosting_type: 'PaaS (Heroku-like)',
                  containers: 'None',
                  iac: 'None',
                  ci_cd: 'GitHub Actions',
                  observability: {
                        logging: 'None',
                        metrics: 'None',
                        tracing: 'None',
                        errors: 'Sentry'
                  },
                  cdn: 'None'
            },
            governance_quality_security: {
                  architecture_pattern: 'Clean Architecture',
                  code_standards: {
                        linting: 'ESLint',
                        formatting: 'Prettier',
                        naming_conventions: 'camelCase',
                        max_complexity: 10
                  },
                  strictness_level: 'Pragmatic (Balance)',
                  security: {
                        authentication: 'Firebase Auth',
                        authorization: 'RBAC (Role-based)',
                        encryption: 'bcrypt',
                        protection: ['CORS Strict'],
                        compliance: [],
                        secrets_management: 'Environment variables'
                  },
                  testing: {
                        types: ['Unit', 'Integration'],
                        tools: {
                              unit: 'Vitest',
                              integration: 'Supertest',
                              e2e: 'Playwright',
                              load: 'k6',
                              security: 'Snyk'
                        },
                        coverage_goal: 80,
                        ci_integration: true
                  },
                  static_analysis: {
                        code_quality: ['ESLint (rules)'],
                        security_scanning: ['Snyk'],
                        dependency_scanning: ['npm audit']
                  }
            },
            ai_behavior_contract: {
                  agent_role: 'Senior Architect',
                  tone: 'Educational (explica el porqué)',
                  vision: {
                        link_analysis: true,
                        context_awareness: true,
                        veto_power: true,
                        learning_mode: true
                  },
                  extra_instructions: ''
            },
            documentation_project_structure: {
                  readme_style: 'Detailed (with badges, toc, examples)',
                  include_changelog: true,
                  include_contributing_guide: true,
                  include_code_of_conduct: false,
                  include_license_file: true,
                  sow_template: true,
                  walkthrough_guide: true,
                  task_breakdown: true,
                  specs_document: true,
                  agents_md: true,
                  context_folder: true
            }
      });

      const options = {
            domain: ['Fintech', 'E-commerce', 'HealthTech', 'EdTech', 'SaaS', 'Tooling', 'AI-Agents', 'Crypto/Web3', 'IoT', 'Gaming', 'Media', 'Custom'],
            priority: ['MVP (3 meses)', 'Scalable Enterprise', 'Internal Tool', 'Research / POC', 'Open Source Library'],
            scalability: ['Low (Internal / <100 users)', 'Medium (Growth / 1k-100k users)', 'High (Global / >1M users)'],
            budget: ['Free-tier-first', 'Performance-critical', 'Cost-no-object', 'Self-hosted / On-premise'],
            team_size: ['Solo dev', 'Small team (2-5)', 'Medium team (6-15)', 'Large team (>15)'],
            license: ['MIT', 'Apache 2.0', 'GPLv3', 'Proprietary', 'Unlicense'],
            platform: ['Web', 'Mobile', 'Desktop', 'Cross-platform (Web + Mobile)', 'CLI', 'Embedded', 'API-only'],
            paradigm: ['Monolithic', 'Microservices', 'Serverless', 'BaaS-focused', 'Edge-computing', 'Event-driven', 'Modular Monolith', 'Jamstack'],
            frontend_framework: ['React', 'Next.js (App Router)', 'Next.js (Pages Router)', 'Vue', 'Nuxt', 'Angular', 'Svelte', 'SvelteKit', 'Qwik', 'Solid', 'Astro', 'Remix', 'Preact', 'Lit', 'HTML5/Vanilla JS'],
            frontend_language: ['TypeScript', 'JavaScript', 'AssemblyScript'],
            styling: ['Tailwind CSS', 'CSS Modules', 'Styled Components', 'Emotion', 'Material UI', 'Ant Design', 'Chakra UI', 'Shadcn/UI', 'DaisyUI', 'Bootstrap', 'Vanilla CSS', 'Sass/SCSS', 'PostCSS', 'UnoCSS'],
            state_management: ['Zustand', 'Redux Toolkit', 'Recoil', 'Jotai', 'Signals (Preact)', 'TanStack Query', 'Apollo Client', 'MobX', 'Context API (React)', 'Pinia (Vue)', 'NgRx (Angular)', 'None (local state only)'],
            animation: ['Framer Motion', 'GSAP', 'React Spring', 'Three.js', 'Lottie', 'None'],
            frontend_testing: ['Jest', 'Vitest', 'Cypress', 'Playwright', 'Testing Library', 'None'],
            mobile_framework: ['Flutter', 'React Native (Expo)', 'React Native (CLI)', 'Swift (Native iOS)', 'Kotlin (Native Android)', 'Ionic', 'Capacitor', 'KMM (Kotlin Multiplatform)', 'None'],
            desktop_framework: ['Tauri (Rust)', 'Electron', 'Neutralino', 'Wails (Go)', 'Qt', 'MAUI (.NET)', 'JavaFX', 'Rust GUI (egui/iced)', 'None'],
            backend_runtime: ['Node.js', 'Bun', 'Deno', 'Python', 'Go', 'Rust', '.NET (C#)', 'Java', 'PHP', 'Ruby', 'Elixir', 'C++'],
            backend_framework: ['Express', 'NestJS', 'Fastify', 'Koa', 'FastAPI', 'Django', 'Flask', 'Gin', 'Echo', 'Spring Boot', 'Quarkus', 'Laravel', 'Symfony', 'Rails', 'Phoenix', 'Axum', 'Actix', 'Rocket'],
            api_type: ['REST', 'GraphQL', 'gRPC', 'WebSockets', 'tRPC', 'Webhooks', 'SOAP (legacy)'],
            realtime: ['Socket.io', 'Pusher', 'Ably', 'WebRTC', 'Server-Sent Events', 'None'],
            background_jobs: ['BullMQ', 'Celery', 'Sidekiq', 'Hangfire', 'AWS SQS', 'Google Pub/Sub', 'None'],
            validation: ['Zod', 'Joi', 'Yup', 'Pydantic', 'Class-validator', 'None'],
            sql_databases: ['PostgreSQL', 'MySQL', 'SQLite', 'MariaDB', 'CockroachDB', 'Google Cloud SQL', 'Amazon RDS', 'Azure SQL', 'Spanner', 'Oracle', 'MSSQL', 'None'],
            nosql_databases: ['MongoDB', 'Firestore', 'DynamoDB', 'Redis (cache)', 'Cassandra', 'ScyllaDB', 'Couchbase', 'Neo4j (graph)', 'Memgraph', 'None'],
            vector_databases: ['Pinecone', 'Weaviate', 'ChromaDB', 'Milvus', 'Qdrant', 'Supabase pgvector', 'Vertex AI Vector Search', 'RedisVL', 'None'],
            orm: ['Prisma', 'Drizzle', 'TypeORM', 'Mongoose', 'SQLAlchemy', 'Tortoise ORM', 'Eloquent', 'Active Record', 'Sequelize', 'Knex.js', 'Raw SQL'],
            migrations: ['Prisma Migrate', 'Alembic', 'Flyway', 'Liquibase', 'Knex Migrations', 'Manual'],
            ai_models: ['Gemini (Google)', 'OpenAI GPT-4o', 'OpenAI o1', 'Claude 3.5', 'Llama 3 (local)', 'Mistral', 'Cohere', 'Hugging Face models'],
            ai_orchestration: ['LangChain', 'LlamaIndex', 'Haystack', 'CrewAI', 'Autogen', 'None'],
            ai_deployment: ['Vertex AI', 'OpenAI API', 'Anthropic API', 'Ollama (local)', 'Hugging Face Inference', 'AWS Bedrock', 'Azure AI', 'Self-hosted'],
            ai_agents: ['Single agent', 'Multi-agent (crew)', 'ReAct pattern', 'None'],
            cloud_provider: ['GCP', 'AWS', 'Azure', 'Oracle Cloud', 'Vercel', 'Netlify', 'Cloudflare Pages', 'Supabase', 'Railway', 'Render', 'Fly.io', 'Appwrite', 'Hetzner', 'DigitalOcean', 'Linode', 'Self-hosted (bare metal)', 'On-premise'],
            hosting_type: ['PaaS (Heroku-like)', 'CaaS (Kubernetes)', 'VMs', 'Serverless (Functions)', 'Edge Functions', 'Static hosting', 'Container (single Docker)'],
            containers: ['Docker', 'Kubernetes', 'Podman', 'Nomad', 'None'],
            iac: ['Terraform', 'Pulumi', 'AWS CDK', 'CloudFormation', 'Docker Compose', 'Ansible', 'None'],
            ci_cd: ['GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Travis CI', 'Azure Pipelines', 'Google Cloud Build', 'AWS CodePipeline', 'None'],
            logging: ['Winston', 'Pino', 'LogRocket', 'Datadog', 'Cloud Logging', 'ELK Stack', 'None'],
            metrics: ['Prometheus', 'Grafana', 'Datadog', 'New Relic', 'OpenTelemetry', 'None'],
            tracing: ['Jaeger', 'Zipkin', 'OpenTelemetry', 'None'],
            errors: ['Sentry', 'Bugsnag', 'Rollbar', 'None'],
            cdn: ['Cloudflare', 'AWS CloudFront', 'Fastly', 'Akamai', 'None'],
            architecture_pattern: ['Clean Architecture', 'Hexagonal (Ports & Adapters)', 'FSD (Feature-Sliced Design)', 'DDD (Domain-Driven Design)', 'MVC', 'Microkernel', 'CQRS', 'Event Sourcing', 'Layered'],
            linting: ['ESLint', 'Biome', 'Ruff', 'Pylint', 'golangci-lint'],
            formatting: ['Prettier', 'Black', 'gofmt', 'rustfmt'],
            naming: ['PascalCase', 'camelCase', 'snake_case', 'kebab-case'],
            strictness: ['Strict (Zero Tech Debt)', 'Pragmatic (Balance)', 'Experimental (Speed First)'],
            auth: ['Firebase Auth', 'Supabase Auth', 'Clerk', 'Auth0', 'NextAuth.js', 'Custom JWT', 'Kinde', 'Logto', 'Keycloak', 'OAuth2 provider', 'Passport.js', 'None'],
            authorization: ['RBAC (Role-based)', 'ABAC (Attribute-based)', 'Policy-based', 'Simple roles'],
            encryption: ['AES-256', 'bcrypt', 'Argon2', 'JWT signed'],
            protection: ['WAF', 'Rate Limiting', 'CORS Strict', 'SQL Injection Shield', 'reCAPTCHA', 'Helmet.js', 'CSRF tokens', 'Content Security Policy'],
            compliance: ['GDPR', 'HIPAA', 'PCI-DSS', 'SOC2', 'ISO 27001', 'CCPA', 'None'],
            secrets: ['Environment variables', 'HashiCorp Vault', 'AWS Secrets Manager', 'Google Secret Manager', 'Doppler'],
            test_types: ['Unit', 'Integration', 'E2E', 'Load/Performance', 'Security', 'Mutation'],
            test_tools_unit: ['Vitest', 'Jest', 'Pytest', 'Go test', 'JUnit'],
            test_tools_integration: ['Supertest', 'Pytest', 'Testcontainers'],
            test_tools_e2e: ['Cypress', 'Playwright', 'Selenium', 'Puppeteer'],
            test_tools_load: ['k6', 'Artillery', 'Locust', 'JMeter'],
            test_tools_security: ['OWASP ZAP', 'Snyk', 'Trivy'],
            code_quality: ['SonarQube', 'Codacy', 'CodeClimate', 'ESLint (rules)'],
            security_scanning: ['Bandit (Python)', 'Checkov', 'Trivy', 'Snyk', 'Dependabot'],
            dependency_scanning: ['npm audit', 'OWASP Dependency Check', 'Safety (Python)'],
            agent_role: ['Senior Architect', 'Security Lead', 'DX Specialist', 'Firebase Guru', 'Full-Stack Mentor', 'DevOps Advisor', 'Tech Lead', 'Code Reviewer'],
            tone: ['Direct', 'Educational (explica el porqué)', 'Defensive', 'Code-Only (solo sugerencias)'],
            readme_style: ['Minimal', 'Detailed (with badges, toc, examples)', 'Company-standard']
      };

      useEffect(() => {
            if (aiProvider === 'ollama') {
                  fetchOllamaModels().then(setOllamaModels);
            }
      }, [aiProvider]);

      const handleAnalyze = async () => {
            if (!userInput.trim()) return;
            setIsAnalyzing(true);
            try {
                  const model = aiProvider === 'ollama' ? selectedOllamaModel : cloudModel;
                  const text = await callLLM(userInput, {
                        systemInstruction: "Genera un JSON de configuración técnica basado en el esquema ProjectConfig.",
                        provider: aiProvider,
                        model
                  });
                  const match = text.match(/\{[\s\S]*\}/);
                  if (match) setSelections(prev => ({ ...prev, ...JSON.parse(match[0]) }));
                  setStep('config');
            } catch (e) {
                  setStep('config');
            } finally {
                  setIsAnalyzing(false);
            }
      };

      const handleAnalyzeRepo = async () => {
            if (!repoUrl.trim()) return;
            setIsAnalyzingRepo(true);
            try {
                  const res = await fetch(`https://r.jina.ai/${repoUrl}`);
                  const text = await res.text();
                  const model = aiProvider === 'ollama' ? selectedOllamaModel : cloudModel;
                  const aiText = await callLLM(`Analiza este repo y devuelve JSON ProjectConfig: ${text}`, { provider: aiProvider, model });
                  const match = aiText.match(/\{[\s\S]*\}/);
                  if (match) setSelections(prev => ({ ...prev, ...JSON.parse(match[0]) }));
                  setStep('config');
            } finally {
                  setIsAnalyzingRepo(false);
            }
      };

      const handleGenerateContract = async () => {
            setStep('preview');
            setIsGeneratingContract(true);
            try {
                  const model = aiProvider === 'ollama' ? selectedOllamaModel : cloudModel;
                  const text = await callLLM(`Genera contract.md para: ${JSON.stringify(selections)}`, { provider: aiProvider, model });
                  setGeneratedContract(text || "# Error");
            } finally {
                  setIsGeneratingContract(false);
            }
      };

      const handleSendMessage = async () => {
            if (!currentChatMessage.trim()) return;
            const msg: ChatMessage = { role: 'user', text: currentChatMessage };
            setChatMessages(prev => [...prev, msg]);
            setCurrentChatMessage('');
            setIsChatLoading(true);
            try {
                  const model = aiProvider === 'ollama' ? selectedOllamaModel : cloudModel;
                  const res = await callLLM(currentChatMessage, { provider: aiProvider, model });
                  setChatMessages(prev => [...prev, { role: 'bot', text: res }]);
            } finally {
                  setIsChatLoading(false);
            }
      };

      const updateMeta = (field: string, value: any) => setSelections(p => ({ ...p, project_meta: { ...p.project_meta, [field]: value } }));
      const updateTechStack = (cat: string, field: string, value: any) => setSelections(p => ({ ...p, tech_stack: { ...p.tech_stack, [cat]: { ...(p.tech_stack as any)[cat], [field]: value } } }));
      const updateInfra = (field: string, value: any) => setSelections(p => ({ ...p, infrastructure_devops: { ...p.infrastructure_devops, [field]: value } }));
      const updateGovernance = (field: string, value: any) => setSelections(p => ({ ...p, governance_quality_security: { ...p.governance_quality_security, [field]: value } }));
      const updateAIBehavior = (field: string, value: any) => setSelections(p => ({ ...p, ai_behavior_contract: { ...p.ai_behavior_contract, [field]: value } }));
      const updateDocumentation = (field: string, value: any) => setSelections(p => ({ ...p, documentation_project_structure: { ...p.documentation_project_structure, [field]: value } }));

      const renderTabs = () => {
            const tabs = [
                  { id: 'meta', label: 'METADATOS', icon: <Info size={14} /> },
                  { id: 'tech', label: 'STACK', icon: <Layers size={14} /> },
                  { id: 'infra', label: 'INFRA', icon: <Cloud size={14} /> },
                  { id: 'governance', label: 'GOBERNANZA', icon: <ShieldCheck size={14} /> },
                  { id: 'ai', label: 'IA BIAS', icon: <Cpu size={14} /> },
                  { id: 'docs', label: 'DOCS', icon: <FileCode size={14} /> },
            ];

            return (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl">
                        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-800 pb-4">
                              {tabs.map(tab => (
                                    <button
                                          key={tab.id}
                                          onClick={() => setActiveTab(tab.id)}
                                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                                    >
                                          {tab.icon} {tab.label}
                                    </button>
                              ))}
                        </div>

                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                              {activeTab === 'meta' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Nombre del Proyecto</label>
                                                <input type="text" value={selections.project_meta.name} onChange={e => updateMeta('name', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3" />
                                          </div>
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Dominio Vertical</label>
                                                <select value={selections.project_meta.domain} onChange={e => updateMeta('domain', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                      {options.domain.map(opt => <option key={opt}>{opt}</option>)}
                                                </select>
                                          </div>
                                    </div>
                              )}

                              {activeTab === 'tech' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Frontend</label>
                                                <select value={selections.tech_stack.frontend.framework} onChange={e => updateTechStack('frontend', 'framework', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                      {options.frontend_framework.map(opt => <option key={opt}>{opt}</option>)}
                                                </select>
                                          </div>
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Backend</label>
                                                <select value={selections.tech_stack.backend.runtime} onChange={e => updateTechStack('backend', 'runtime', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                      {options.backend_runtime.map(opt => <option key={opt}>{opt}</option>)}
                                                </select>
                                          </div>
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Base de Datos</label>
                                                <select value={selections.tech_stack.persistence_layer.sql_databases} onChange={e => updateTechStack('persistence_layer', 'sql_databases', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                      {options.sql_databases.map(opt => <option key={opt}>{opt}</option>)}
                                                </select>
                                          </div>
                                    </div>
                              )}

                              {activeTab === 'infra' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Cloud Provider</label>
                                                <select value={selections.infrastructure_devops.cloud_provider} onChange={e => updateInfra('cloud_provider', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                      {options.cloud_provider.map(opt => <option key={opt}>{opt}</option>)}
                                                </select>
                                          </div>
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">CI/CD Pipeline</label>
                                                <select value={selections.infrastructure_devops.ci_cd} onChange={e => updateInfra('ci_cd', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                      {options.ci_cd.map(opt => <option key={opt}>{opt}</option>)}
                                                </select>
                                          </div>
                                    </div>
                              )}

                              {activeTab === 'governance' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Patrón Arquitectónico</label>
                                                <select value={selections.governance_quality_security.architecture_pattern} onChange={e => updateGovernance('architecture_pattern', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                      {options.architecture_pattern.map(opt => <option key={opt}>{opt}</option>)}
                                                </select>
                                          </div>
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Nivel de Exigencia (Strictness)</label>
                                                <select value={selections.governance_quality_security.strictness_level} onChange={e => updateGovernance('strictness_level', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                      {options.strictness.map(opt => <option key={opt}>{opt}</option>)}
                                                </select>
                                          </div>
                                    </div>
                              )}

                              {activeTab === 'ai' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Rol del Agente IA</label>
                                                <select value={selections.ai_behavior_contract.agent_role} onChange={e => updateAIBehavior('agent_role', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                      {options.agent_role.map(opt => <option key={opt}>{opt}</option>)}
                                                </select>
                                          </div>
                                          <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Tono de Comunicación</label>
                                                <select value={selections.ai_behavior_contract.tone} onChange={e => updateAIBehavior('tone', (e.target as any).value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                      {options.tone.map(opt => <option key={opt}>{opt}</option>)}
                                                </select>
                                          </div>
                                    </div>
                              )}

                              {activeTab === 'docs' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                          {[
                                                { key: 'include_changelog', label: 'CHANGELOG.md' },
                                                { key: 'sow_template', label: 'SOW.md' },
                                                { key: 'walkthrough_guide', label: 'WALKTHROUGH.md' },
                                                { key: 'agents_md', label: 'AGENTS.md' },
                                                { key: 'specs_document', label: 'SPECS.md' },
                                                { key: 'context_folder', label: '.context/' }
                                          ].map(item => (
                                                <label key={item.key} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer">
                                                      <input type="checkbox" checked={(selections.documentation_project_structure as any)[item.key]} onChange={e => updateDocumentation(item.key, (e.target as any).checked)} className="rounded bg-slate-800" />
                                                      <span className="text-xs font-medium">{item.label}</span>
                                                </label>
                                          ))}
                                    </div>
                              )}
                        </div>
                  </div>
            );
      };

      return (
            <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
                  <header className="max-w-7xl mx-auto mb-12 flex items-center justify-between border-b border-slate-800 pb-6">
                        <div className="flex items-center gap-4">
                              <Rocket className="text-blue-500" size={32} />
                              <div>
                                    <h1 className="text-2xl font-black tracking-tighter text-white uppercase">QuickWick <span className="text-blue-500">Génesis</span></h1>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">IA Powered Architecture 2025</p>
                              </div>
                        </div>
                  </header>

                  <main className="max-w-7xl mx-auto">
                        {step === 'initial' && (
                              <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center space-y-4 pt-12">
                                          <h2 className="text-5xl font-black text-white tracking-tight">Imagina. Describe. <span className="text-blue-500">Construye.</span></h2>
                                          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Diseña sistemas complejos en segundos con gobernanza integrada.</p>
                                    </div>
                                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
                                          <textarea value={userInput} onChange={e => setUserInput((e.target as any).value)} placeholder="Describe tu proyecto..." className="w-full h-40 bg-transparent border-none focus:ring-0 text-xl text-white placeholder-slate-600 resize-none" />
                                          <div className="flex items-center justify-between mt-4">
                                                <div className="flex gap-2">
                                                      <button onClick={() => setAiProvider('gemini')} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${aiProvider === 'gemini' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>GEMINI</button>
                                                      <button onClick={() => setAiProvider('ollama')} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${aiProvider === 'ollama' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>OLLAMA</button>
                                                </div>
                                                <button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2">
                                                      {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />} GÉNESIS
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )}

                        {step === 'config' && (
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                                    <div className="lg:col-span-8 space-y-6">
                                          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-lg">
                                                <h3 className="font-bold text-sm tracking-widest flex items-center gap-2"> <Settings size={16} className="text-blue-500" /> ENGINE_CONFIG</h3>
                                                <button onClick={handleGenerateContract} className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black hover:bg-green-500 transition-all uppercase">Generar Contrato</button>
                                          </div>
                                          {renderTabs()}
                                    </div>
                                    <div className="lg:col-span-4 h-[700px] bg-slate-900/50 border border-slate-800 rounded-3xl flex flex-col shadow-2xl">
                                          <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                                                <Bot className="text-blue-500" size={18} />
                                                <span className="text-xs font-black uppercase tracking-widest">Audit IA</span>
                                          </div>
                                          <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                                {chatMessages.map((m, i) => (
                                                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                            <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{m.text}</div>
                                                      </div>
                                                ))}
                                          </div>
                                          <div className="p-4">
                                                <div className="relative">
                                                      <input type="text" value={currentChatMessage} onChange={e => setCurrentChatMessage((e.target as any).value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Brainstorming..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs" />
                                                      <button onClick={handleSendMessage} className="absolute right-2 top-2 p-1 bg-blue-600 rounded-lg text-white"><Send size={14} /></button>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        )}

                        {step === 'preview' && (
                              <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
                                    <div className="flex justify-between items-center bg-slate-900/30 p-6 rounded-3xl border border-slate-800">
                                          <h2 className="text-2xl font-black uppercase tracking-tighter">TECHNICAL_CONTRACT.MD</h2>
                                          <div className="flex gap-4">
                                                <button onClick={() => setStep('config')} className="bg-slate-800 px-6 py-3 rounded-xl font-bold text-xs">RE-ENGINEERING</button>
                                                <button
                                                      onClick={() => {
                                                            vscode.postMessage({ type: 'generateProject', config: selections });
                                                            setStep('success');
                                                      }}
                                                      className="bg-blue-600 px-8 py-3 rounded-xl font-bold text-xs shadow-xl shadow-blue-500/20"
                                                >
                                                      DEPLOΥ WORKSPACE
                                                </button>
                                          </div>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 font-mono text-sm h-[600px] overflow-auto shadow-inner text-blue-200/70">
                                          {isGeneratingContract ? <Loader2 className="mx-auto animate-spin" size={48} /> : <pre className="whitespace-pre-wrap">{generatedContract}</pre>}
                                    </div>
                              </div>
                        )}

                        {step === 'success' && (
                              <div className="max-w-2xl mx-auto text-center py-20 animate-in bounce-in duration-700">
                                    <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                          <CheckCircle2 size={48} className="text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Workspace Inyectado</h2>
                                    <p className="text-slate-500 mb-8">La arquitectura ha sido generada correctamente vinculando los estándares del contrato.</p>
                                    <button onClick={() => setStep('initial')} className="bg-slate-800 px-12 py-4 rounded-xl font-bold uppercase tracking-widest text-xs">Reiniciar Ciclo</button>
                              </div>
                        )}
                  </main>
            </div>
      );
};

export default App;
