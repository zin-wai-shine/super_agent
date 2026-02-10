import React from 'react';
import CodeBlock from '../Common/CodeBlock';

const DeploymentGuide = () => (
    <div className="page-section">
        <h2>🚀 Deployment Guide</h2>
        <p>Step-by-step instructions for deploying the Super Real Estate platform to a production server.</p>

        <div className="info-box info">
            <span className="info-box-icon">ℹ️</span>
            <div>
                <strong>Prerequisites:</strong> You need a server with <strong>Docker</strong> and <strong>Docker Compose</strong> installed.
            </div>
        </div>

        <h3>1. Clone & Configure</h3>
        <div className="workflow-step">
            <div className="step-number">1</div>
            <div className="step-content">
                <h4>Clone the Repository</h4>
                <CodeBlock language="bash">{`git clone https://github.com/your-repo/super-real-estate.git
cd super-real-estate`}</CodeBlock>
            </div>
        </div>

        <div className="workflow-step">
            <div className="step-number">2</div>
            <div className="step-content">
                <h4>Set Environment Variables</h4>
                <p>You must configure the environment variables for production. Create or edit the <code>.env</code> files or set them in your CI/CD pipeline.</p>

                <div className="card" style={{ marginTop: '16px' }}>
                    <div className="card-title">Frontend Config (<code>frontend/.env</code>)</div>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <li style={{ marginBottom: '8px' }}>
                            <code style={{ color: 'var(--accent)' }}>REACT_APP_API_URL</code>:
                            Set to your production domain API (e.g., <code>https://api.yourdomain.com</code>).
                        </li>
                        <li>
                            <code style={{ color: 'var(--accent)' }}>REACT_APP_GOOGLE_MAPS_API_KEY</code>:
                            Your production Google Maps API Key (restricted to your domain).
                        </li>
                    </ul>
                </div>

                <div className="card">
                    <div className="card-title">Backend Config (<code>docker-compose.yml</code>)</div>
                    <p style={{ fontSize: '13px', marginBottom: '12px' }}>Update these values in <code>docker-compose.yml</code> or use a <code>.env</code> file:</p>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <li style={{ marginBottom: '8px' }}>
                            <code style={{ color: 'var(--accent)' }}>JWT_SECRET</code>:
                            <strong>CRITICAL:</strong> Change this to a long, random string.
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <code style={{ color: 'var(--accent)' }}>POSTGRES_PASSWORD</code>:
                            Set a strong database password.
                        </li>
                        <li>
                            <code style={{ color: 'var(--accent)' }}>GIN_MODE</code>:
                            Set to <code>release</code> for production performance.
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <h3>2. Build & Run</h3>
        <div className="workflow-step">
            <div className="step-number">3</div>
            <div className="step-content">
                <h4>Start the Application</h4>
                <p>Run the following command to build and start all services in detached mode:</p>
                <CodeBlock language="bash">docker compose up --build -d</CodeBlock>

                <p>This will start:</p>
                <ul>
                    <li><strong>PostgreSQL</strong> (Database)</li>
                    <li><strong>Backend</strong> (Go API on port 8080)</li>
                    <li><strong>Frontend</strong> (React App on port 3000)</li>
                    <li><strong>Nginx</strong> (Reverse Proxy on port 8000/80)</li>
                </ul>
            </div>
        </div>

        <h3>3. SSL & Domain Setup</h3>
        <div className="workflow-step">
            <div className="step-number">4</div>
            <div className="step-content">
                <h4>Configure Nginx / SSL</h4>
                <p>
                    For production, you should run a reverse proxy like Nginx or Traefik in front of the Docker containers to handle SSL/HTTPS.
                    The included <code>nginx</code> service is a basic example.
                </p>
                <p style={{ marginTop: '12px' }}>
                    <strong>Recommended:</strong> Use <a href="https://certbot.eff.org/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Certbot</a> to generate free SSL certificates for your domain.
                </p>
            </div>
        </div>
    </div>
);

export default DeploymentGuide;
