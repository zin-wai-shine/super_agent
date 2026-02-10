import React from 'react';
import CodeBlock from '../Common/CodeBlock';

const MapConfiguration = () => (
    <div className="page-section">
        <h2>🗺️ Map Configuration & Mode</h2>
        <p>Configuration guide for the Google Maps integration used in listings and location pickers.</p>

        <div className="info-box warning">
            <span className="info-box-icon">⚠️</span>
            <div>
                <strong>Requirement:</strong> Maps will NOT load without a valid API Key. You must enable the <strong>Maps JavaScript API</strong> and <strong>Places API</strong> in Google Cloud Console.
            </div>
        </div>

        <h3>How it Works</h3>
        <p>
            The application uses the <code>@react-google-maps/api</code> library. The map state (open/closed) is managed globally via URL parameters
            (<code>?view=map</code>) and local storage (<code>show_google_map</code>).
        </p>

        <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-title">🔑 Setting the API Key</div>
            <div className="card-subtitle">Where to fix/update the credentials</div>

            <div className="workflow-step" style={{ marginBottom: '0' }}>
                <div className="step-number">1</div>
                <div className="step-content">
                    <h4>Get a Key</h4>
                    <p>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Google Cloud Console</a>.</p>
                    <p>Create a project and enable:</p>
                    <ul>
                        <li>Maps JavaScript API</li>
                        <li>Places API (for autocomplete)</li>
                    </ul>
                    <p>Create a credential (API Key) and restrict it to your domain (HTTP Referrer) for security.</p>
                </div>
            </div>

            <div className="workflow-step" style={{ marginBottom: '0', marginTop: '24px' }}>
                <div className="step-number">2</div>
                <div className="step-content">
                    <h4>Update the Code</h4>
                    <p>Open <code>frontend/.env</code> and paste your key:</p>
                    <CodeBlock>REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyB...YourKeyHere</CodeBlock>

                    <p>If deploying via Docker, ensure the build argument is passed in <code>docker-compose.yml</code>:</p>
                    <CodeBlock language="yaml">{`  frontend:
    build:
      args:
        - REACT_APP_GOOGLE_MAPS_API_KEY=\${REACT_APP_GOOGLE_MAPS_API_KEY}`}</CodeBlock>
                </div>
            </div>
        </div>

        <h3>Troubleshooting</h3>
        <ul className="file-tree" style={{ listStyle: 'none', padding: '24px' }}>
            <li>
                <span style={{ color: 'var(--red)' }}>Map shows "Development Purposes Only"</span>
                <br />
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>The API key is missing or invalid. Check your .env file.</span>
            </li>
            <li style={{ marginTop: '16px' }}>
                <span style={{ color: 'var(--red)' }}>Search Autocomplete not working</span>
                <br />
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>The "Places API" is likely not enabled in Google Cloud Console.</span>
            </li>
            <li style={{ marginTop: '16px' }}>
                <span style={{ color: 'var(--red)' }}>Map not loading in Docker</span>
                <br />
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>You must rebuild the container after changing the .env file: <CodeBlock language="bash">docker compose up --build</CodeBlock> configuration variables are baked in at build time.</span>
            </li>
        </ul>
    </div>
);

export default MapConfiguration;
