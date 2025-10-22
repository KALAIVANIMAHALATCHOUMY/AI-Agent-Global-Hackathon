import { useState } from 'react';
import { ChevronLeft, Save, Plus, Trash2 } from 'lucide-react';
import { WorkflowTemplate, Workflow, WorkflowConfig, AIModel, WorkflowTrigger } from '../types';
import { saveWorkflow } from '../utils/workflowStorage';

interface WorkflowBuilderProps {
  template: WorkflowTemplate;
  onBack: () => void;
  onSave: () => void;
}

export default function WorkflowBuilder({ template, onBack, onSave }: WorkflowBuilderProps) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [trigger, setTrigger] = useState<WorkflowTrigger>(template.defaultTrigger);
  const [schedule, setSchedule] = useState(template.defaultSchedule || '0 */4 * * *');
  const [aiModel, setAIModel] = useState<AIModel>('local');

  const [sshHosts, setSshHosts] = useState<string[]>(['']);
  const [logPaths, setLogPaths] = useState<string[]>(['']);
  const [endpoints, setEndpoints] = useState<string[]>(['']);

  const [jiraUrl, setJiraUrl] = useState('');
  const [jiraApiKey, setJiraApiKey] = useState('');
  const [emailSmtp, setEmailSmtp] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');

  const handleArrayChange = (
    arr: string[],
    setArr: (arr: string[]) => void,
    index: number,
    value: string
  ) => {
    const newArr = [...arr];
    newArr[index] = value;
    setArr(newArr);
  };

  const handleAddItem = (arr: string[], setArr: (arr: string[]) => void) => {
    setArr([...arr, '']);
  };

  const handleRemoveItem = (arr: string[], setArr: (arr: string[]) => void, index: number) => {
    setArr(arr.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const config: WorkflowConfig = {};

    if (template.configSchema.includes('sshHosts')) {
      config.sshHosts = sshHosts.filter(h => h.trim());
    }
    if (template.configSchema.includes('logPaths')) {
      config.logPaths = logPaths.filter(p => p.trim());
    }
    if (template.configSchema.includes('endpoints')) {
      config.endpoints = endpoints.filter(e => e.trim());
    }
    if (template.configSchema.includes('aiModel')) {
      config.aiModel = aiModel;
    }
    if (template.configSchema.includes('integrations')) {
      config.integrations = {};
      if (jiraUrl && jiraApiKey) {
        config.integrations.jira = { url: jiraUrl, apiKey: jiraApiKey };
      }
      if (emailSmtp && emailRecipients) {
        config.integrations.email = {
          smtp: emailSmtp,
          recipients: emailRecipients.split(',').map(e => e.trim())
        };
      }
      if (slackWebhook) {
        config.integrations.slack = { webhook: slackWebhook };
      }
    }

    const workflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name,
      description,
      category: template.category,
      trigger,
      schedule: trigger === 'schedule' ? schedule : undefined,
      status: 'active',
      enabled: true,
      executions: [],
      config,
      createdAt: Date.now()
    };

    saveWorkflow(workflow);
    onSave();
  };

  return (
    <div className="workflow-builder">
      <div className="workflow-header">
        <button className="back-button" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <div className="workflow-header-info">
          <h2>Create Workflow</h2>
          <p className="workflow-subtitle">{template.name}</p>
        </div>
      </div>

      <div className="workflow-builder-content">
        <div className="builder-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-group">
            <label className="form-label">Workflow Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workflow name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow does"
              rows={3}
            />
          </div>
        </div>

        <div className="builder-section">
          <h3 className="section-title">Trigger Configuration</h3>
          <div className="form-group">
            <label className="form-label">Trigger Type</label>
            <select
              className="form-select"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as WorkflowTrigger)}
            >
              <option value="schedule">Schedule (Cron)</option>
              <option value="event">Event-based</option>
              <option value="webhook">Webhook</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {trigger === 'schedule' && (
            <div className="form-group">
              <label className="form-label">Cron Schedule</label>
              <input
                type="text"
                className="form-input"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="0 */4 * * * (every 4 hours)"
              />
              <p className="form-hint">Use cron syntax: minute hour day month weekday</p>
            </div>
          )}
        </div>

        {template.configSchema.includes('aiModel') && (
          <div className="builder-section">
            <h3 className="section-title">AI Configuration</h3>
            <div className="form-group">
              <label className="form-label">AI Model</label>
              <select
                className="form-select"
                value={aiModel}
                onChange={(e) => setAIModel(e.target.value as AIModel)}
              >
                <option value="local">Local SLM</option>
                <option value="phi">Phi</option>
                <option value="claude">Claude</option>
                <option value="gemini">Gemini</option>
                <option value="titan">Amazon Titan</option>
              </select>
            </div>
          </div>
        )}

        {template.configSchema.includes('sshHosts') && (
          <div className="builder-section">
            <h3 className="section-title">SSH Hosts</h3>
            {sshHosts.map((host, index) => (
              <div key={index} className="form-array-item">
                <input
                  type="text"
                  className="form-input"
                  value={host}
                  onChange={(e) => handleArrayChange(sshHosts, setSshHosts, index, e.target.value)}
                  placeholder="user@hostname or IP address"
                />
                {sshHosts.length > 1 && (
                  <button
                    className="array-remove-btn"
                    onClick={() => handleRemoveItem(sshHosts, setSshHosts, index)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button className="array-add-btn" onClick={() => handleAddItem(sshHosts, setSshHosts)}>
              <Plus size={18} />
              <span>Add SSH Host</span>
            </button>
          </div>
        )}

        {template.configSchema.includes('logPaths') && (
          <div className="builder-section">
            <h3 className="section-title">Log Paths</h3>
            {logPaths.map((path, index) => (
              <div key={index} className="form-array-item">
                <input
                  type="text"
                  className="form-input"
                  value={path}
                  onChange={(e) => handleArrayChange(logPaths, setLogPaths, index, e.target.value)}
                  placeholder="/var/log/syslog or C:\Logs\app.log"
                />
                {logPaths.length > 1 && (
                  <button
                    className="array-remove-btn"
                    onClick={() => handleRemoveItem(logPaths, setLogPaths, index)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button className="array-add-btn" onClick={() => handleAddItem(logPaths, setLogPaths)}>
              <Plus size={18} />
              <span>Add Log Path</span>
            </button>
          </div>
        )}

        {template.configSchema.includes('endpoints') && (
          <div className="builder-section">
            <h3 className="section-title">Monitoring Endpoints</h3>
            {endpoints.map((endpoint, index) => (
              <div key={index} className="form-array-item">
                <input
                  type="text"
                  className="form-input"
                  value={endpoint}
                  onChange={(e) => handleArrayChange(endpoints, setEndpoints, index, e.target.value)}
                  placeholder="https://api.example.com/health"
                />
                {endpoints.length > 1 && (
                  <button
                    className="array-remove-btn"
                    onClick={() => handleRemoveItem(endpoints, setEndpoints, index)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button className="array-add-btn" onClick={() => handleAddItem(endpoints, setEndpoints)}>
              <Plus size={18} />
              <span>Add Endpoint</span>
            </button>
          </div>
        )}

        {template.configSchema.includes('integrations') && (
          <div className="builder-section">
            <h3 className="section-title">Integrations</h3>

            <div className="integration-group">
              <h4 className="integration-title">Jira</h4>
              <div className="form-group">
                <label className="form-label">Jira URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={jiraUrl}
                  onChange={(e) => setJiraUrl(e.target.value)}
                  placeholder="https://your-domain.atlassian.net"
                />
              </div>
              <div className="form-group">
                <label className="form-label">API Key</label>
                <input
                  type="password"
                  className="form-input"
                  value={jiraApiKey}
                  onChange={(e) => setJiraApiKey(e.target.value)}
                  placeholder="Your Jira API key"
                />
              </div>
            </div>

            <div className="integration-group">
              <h4 className="integration-title">Email</h4>
              <div className="form-group">
                <label className="form-label">SMTP Server</label>
                <input
                  type="text"
                  className="form-input"
                  value={emailSmtp}
                  onChange={(e) => setEmailSmtp(e.target.value)}
                  placeholder="smtp.gmail.com:587"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Recipients (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="admin@example.com, team@example.com"
                />
              </div>
            </div>

            <div className="integration-group">
              <h4 className="integration-title">Slack</h4>
              <div className="form-group">
                <label className="form-label">Webhook URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
            </div>
          </div>
        )}

        <div className="builder-actions">
          <button className="builder-action-btn cancel" onClick={onBack}>
            Cancel
          </button>
          <button className="builder-action-btn save" onClick={handleSave}>
            <Save size={20} />
            <span>Save Workflow</span>
          </button>
        </div>
      </div>
    </div>
  );
}
