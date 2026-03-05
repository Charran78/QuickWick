import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectConfig } from '../../app/types';
import * as generator from '../../app/generator';
import { promises as fs } from 'fs';
import { exec } from 'child_process';

// Mock de vscode
const vscodeMock = {
      window: {
            showInformationMessage: vi.fn(),
            showErrorMessage: vi.fn(),
            showQuickPick: vi.fn().mockResolvedValue('No')
      }
};

vi.mock('fs', () => ({
      promises: {
            readFile: vi.fn().mockResolvedValue('template content {{project_meta.name}}'),
            writeFile: vi.fn().mockResolvedValue(undefined),
            mkdir: vi.fn().mockResolvedValue(undefined)
      }
}));

vi.mock('child_process', () => ({
      exec: vi.fn((_cmd: string, _opts: any, cb: any) => cb(null))
}));

describe('Generator Logic', () => {
      beforeEach(() => {
            vi.clearAllMocks();
      });

      it('should determine base templates correctly', async () => {
            const config: ProjectConfig = {
                  project_meta: {
                        name: 'test-project',
                        description: 'Test description',
                        license: 'MIT',
                        domain: 'Tooling',
                        priority: 'MVP (3 meses)',
                        scalability_target: 'Low (Internal / <100 users)',
                        budget_context: 'Free-tier-first',
                        team_size: 'Solo dev',
                        timeline_months: 3,
                        internationalization: { required: false, languages: [], strategy: 'Custom' }
                  },
                  tech_stack: {
                        platform: 'Web',
                        paradigm: 'Monolithic',
                        frontend: {
                              framework: 'None',
                              language: 'TypeScript',
                              styling: 'Tailwind CSS',
                              state_management: 'Zustand',
                              animation: 'None',
                              testing_framework: 'Vitest'
                        },
                        mobile_desktop: { mobile_framework: 'None', desktop_framework: 'None' },
                        backend: {
                              runtime: 'None',
                              framework: 'Express',
                              api_type: 'REST',
                              realtime: 'None',
                              background_jobs: 'None',
                              validation: 'Zod'
                        },
                        persistence_layer: {
                              sql_databases: 'None',
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
                        observability: { logging: 'None', metrics: 'None', tracing: 'None', errors: 'Sentry' },
                        cdn: 'None'
                  },
                  governance_quality_security: {
                        architecture_pattern: 'Clean Architecture',
                        code_standards: { linting: 'ESLint', formatting: 'Prettier', naming_conventions: 'camelCase', max_complexity: 10 },
                        strictness_level: 'Pragmatic (Balance)',
                        security: { authentication: 'None', authorization: 'RBAC (Role-based)', encryption: 'bcrypt', protection: [], compliance: [], secrets_management: 'Environment variables' },
                        testing: { types: [], tools: { unit: 'Vitest', integration: 'None', e2e: 'None', load: 'None', security: 'None' }, coverage_goal: 80, ci_integration: true },
                        static_analysis: { code_quality: [], security_scanning: [], dependency_scanning: [] }
                  },
                  ai_behavior_contract: { agent_role: 'Senior Architect', tone: 'Direct', vision: { link_analysis: true, context_awareness: true, veto_power: true, learning_mode: true }, extra_instructions: '' },
                  documentation_project_structure: { readme_style: 'Minimal', include_changelog: false, include_contributing_guide: false, include_code_of_conduct: false, include_license_file: true, sow_template: false, walkthrough_guide: false, task_breakdown: false, specs_document: false, agents_md: false, context_folder: false }
            };

            const templates = generator.determineTemplates(config);

            expect(templates).toContainEqual(expect.objectContaining({ dest: '.gitignore' }));
            expect(templates).toContainEqual(expect.objectContaining({ dest: 'README.md' }));
            expect(templates).toContainEqual(expect.objectContaining({ dest: 'LICENSE' }));
      });

      it('should include React templates when framework is React', () => {
            const config: any = {
                  tech_stack: {
                        frontend: { framework: 'React' }
                  }
            };

            const templates = generator.determineTemplates(config);
            expect(templates).toContainEqual(expect.objectContaining({ source: 'frontend/react-vite/package.json.hbs' }));
            expect(templates).toContainEqual(expect.objectContaining({ dest: 'src/App.jsx' }));
      });

      it('should include Node.js templates when runtime is Node.js', () => {
            const config: any = {
                  tech_stack: {
                        backend: { runtime: 'Node.js' }
                  }
            };

            const templates = generator.determineTemplates(config);
            expect(templates).toContainEqual(expect.objectContaining({ source: 'backend/node-express/server.js.hbs' }));
      });

      it('should include documentation and governance templates by default', () => {
            const config: any = {
                  project_meta: { name: 'docs-test' },
                  tech_stack: { frontend: { framework: 'None' }, backend: { runtime: 'None' } }
            };

            const templates = generator.determineTemplates(config);
            expect(templates).toContainEqual(expect.objectContaining({ dest: 'contract.md' }));
            expect(templates).toContainEqual(expect.objectContaining({ dest: '.context/ARCHITECTURE.md' }));
            expect(templates).toContainEqual(expect.objectContaining({ dest: '.context/STATUS.md' }));
      });

      it('should correctly execute generateProject flow', async () => {
            const config: any = {
                  project_meta: { name: 'full-run' },
                  tech_stack: { frontend: { framework: 'None' }, backend: { runtime: 'None' } }
            };

            await generator.generateProject(config, './test-target', vscodeMock);

            expect(vscodeMock.window.showInformationMessage).toHaveBeenCalled();
            expect(vscodeMock.window.showQuickPick).toHaveBeenCalled();
      });

      it('should include Python templates when runtime is Python', () => {
            const config: any = {
                  tech_stack: {
                        backend: { runtime: 'Python' }
                  }
            };

            const templates = generator.determineTemplates(config);
            expect(templates).toContainEqual(expect.objectContaining({ source: 'backend/python-fastapi/main.py.hbs' }));
      });

      it('should correctly execute generateProject flow with Git init enabled', async () => {
            const config: any = {
                  project_meta: { name: 'git-run' },
                  tech_stack: { frontend: { framework: 'None' }, backend: { runtime: 'None' } }
            };

            vscodeMock.window.showQuickPick.mockResolvedValueOnce('Sí');

            await generator.generateProject(config, './test-target', vscodeMock);

            expect(vscodeMock.window.showInformationMessage).toHaveBeenCalled();
      });

      it('should handle template read errors gracefully', async () => {
            const config: any = {
                  project_meta: { name: 'error-run' },
                  tech_stack: { frontend: { framework: 'None' }, backend: { runtime: 'None' } }
            };

            vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Read failed'));

            await generator.generateProject(config, './test-target', vscodeMock);
      });

      it('should handle template write errors gracefully', async () => {
            const config: any = {
                  project_meta: { name: 'write-error-run' },
                  tech_stack: { frontend: { framework: 'None' }, backend: { runtime: 'None' } }
            };

            vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('Write failed'));

            await generator.generateProject(config, './test-target', vscodeMock);
      });

      it('should handle git init errors gracefully', async () => {
            const config: any = {
                  project_meta: { name: 'git-error-run' },
                  tech_stack: { frontend: { framework: 'None' }, backend: { runtime: 'None' } }
            };

            vscodeMock.window.showQuickPick.mockResolvedValueOnce('Sí');
            vi.mocked(exec).mockImplementationOnce((_cmd: any, _opts: any, cb: any) => cb(new Error('Git fail')));

            await generator.generateProject(config, './test-target', vscodeMock);
            expect(vscodeMock.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Error al inicializar git'));
      });
});
