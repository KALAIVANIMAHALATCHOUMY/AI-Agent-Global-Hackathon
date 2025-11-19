import { ChevronLeft, Download, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { downloadMarkdown } from '../utils/storage';

interface ReportViewerProps {
  reportContent: string;
  onBack: () => void;
}

export default function ReportViewer({ reportContent, onBack }: ReportViewerProps) {
  const handleSaveReport = () => {
    const filename = `superdesk-report-${Date.now()}.md`;
    downloadMarkdown(reportContent, filename);
  };

  const handleSendToManager = () => {
    alert('Send to Manager feature will be available in future integration.\n\nFor now, the report has been saved locally.');
    handleSaveReport();
  };

  return (
    <div className="report-viewer">
      <div className="report-header">
        <button className="back-button" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>
        <h2>Diagnostic Report</h2>
        <div className="report-actions">
          <button className="report-button save" onClick={handleSaveReport}>
            <Download size={20} />
            <span>Save Report</span>
          </button>
          <button className="report-button send" onClick={handleSendToManager}>
            <Send size={20} />
            <span>Send to Manager</span>
          </button>
        </div>
      </div>

      <div className="report-content">
        <div className="markdown-preview">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {reportContent}
          </ReactMarkdown>
        </div>
      </div>

      <div className="watermark">SuperHack 2025</div>
    </div>
  );
}
