import { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import LandingPage from "./components/LandingPage";
import ChatInterface from "./components/ChatInterface";
import ReportViewer from "./components/ReportViewer";
import WorkflowAutomation from "./components/WorkflowAutomation";
type AppView = "splash" | "landing" | "chat" | "report" | "workflows";

function App() {
  const [currentView, setCurrentView] = useState<AppView>("splash");
  const [selectedService, setSelectedService] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [reportContent, setReportContent] = useState<string>("");

  const handleSplashComplete = () => {
    setCurrentView("landing");
  };

  const handleServiceSelect = (serviceId: string, title: string) => {
    console.log("Selected service:", serviceId, title);
    if (serviceId === "automated-workflows") {
      setCurrentView("workflows");
    } else {
      setSelectedService({ id: serviceId, title });
      setCurrentView("chat");
    }
  };

  const handleBackToLanding = () => {
    setCurrentView("landing");
    setSelectedService(null);
  };

  const handleViewReport = (content: string) => {
    setReportContent(content);
    setCurrentView("report");
  };

  const handleBackToChat = () => {
    setCurrentView("chat");
  };

  return (
    <>
      {currentView === "splash" && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {currentView === "landing" && (
        <LandingPage onServiceSelect={handleServiceSelect} />
      )}

      {currentView === "chat" && selectedService && (
        <ChatInterface
          serviceId={selectedService.id}
          serviceTitle={selectedService.title}
          onBack={handleBackToLanding}
          onViewReport={handleViewReport}
        />
      )}

      {currentView === "report" && (
        <ReportViewer reportContent={reportContent} onBack={handleBackToChat} />
      )}

      {currentView === "workflows" && (
        <WorkflowAutomation onBack={handleBackToLanding} />
      )}
    </>
  );
}

export default App;
