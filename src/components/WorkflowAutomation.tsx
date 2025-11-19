import { useState } from "react";
import {
  ChevronLeft,
  Plus,
  Activity,
  FileText,
  AlertCircle,
} from "lucide-react";
import { WorkflowTemplate } from "../types";
import WorkflowList from "./WorkflowList";
import WorkflowBuilder from "./WorkflowBuilder";
import WorkflowExecutionViewer from "./WorkflowExecutionViewer";
import IssueFlowChat from "../components/IssueFlowChat";

interface WorkflowAutomationProps {
  onBack: () => void;
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "log-collection",
    name: "Automated Log Collection & Anomaly Detection",
    description:
      "Trigger on schedule or alert to fetch logs via SSH/file watchers, then feed to AI for pattern recognition",
    icon: "Activity",
    category: "log-collection",
    defaultTrigger: "schedule",
    defaultSchedule: "0 */4 * * *",
    configSchema: ["sshHosts", "logPaths", "aiModel", "alertThresholds"],
  },
  {
    id: "diagnosis-bot",
    name: "Symptom-Based Interactive Diagnosis Bot",
    description:
      "Automated diagnostic workflows that analyze symptoms and provide intelligent recommendations",
    icon: "FileText",
    category: "diagnosis",
    defaultTrigger: "event",
    configSchema: ["endpoints", "aiModel", "scanInterval"],
  },
  {
    id: "ticket-escalation",
    name: "Auto-Ticket Generation & Escalation",
    description:
      "Integrate with Jira or email when AI detects unresolvable issues from initial scans",
    icon: "AlertCircle",
    category: "ticketing",
    defaultTrigger: "event",
    configSchema: ["integrations", "alertThresholds", "aiModel"],
  },
];

type ViewMode = "list" | "builder" | "execution" | "issue2flow"; // Added 'issue2flow'

export default function WorkflowAutomation({
  onBack,
}: WorkflowAutomationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null
  );

  const handleCreateWorkflow = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setViewMode("builder");
  };

  const handleViewExecution = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setViewMode("execution");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedTemplate(null);
    setSelectedWorkflowId(null);
  };

  // Render IssueToFlow when in that mode
  if (viewMode === "issue2flow") {
    return <IssueFlowChat onBack={handleBackToList} />;
  }

  if (viewMode === "builder" && selectedTemplate) {
    return (
      <WorkflowBuilder
        template={selectedTemplate}
        onBack={handleBackToList}
        onSave={handleBackToList}
      />
    );
  }

  if (viewMode === "execution" && selectedWorkflowId) {
    return (
      <WorkflowExecutionViewer
        workflowId={selectedWorkflowId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="workflow-automation">
      <div className="workflow-header">
        <button className="back-button" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <div className="workflow-header-info">
          <h2>Workflow Automation</h2>
          <p className="workflow-subtitle">n8n-Style Automated Workflows</p>
        </div>
      </div>

      <div className="workflow-content">
        <div className="workflow-section">
          <h3 className="section-title">Create New Workflow</h3>
          <div className="workflow-templates-grid">
            {workflowTemplates.map((template) => {
              let IconComponent;
              switch (template.icon) {
                case "Activity":
                  IconComponent = Activity;
                  break;
                case "FileText":
                  IconComponent = FileText;
                  break;
                case "AlertCircle":
                  IconComponent = AlertCircle;
                  break;
                default:
                  IconComponent = Activity;
              }

              return (
                <div
                  key={template.id}
                  className="workflow-template-card"
                  onClick={() => handleCreateWorkflow(template)}
                >
                  <div className="template-icon">
                    <IconComponent size={36} />
                  </div>
                  <h4 className="template-title">{template.name}</h4>
                  <p className="template-description">{template.description}</p>
                  <button className="template-button">
                    <Plus size={18} />
                    <span>Create Workflow</span>
                  </button>
                </div>
              );
            })}
            {/* Button to open IssueToFlow */}
            <div
              className="workflow-template-card"
              onClick={() => setViewMode("issue2flow")}
            >
              <div className="template-icon">
                <Activity size={36} />
              </div>
              <h4 className="template-title">Issue Visualizer</h4>
              <p className="template-description">
                Generate workflow from a reported issue using AI
              </p>
              <button className="template-button">
                <Plus size={18} />
                <span>Generate Flow</span>
              </button>
            </div>
          </div>
        </div>

        <div className="workflow-section">
          <h3 className="section-title">Active Workflows</h3>
          <WorkflowList onViewExecution={handleViewExecution} />
        </div>
      </div>

      <div className="watermark">SuperHack 2025</div>
    </div>
  );
}
