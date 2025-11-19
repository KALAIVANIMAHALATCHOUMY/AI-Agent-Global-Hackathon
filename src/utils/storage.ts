import { ChatSession, Report } from '../types';

const CHAT_HISTORY_KEY = 'superdesk_chat_history';
const REPORTS_KEY = 'superdesk_reports';

export const saveChatSession = (session: ChatSession): void => {
  const sessions = getChatSessions();
  const index = sessions.findIndex(s => s.id === session.id);

  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }

  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions));
};

export const getChatSessions = (): ChatSession[] => {
  const data = localStorage.getItem(CHAT_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const getChatSession = (id: string): ChatSession | null => {
  const sessions = getChatSessions();
  return sessions.find(s => s.id === id) || null;
};

export const deleteChatSession = (id: string): void => {
  const sessions = getChatSessions().filter(s => s.id !== id);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions));
};

export const saveReport = (report: Report): void => {
  const reports = getReports();
  reports.push(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

export const getReports = (): Report[] => {
  const data = localStorage.getItem(REPORTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const downloadMarkdown = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
