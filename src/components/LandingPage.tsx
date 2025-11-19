import { Monitor, Globe, Settings, Brain, BarChart3, Workflow } from 'lucide-react';
import { ServiceCard } from '../types';

interface LandingPageProps {
  onServiceSelect: (serviceId: string, title: string) => void;
}

const services: ServiceCard[] = [
  {
    id: 'offline-troubleshooting',
    title: 'Offline Troubleshooting',
    description: 'Diagnose and resolve issues without internet connectivity',
    icon: 'Monitor'
  },
  {
    id: 'network-diagnostics',
    title: 'Network Diagnostics',
    description: 'Analyze and troubleshoot network connectivity issues',
    icon: 'Globe'
  },
  {
    id: 'system-optimization',
    title: 'System Optimization',
    description: 'Enhance performance and optimize system resources',
    icon: 'Settings'
  },
  {
    id: 'ai-guidance',
    title: 'Agentic AI-Assisted Guidance',
    description: 'Get intelligent recommendations for complex problems',
    icon: 'Brain'
  },
  {
    id: 'sla-monitoring',
    title: 'SLA Monitoring',
    description: 'Track service level agreements and performance metrics',
    icon: 'BarChart3'
  },
  {
    id: 'automated-workflows',
    title: 'Automated Workflows',
    description: 'Streamline repetitive tasks with smart automation',
    icon: 'Workflow'
  }
];

const iconMap = {
  Monitor,
  Globe,
  Settings,
  Brain,
  BarChart3,
  Workflow
};

export default function LandingPage({ onServiceSelect }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="grid-background-subtle"></div>

      <div className="landing-header">
        <h1 className="landing-title">
          Welcome to <span className="gradient-text">SuperDesk</span>
        </h1>
        <p className="landing-subtitle">
          Your Smart Service Companion
        </p>
        <p className="landing-tagline">
          Empowering Technicians with AI & Offline Troubleshooting
        </p>
      </div>

      <div className="services-grid">
        {services.map((service) => {
          const IconComponent = iconMap[service.icon as keyof typeof iconMap];

          return (
            <div
              key={service.id}
              className="service-card"
              onClick={() => onServiceSelect(service.id, service.title)}
            >
              <div className="service-icon">
                <IconComponent size={40} />
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <button className="service-button">
                Start
              </button>
            </div>
          );
        })}
      </div>

      <div className="watermark">SuperHack 2025</div>
    </div>
  );
}
