import { Workflow, WorkflowExecution } from "../types";

const WORKFLOWS_KEY = "superdesk_workflows";

export const saveWorkflow = (workflow: Workflow): void => {
  const workflows = getWorkflows();
  const index = workflows.findIndex((w) => w.id === workflow.id);

  if (index >= 0) {
    workflows[index] = workflow;
  } else {
    workflows.push(workflow);
  }

  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
};

export const getWorkflows = (): Workflow[] => {
  const data = localStorage.getItem(WORKFLOWS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getWorkflow = (id: string): Workflow | null => {
  const workflows = getWorkflows();
  return workflows.find((w) => w.id === id) || null;
};

export const deleteWorkflow = (id: string): void => {
  const workflows = getWorkflows().filter((w) => w.id !== id);
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
};

export const addWorkflowExecution = (
  workflowId: string,
  execution: WorkflowExecution
): void => {
  const workflow = getWorkflow(workflowId);
  if (workflow) {
    workflow.executions.unshift(execution);
    if (workflow.executions.length > 50) {
      workflow.executions = workflow.executions.slice(0, 50);
    }
    workflow.lastRun = execution.timestamp;
    saveWorkflow(workflow);
  }
};

export const simulateWorkflowExecution = async (
  workflow: Workflow
): Promise<WorkflowExecution> => {
  const startTime = Date.now();

  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );

  const success = Math.random() > 0.15;
  const duration = Date.now() - startTime;

  const logs: string[] = [
    `[${new Date().toISOString()}] Workflow "${workflow.name}" started`,
    `[${new Date().toISOString()}] Trigger: ${workflow.trigger}`,
    `[${new Date().toISOString()}] Loading configuration...`,
  ];

  if (workflow.category === "log-collection") {
    logs.push(
      `[${new Date().toISOString()}] Connecting to ${
        workflow.config.sshHosts?.length || 0
      } hosts...`
    );
    logs.push(
      `[${new Date().toISOString()}] Fetching logs from ${
        workflow.config.logPaths?.length || 0
      } paths...`
    );
    logs.push(`[${new Date().toISOString()}] Collected 1,247 log entries`);
    logs.push(
      `[${new Date().toISOString()}] Running AI anomaly detection with ${
        workflow.config.aiModel || "local"
      } model...`
    );

    if (success) {
      logs.push(`[${new Date().toISOString()}] Detected 3 anomalies:`);
      logs.push(`  - High memory usage pattern (severity: medium)`);
      logs.push(`  - Unusual network traffic spike (severity: low)`);
      logs.push(`  - Repeated authentication failures (severity: high)`);
    } else {
      logs.push(
        `[${new Date().toISOString()}] ERROR: Failed to connect to host 192.168.1.50`
      );
      logs.push(
        `[${new Date().toISOString()}] Connection timeout after 30 seconds`
      );
    }
  } else if (workflow.category === "diagnosis") {
    logs.push(`[${new Date().toISOString()}] Analyzing system symptoms...`);
    logs.push(`[${new Date().toISOString()}] Running diagnostic checks...`);
    logs.push(
      `[${new Date().toISOString()}] AI Model: ${
        workflow.config.aiModel || "local"
      }`
    );

    if (success) {
      logs.push(`[${new Date().toISOString()}] Diagnosis complete:`);
      logs.push(`  - Root cause: Network latency due to router configuration`);
      logs.push(
        `  - Recommended action: Update router firmware and reset BGP sessions`
      );
      logs.push(`  - Confidence: 87%`);
    } else {
      logs.push(
        `[${new Date().toISOString()}] ERROR: Insufficient data for diagnosis`
      );
      logs.push(`[${new Date().toISOString()}] Required metrics not available`);
    }
  } else if (workflow.category === "ticketing") {
    logs.push(
      `[${new Date().toISOString()}] Checking for unresolved issues...`
    );
    logs.push(
      `[${new Date().toISOString()}] Found 2 critical issues requiring escalation`
    );

    if (workflow.config.integrations?.jira) {
      logs.push(`[${new Date().toISOString()}] Creating Jira tickets...`);
      if (success) {
        logs.push(`[${new Date().toISOString()}] Created ticket: TECH-4782`);
        logs.push(`[${new Date().toISOString()}] Created ticket: TECH-4783`);
        logs.push(`[${new Date().toISOString()}] Assigned to: On-call Team`);
      } else {
        logs.push(
          `[${new Date().toISOString()}] ERROR: Failed to create Jira ticket`
        );
        logs.push(`[${new Date().toISOString()}] API authentication failed`);
      }
    }

    if (workflow.config.integrations?.email) {
      logs.push(`[${new Date().toISOString()}] Sending email notifications...`);
      if (success) {
        logs.push(
          `[${new Date().toISOString()}] Email sent to ${
            workflow.config.integrations.email.recipients?.length || 0
          } recipients`
        );
      }
    }
  }

  logs.push(
    `[${new Date().toISOString()}] Workflow execution ${
      success ? "completed successfully" : "failed"
    }`
  );
  logs.push(`[${new Date().toISOString()}] Duration: ${duration}ms`);

  const execution: WorkflowExecution = {
    id: `exec-${Date.now()}`,
    timestamp: Date.now(),
    status: success ? "success" : "failed",
    duration,
    logs,
    output: success
      ? {
          itemsProcessed: Math.floor(Math.random() * 1000) + 100,
          anomaliesDetected: Math.floor(Math.random() * 10),
          ticketsCreated:
            workflow.category === "ticketing"
              ? Math.floor(Math.random() * 5)
              : 0,
        }
      : null,
  };

  return execution;
};
