import { useEffect } from 'react';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="grid-background"></div>
      <div className="splash-content">
        <div className="logo-container">
          <Zap className="logo-icon" size={80} />
        </div>
        <h1 className="splash-title">SuperDesk.AI</h1>
        <div className="loading-text">
          <span className="loading-cursor">▮</span> Initializing SuperDesk...
        </div>
      </div>
    </div>
  );
}
