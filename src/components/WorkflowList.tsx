import { useState, useEffect } from 'react';
import { Play, Pause, Trash2, Eye, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Workflow } from '../types';
import { getWorkflows, saveWorkflow, deleteWorkflow, simulateWorkflowExecution, addWorkflowExecution } from '../utils/workflowStorage';

interface WorkflowListProps {
  onViewExecution: (workflowId: string) => void;
}

export default function WorkflowList({ onViewExecution }: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runningWorkflows, setRunningWorkflows] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = () => {
    setWorkflows(getWorkflows());
  };

  const handleToggleWorkflow = (workflow: Workflow) => {
    const updatedWorkflow = {
      ...workflow,
      enabled: !workflow.enabled,
      status: !workflow.enabled ? 'active' : 'paused'
    };
    saveWorkflow(updatedWorkflow as Workflow);
    loadWorkflows();
  };

  const handleRunWorkflow = async (workflow: Workflow) => {
    setRunningWorkflows(prev => new Set(prev).add(workflow.id));

    try {
      const execution = await simulateWorkflowExecution(workflow);
      addWorkflowExecution(workflow.id, execution);
      loadWorkflows();
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setRunningWorkflows(prev => {
        const newSet = new Set(prev);
        newSet.delete(workflow.id);
        return newSet;
      });
    }
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(workflowId);
      loadWorkflows();
    }
  };

  const getStatusIcon = (workflow: Workflow) => {
    const lastExecution = workflow.executions[0];
    if (!lastExecution) return <Clock size={18} className="status-icon neutral" />;

    if (lastExecution.status === 'success') {
      return <CheckCircle size={18} className="status-icon success" />;
    } else if (lastExecution.status === 'failed') {
      return <XCircle size={18} className="status-icon error" />;
    } else {
      return <Loader size={18} className="status-icon running" />;
    }
  };

  const formatLastRun = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (workflows.length === 0) {
    return (
      <div className="empty-workflows">
        <p>No workflows created yet. Create one from the templates above.</p>
      </div>
    );
  }

  return (
    <div className="workflow-list">
      {workflows.map((workflow) => {
        const isRunning = runningWorkflows.has(workflow.id);
        const lastExecution = workflow.executions[0];

        return (
          <div key={workflow.id} className={`workflow-item ${!workflow.enabled ? 'disabled' : ''}`}>
            <div className="workflow-item-header">
              <div className="workflow-item-info">
                {getStatusIcon(workflow)}
                <div>
                  <h4 className="workflow-item-name">{workflow.name}</h4>
                  <p className="workflow-item-description">{workflow.description}</p>
                </div>
              </div>
              <div className="workflow-item-meta">
                <span className={`workflow-badge ${workflow.status}`}>
                  {workflow.status}
                </span>
                <span className="workflow-trigger">
                  {workflow.trigger}
                </span>
              </div>
            </div>

            <div className="workflow-item-details">
              <div className="workflow-detail">
                <span className="detail-label">Last Run:</span>
                <span className="detail-value">{formatLastRun(workflow.lastRun)}</span>
              </div>
              {lastExecution && (
                <>
                  <div className="workflow-detail">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{Math.round(lastExecution.duration)}ms</span>
                  </div>
                  <div className="workflow-detail">
                    <span className="detail-label">Executions:</span>
                    <span className="detail-value">{workflow.executions.length}</span>
                  </div>
                </>
              )}
            </div>

            <div className="workflow-item-actions">
              <button
                className="workflow-action-btn primary"
                onClick={() => handleRunWorkflow(workflow)}
                disabled={isRunning || !workflow.enabled}
                title="Run workflow"
              >
                {isRunning ? <Loader size={18} className="spinning" /> : <Play size={18} />}
              </button>
              <button
                className="workflow-action-btn"
                onClick={() => handleToggleWorkflow(workflow)}
                title={workflow.enabled ? 'Pause workflow' : 'Resume workflow'}
              >
                <Pause size={18} />
              </button>
              <button
                className="workflow-action-btn"
                onClick={() => onViewExecution(workflow.id)}
                title="View executions"
              >
                <Eye size={18} />
              </button>
              <button
                className="workflow-action-btn danger"
                onClick={() => handleDeleteWorkflow(workflow.id)}
                title="Delete workflow"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
