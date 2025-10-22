import { useState, useEffect } from 'react';
import { ChevronLeft, RefreshCw, CheckCircle, XCircle, Clock, Terminal } from 'lucide-react';
import { Workflow, WorkflowExecution } from '../types';
import { getWorkflow } from '../utils/workflowStorage';

interface WorkflowExecutionViewerProps {
  workflowId: string;
  onBack: () => void;
}

export default function WorkflowExecutionViewer({ workflowId, onBack }: WorkflowExecutionViewerProps) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);

  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  const loadWorkflow = () => {
    const wf = getWorkflow(workflowId);
    setWorkflow(wf);
    if (wf && wf.executions.length > 0) {
      setSelectedExecution(wf.executions[0]);
    }
  };

  if (!workflow) {
    return (
      <div className="workflow-execution-viewer">
        <div className="workflow-header">
          <button className="back-button" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <h2>Workflow not found</h2>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} className="status-icon success" />;
      case 'failed':
        return <XCircle size={20} className="status-icon error" />;
      case 'running':
        return <Clock size={20} className="status-icon running" />;
      default:
        return <Clock size={20} className="status-icon neutral" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="workflow-execution-viewer">
      <div className="workflow-header">
        <button className="back-button" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <div className="workflow-header-info">
          <h2>{workflow.name}</h2>
          <p className="workflow-subtitle">Execution History</p>
        </div>
        <button className="refresh-button" onClick={loadWorkflow}>
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="execution-viewer-layout">
        <div className="execution-list-panel">
          <h3 className="panel-title">
            <Terminal size={20} />
            <span>Executions ({workflow.executions.length})</span>
          </h3>
          {workflow.executions.length === 0 ? (
            <div className="empty-executions">
              <p>No executions yet</p>
            </div>
          ) : (
            <div className="execution-list">
              {workflow.executions.map((execution) => (
                <div
                  key={execution.id}
                  className={`execution-list-item ${selectedExecution?.id === execution.id ? 'selected' : ''}`}
                  onClick={() => setSelectedExecution(execution)}
                >
                  <div className="execution-list-item-header">
                    {getStatusIcon(execution.status)}
                    <span className="execution-time">
                      {formatTimestamp(execution.timestamp)}
                    </span>
                  </div>
                  <div className="execution-list-item-details">
                    <span className="execution-duration">
                      {Math.round(execution.duration)}ms
                    </span>
                    <span className={`execution-status-badge ${execution.status}`}>
                      {execution.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="execution-details-panel">
          {selectedExecution ? (
            <>
              <div className="execution-details-header">
                <div className="execution-details-title">
                  <h3>Execution Details</h3>
                  {getStatusIcon(selectedExecution.status)}
                </div>
                <div className="execution-meta">
                  <div className="meta-item">
                    <span className="meta-label">Started:</span>
                    <span className="meta-value">{formatTimestamp(selectedExecution.timestamp)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Duration:</span>
                    <span className="meta-value">{Math.round(selectedExecution.duration)}ms</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Status:</span>
                    <span className={`meta-badge ${selectedExecution.status}`}>
                      {selectedExecution.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedExecution.output && (
                <div className="execution-output">
                  <h4 className="output-title">Output Summary</h4>
                  <div className="output-grid">
                    {Object.entries(selectedExecution.output).map(([key, value]) => (
                      <div key={key} className="output-item">
                        <span className="output-key">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="output-value">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="execution-logs">
                <h4 className="logs-title">Execution Logs</h4>
                <div className="logs-container">
                  {selectedExecution.logs.map((log, index) => {
                    const isError = log.includes('ERROR');
                    const isSuccess = log.includes('completed successfully');
                    const isWarning = log.includes('WARNING');

                    return (
                      <div
                        key={index}
                        className={`log-line ${isError ? 'error' : isSuccess ? 'success' : isWarning ? 'warning' : ''}`}
                      >
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-execution-details">
              <Terminal size={64} className="empty-icon" />
              <p>Select an execution to view details</p>
            </div>
          )}
        </div>
      </div>

      <div className="watermark">SuperHack 2025</div>
    </div>
  );
}
