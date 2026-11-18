import { useState } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

interface HealthStatus {
  status: 'checking' | 'connected' | 'disconnected' | 'error';
  message?: string;
}

function App() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({ status: 'checking' });
  const [dbHealthStatus, setDbHealthStatus] = useState<HealthStatus>({ status: 'checking' });

  const checkBackendHealth = async () => {
    setHealthStatus({ status: 'checking' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (response.ok) {
        const data = await response.json();
        setHealthStatus({ 
          status: 'connected',
          message: `Connected at ${new Date(data.timestamp).toLocaleTimeString()}`
        });
      } else {
        setHealthStatus({ 
          status: 'disconnected',
          message: `HTTP ${response.status}`
        });
      }
    } catch (error) {
      setHealthStatus({ 
        status: 'error',
        message: error instanceof Error ? error.message : 'Network error'
      });
    }
  };

  const checkDatabaseHealth = async () => {
    setDbHealthStatus({ status: 'checking' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/health/db`);
      const data = await response.json();
      
      if (response.ok && data.status === 'ok') {
        setDbHealthStatus({ 
          status: 'connected',
          message: data.message
        });
      } else {
        setDbHealthStatus({ 
          status: 'disconnected',
          message: data.message || 'Database connection failed'
        });
      }
    } catch (error) {
      setDbHealthStatus({ 
        status: 'error',
        message: error instanceof Error ? error.message : 'Network error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return '#10b981'; // green
      case 'disconnected':
        return '#ef4444'; // red
      case 'checking':
        return '#f59e0b'; // amber
      case 'error':
        return '#dc2626'; // dark red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = (status: HealthStatus) => {
    switch (status.status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'checking':
        return 'Checking...';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Opportunity Radar</h1>
          <p className="subtitle">Multi-user opportunity intelligence platform</p>
          <div className="phase-badge">Phase 0: Foundation</div>
        </header>

        <main className="main">
          <section className="description">
            <p>
              Opportunity Radar discovers opportunities, extracts requirements,
              evaluates eligibility, and delivers intelligent notifications.
            </p>
            <p className="phase-note">
              This Phase 0 implementation validates the core infrastructure stack.
            </p>
          </section>

          <section className="status-section">
            <h2>Backend Connectivity</h2>
            
            <div className="status-card">
              <div className="status-header">
                <span className="status-label">API Server</span>
                <div 
                  className="status-indicator" 
                  style={{ backgroundColor: getStatusColor(healthStatus.status) }}
                />
              </div>
              <div className="status-text">
                <strong>{getStatusText(healthStatus)}</strong>
                {healthStatus.message && (
                  <p className="status-message">{healthStatus.message}</p>
                )}
              </div>
              <button onClick={checkBackendHealth} className="check-button">
                Check Backend Health
              </button>
            </div>

            <div className="status-card">
              <div className="status-header">
                <span className="status-label">Database</span>
                <div 
                  className="status-indicator" 
                  style={{ backgroundColor: getStatusColor(dbHealthStatus.status) }}
                />
              </div>
              <div className="status-text">
                <strong>{getStatusText(dbHealthStatus)}</strong>
                {dbHealthStatus.message && (
                  <p className="status-message">{dbHealthStatus.message}</p>
                )}
              </div>
              <button onClick={checkDatabaseHealth} className="check-button">
                Check Database Connection
              </button>
            </div>
          </section>

          <section className="tech-stack">
            <h2>Technology Stack</h2>
            <div className="tech-grid">
              <div className="tech-item">
                <strong>Frontend</strong>
                <span>React + Vite + TypeScript</span>
              </div>
              <div className="tech-item">
                <strong>Backend</strong>
                <span>Cloudflare Workers + Hono</span>
              </div>
              <div className="tech-item">
                <strong>Database</strong>
                <span>Neon PostgreSQL + Drizzle</span>
              </div>
              <div className="tech-item">
                <strong>AI</strong>
                <span>Google Gemini API</span>
              </div>
              <div className="tech-item">
                <strong>Background</strong>
                <span>Cloudflare Queues + Cron</span>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <p>Phase 0 • Technical Feasibility Validation</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
