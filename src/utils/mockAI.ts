import { AIModel } from '../types';

export const generateAIResponse = async (
  message: string,
  model: AIModel,
  serviceType: string,
  isOffline: boolean
): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

  const responses: Record<string, string[]> = {
    'offline-troubleshooting': [
      'Based on your description, let me help you troubleshoot this offline. First, can you verify if the device has power and all cables are properly connected?',
      'I recommend checking the following:\n\n1. **Power Supply**: Ensure the device is receiving adequate power\n2. **Network Connectivity**: Check if network cables are securely connected\n3. **System Logs**: Review recent error logs for any critical events\n\nWould you like me to guide you through any specific step?',
      'Let me run a diagnostic check. Based on the symptoms, this appears to be a **hardware connectivity issue**. I suggest:\n\n- Reseat all connection cables\n- Test with alternative ports\n- Verify network switch functionality\n\nShall I generate a detailed troubleshooting report?'
    ],
    'network-diagnostics': [
      'Running network diagnostics now. I will check:\n\n✓ **Ping Test** - Checking host reachability\n✓ **DNS Resolution** - Verifying domain name resolution\n✓ **Port Scan** - Testing common service ports\n✓ **Traceroute** - Mapping network path\n\nPlease wait...',
      'Network diagnostic results:\n\n```\nPing: 192.168.1.1 - Response Time: 12ms ✓\nDNS: Primary/Secondary servers responding ✓\nGateway: Reachable and responding ✓\nBandwidth: 850 Mbps down / 42 Mbps up\n```\n\nNetwork appears healthy. Is there a specific connectivity issue you are experiencing?',
      'I have identified potential network bottlenecks:\n\n- **High latency** detected on router hop 3\n- **Packet loss** of 2.3% to external gateway\n\nRecommendation: Reset router and update firmware to latest version.'
    ],
    'system-optimization': [
      'Let me analyze system performance metrics:\n\n**CPU Usage**: 68% (High)\n**Memory**: 14.2GB / 16GB (88%)\n**Disk I/O**: Moderate activity\n**Background Processes**: 247 running\n\nI recommend optimizing startup programs and clearing temporary files.',
      'System optimization in progress:\n\n✓ Cleared 2.4GB temporary files\n✓ Disabled 12 unnecessary startup programs\n✓ Defragmented system drive\n✓ Updated system drivers\n\nExpected performance improvement: **25-30%**',
      'Performance analysis complete. Your system would benefit from:\n\n1. RAM upgrade to 32GB\n2. SSD replacement (current drive showing wear)\n3. GPU driver update\n\nWould you like detailed specifications for hardware upgrades?'
    ],
    'ai-guidance': [
      'I am here to provide AI-powered guidance for your technical issue. Please describe the problem in detail, and I will offer step-by-step assistance.',
      'Based on AI analysis, your issue matches **known pattern #A-4782**: Authentication Service Failure. Common causes:\n\n- Expired SSL certificates\n- Misconfigured authentication provider\n- Database connection timeout\n\nWhich area should we investigate first?',
      'AI recommendation: This issue requires immediate escalation. The symptoms indicate a potential security breach. I suggest:\n\n1. Isolate affected systems\n2. Enable enhanced logging\n3. Contact security team\n\nWould you like me to escalate to a human agent?'
    ],
    'sla-monitoring': [
      'SLA Dashboard Overview:\n\n**Current Month Performance**\n- Uptime: 99.97% ✓\n- Response Time: < 200ms (Target: < 500ms) ✓\n- Incident Resolution: Avg 3.2 hours\n- Customer Satisfaction: 4.8/5.0\n\nAll SLA targets are being met.',
      'SLA Alert: Response time has increased to 450ms (approaching threshold of 500ms). Investigating root cause...\n\nPreliminary findings:\n- Database query optimization needed\n- CDN cache hit rate decreased by 12%\n\nRecommended actions provided in report.',
      'SLA Report Generated:\n\n**Critical Metrics**\n- 3 incidents this week\n- Average resolution time: 2.8 hours (Target: < 4 hours) ✓\n- Zero breaches of SLA commitments\n\nDetailed breakdown available for export.'
    ],
    'automated-workflows': [
      'I can help you set up automated workflows. What process would you like to automate?\n\nPopular options:\n- Ticket routing and assignment\n- Backup scheduling\n- Patch management\n- System health monitoring',
      'Workflow automation configured:\n\n**Automated Task**: Daily System Backup\n- **Schedule**: Every day at 2:00 AM\n- **Retention**: 30 days\n- **Notification**: Email on completion/failure\n\nWorkflow is now active and monitoring.',
      'Your automated workflow has been optimized:\n\n✓ Reduced manual intervention by 67%\n✓ Improved response time by 2.3 minutes\n✓ Zero missed scheduled tasks this month\n\nWould you like to create additional automation rules?'
    ]
  };

  const serviceResponses = responses[serviceType] || [
    `I am ${model} model${isOffline ? ' (offline mode)' : ''}. How can I assist you with ${serviceType} today?`,
    'I am analyzing your request. Could you provide more specific details about the issue?',
    'Based on the information provided, I recommend checking system logs and verifying configuration settings. Would you like me to generate a detailed report?'
  ];

  const randomResponse = serviceResponses[Math.floor(Math.random() * serviceResponses.length)];

  if (isOffline) {
    return `[OFFLINE MODE - Local AI] ${randomResponse}`;
  }

  return randomResponse;
};

export const generateMarkdownReport = (
  serviceType: string,
  messages: Array<{ role: string; content: string; timestamp: number }>,
  model: string
): string => {
  const date = new Date().toLocaleString();

  let report = `# SuperDesk Service Report\n\n`;
  report += `**Service Type**: ${serviceType}\n`;
  report += `**AI Model**: ${model}\n`;
  report += `**Generated**: ${date}\n`;
  report += `**Session Duration**: ${messages.length} exchanges\n\n`;
  report += `---\n\n`;
  report += `## Conversation Summary\n\n`;

  messages.forEach((msg, idx) => {
    const time = new Date(msg.timestamp).toLocaleTimeString();
    report += `### ${msg.role === 'user' ? '👤 Technician' : '🤖 AI Assistant'} [${time}]\n\n`;
    report += `${msg.content}\n\n`;
  });

  report += `---\n\n`;
  report += `## Recommendations\n\n`;
  report += `Based on the conversation above, the following actions are recommended:\n\n`;
  report += `1. Review system logs for any error patterns\n`;
  report += `2. Verify all configuration settings are correct\n`;
  report += `3. Test the solution in a controlled environment\n`;
  report += `4. Document the resolution for future reference\n\n`;
  report += `---\n\n`;
  report += `## Follow-up Actions\n\n`;
  report += `- [ ] Implement suggested solutions\n`;
  report += `- [ ] Monitor system for 24 hours\n`;
  report += `- [ ] Update knowledge base\n`;
  report += `- [ ] Close ticket upon verification\n\n`;
  report += `---\n\n`;
  report += `*Generated by SuperDesk.AI - Technician Empowerment Suite*\n`;
  report += `*SuperHack 2025*\n`;

  return report;
};
