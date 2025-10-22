export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  serviceType: string;
  messages: Message[];
  createdAt: number;
  model: string;
}

export interface Report {
  id: string;
  sessionId: string;
  content: string;
  createdAt: number;
}

export type AIModel = 'phi' | 'claude' | 'gemini' | 'titan' | 'local';

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type WorkflowStatus = 'active' | 'paused' | 'stopped' | 'error';
export type WorkflowTrigger = 'schedule' | 'event' | 'manual' | 'webhook';

export interface WorkflowExecution {
  id: string;
  timestamp: number;
  status: 'success' | 'failed' | 'running';
  duration: number;
  logs: string[];
  output?: any;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: WorkflowTrigger;
  schedule?: string;
  status: WorkflowStatus;
  enabled: boolean;
  executions: WorkflowExecution[];
  config: WorkflowConfig;
  createdAt: number;
  lastRun?: number;
}

export interface WorkflowConfig {
  endpoints?: string[];
  sshHosts?: string[];
  logPaths?: string[];
  alertThresholds?: Record<string, number>;
  integrations?: {
    jira?: { url: string; apiKey: string };
    email?: { smtp: string; recipients: string[] };
    slack?: { webhook: string };
  };
  aiModel?: AIModel;
  scanInterval?: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultTrigger: WorkflowTrigger;
  defaultSchedule?: string;
  configSchema: string[];
}