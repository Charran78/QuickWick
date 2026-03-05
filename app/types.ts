// ============================================================
// QuickWick — Tipos compartidos (webview + generador)
// ============================================================

// ── Metadatos del proyecto ────────────────────────────────

export interface Internationalization {
      required: boolean;
      languages: string[];
      strategy: string;
}

export interface ProjectMeta {
      name: string;
      description: string;
      domain: string;
      priority: string;
      scalability_target: string;
      budget_context: string;
      team_size: string;
      timeline_months: number;
      internationalization: Internationalization;
      license: string;
}

// ── Tech Stack ────────────────────────────────────────────

export interface Frontend {
      framework: string;
      language: string;
      styling: string;
      state_management: string;
      animation: string;
      testing_framework: string;
}

export interface MobileDesktop {
      mobile_framework: string;
      desktop_framework: string;
}

export interface Backend {
      runtime: string;
      framework: string;
      api_type: string;
      realtime: string;
      background_jobs: string;
      validation: string;
}

export interface PersistenceLayer {
      sql_databases: string;
      nosql_databases: string;
      vector_databases: string;
      orm_query_builder: string;
      migrations: string;
}

export interface AIIntelligenceLayer {
      use_ai: boolean;
      foundational_models: string[];
      orchestration: string;
      deployment: string;
      vector_search_integration: boolean;
      agents: string;
}

export interface TechStack {
      platform: string;
      paradigm: string;
      frontend: Frontend;
      mobile_desktop: MobileDesktop;
      backend: Backend;
      persistence_layer: PersistenceLayer;
      ai_intelligence_layer: AIIntelligenceLayer;
}

// ── Infraestructura & DevOps ──────────────────────────────

export interface Observability {
      logging: string;
      metrics: string;
      tracing: string;
      errors: string;
}

export interface InfrastructureDevops {
      cloud_provider: string;
      hosting_type: string;
      containers: string;
      iac: string;
      ci_cd: string;
      observability: Observability;
      cdn: string;
}

// ── Gobernanza, Calidad y Seguridad ──────────────────────

export interface CodeStandards {
      linting: string;
      formatting: string;
      naming_conventions: string;
      max_complexity: number;
}

export interface Security {
      authentication: string;
      authorization: string;
      encryption: string;
      protection: string[];
      compliance: string[];
      secrets_management: string;
}

export interface TestTools {
      unit: string;
      integration: string;
      e2e: string;
      load: string;
      security: string;
}

export interface Testing {
      types: string[];
      tools: TestTools;
      coverage_goal: number;
      ci_integration: boolean;
}

export interface StaticAnalysis {
      code_quality: string[];
      security_scanning: string[];
      dependency_scanning: string[];
}

export interface GovernanceQualitySecurity {
      architecture_pattern: string;
      code_standards: CodeStandards;
      strictness_level: string;
      security: Security;
      testing: Testing;
      static_analysis: StaticAnalysis;
}

// ── Comportamiento de la IA ───────────────────────────────

export interface AIBehaviorVision {
      link_analysis: boolean;
      context_awareness: boolean;
      veto_power: boolean;
      learning_mode: boolean;
}

export interface AIBehaviorContract {
      agent_role: string;
      tone: string;
      vision: AIBehaviorVision;
      extra_instructions: string;
}

// ── Documentación y estructura del proyecto ──────────────

export interface DocumentationProjectStructure {
      readme_style: string;
      include_changelog: boolean;
      include_contributing_guide: boolean;
      include_code_of_conduct: boolean;
      include_license_file: boolean;
      sow_template: boolean;
      walkthrough_guide: boolean;
      task_breakdown: boolean;
      specs_document: boolean;
      agents_md: boolean;
      context_folder: boolean;
}

// ── Config principal (wizard → generador) ─────────────────

export interface ProjectConfig {
      project_meta: ProjectMeta;
      tech_stack: TechStack;
      infrastructure_devops: InfrastructureDevops;
      governance_quality_security: GovernanceQualitySecurity;
      ai_behavior_contract: AIBehaviorContract;
      documentation_project_structure: DocumentationProjectStructure;
}

// ── Tipos auxiliares del generador ───────────────────────

export interface TemplateEntry {
      source: string;
      dest: string;
      type: 'hbs' | 'static';
}

// ── Tipos auxiliares de la webview ───────────────────────

export type LLMProvider = 'gemini' | 'openai' | 'ollama';

export interface LLMCallOptions {
      systemInstruction?: string;
      provider?: LLMProvider;
      model?: string;
}

export interface ChatMessage {
      role: 'bot' | 'user';
      text: string;
}
