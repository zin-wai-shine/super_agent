import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useParams } from 'react-router-dom';
import CodeBlock from '../components/Common/CodeBlock';

const WorkflowGuide = () => {
    const { section } = useParams();

    const titles = {
        'dataflow': '📊 End-to-End Data Flow',
        'mindmap': '🌐 Project Mind Map',
        'add-column': '➕ How to Add a Column',
        'modify-column': '✏️ How to Modify a Column',
        'add-model': '🏗️ How to Add a New Model',
        'api-routes': '🔗 API Routes Reference',
    };

    return (
        <div>
            <div className="page-header">
                <h1>⚙️ Workflow & Modification Guide</h1>
                <p>{titles[section] || 'Workflow documentation'}</p>
            </div>

            {section === 'dataflow' && <DataFlowSection />}
            {section === 'mindmap' && <MindmapSection />}
            {section === 'add-column' && <AddColumnSection />}
            {section === 'modify-column' && <ModifyColumnSection />}
            {section === 'add-model' && <AddModelSection />}
            {section === 'api-routes' && <ApiRoutesSection />}
        </div>
    );
};

/* ===== MERMAID WRAPPER ===== */
const Mermaid = ({ chart }) => {
    const ref = useRef();

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Inter, system-ui, sans-serif',
        });
        if (ref.current) {
            mermaid.contentLoaded();
        }
    }, [chart]);

    return (
        <div className="mermaid" ref={ref} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '12px', border: '1px solid var(--sidebar-border)' }}>
            {chart}
        </div>
    );
};

/* ===== MINDMAP SECTION ===== */
const MindmapSection = () => {
    const chart = `
graph TD
    subgraph "🌐 Client Tier (React)"
        A["🖥️ Browser UI"] --> B["🔌 API Services (Axios)"]
        B --> C["🗂️ Context Providers (Auth/Theme)"]
    end

    subgraph "🔐 Security & Routing (Backend)"
        D["🛣️ Gin Router (routes.go)"]
        E["🛡️ Middleware Pipeline"]
        D --> E
        E --> F["🆔 Auth Middleware (JWT)"]
        E --> G["🏢 Tenant Middleware (Domain)"]
        E --> H["👑 Role Middleware"]
    end

    subgraph "⚙️ Logic Tier (Go Controllers)"
        I["🎮 Controllers (*_controller.go)"]
        F & G & H --> I
        I --> J["📝 Business Logic"]
    end

    subgraph "💾 Data Tier (GORM + PostgreSQL)"
        K["🏗️ Models (models.go)"]
        L["🗃️ PostgreSQL DB"]
        I --> K
        K --> L
    end

    B -- "HTTP Request" --> D
    L -- "Response Data" --> I
    I -- "JSON" --> B
    `;

    return (
        <div>
            <div className="card">
                <div className="card-title">🌐 Project Technical Mind Map</div>
                <div className="card-subtitle">Visual representation of system architecture and data flow</div>
                <div style={{ marginTop: '24px' }}>
                    <Mermaid chart={chart} />
                </div>
            </div>

            <div className="card">
                <div className="card-title">📦 Component Breakdown</div>
                <div className="role-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: '20px' }}>
                    <div className="role-card">
                        <div className="role-card-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>⚛️</div>
                        <h3>Frontend</h3>
                        <p>React 19 + Tailwind CSS. Multi-tenant context for branding and JWT for security.</p>
                    </div>
                    <div className="role-card">
                        <div className="role-card-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>🐹</div>
                        <h3>Backend</h3>
                        <p>Go with Gin Framework. High-performance REST API with structured routing.</p>
                    </div>
                    <div className="role-card">
                        <div className="role-card-icon" style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc' }}>🔗</div>
                        <h3>Database</h3>
                        <p>GORM ORM over PostgreSQL. Handles automated migrations and complex relationships.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ===== DATA FLOW ===== */
const DataFlowSection = () => (
    <div>
        <div className="card">
            <div className="card-title">🔄 End-to-End Data Flow</div>
            <div className="card-subtitle">How a request travels from the browser to the database and back</div>

            <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                    <h4>Frontend (React Component)</h4>
                    <p>
                        User interacts with a page (e.g. <code>CreateListing.js</code>). The component collects form data
                        and calls an API service function from <code>src/services/api.js</code>.
                    </p>
                    <CodeBlock language="javascript">{`// Example: Creating a listing
import { agentApi } from '../services/api';
const response = await agentApi.createListing(formData);`}</CodeBlock>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                    <h4>API Service Layer (<code>src/services/api.js</code>)</h4>
                    <p>
                        Centralized Axios instance with interceptors for auth tokens and token refresh.
                        All API calls go through this file. Each entity has its own API object
                        (<code>agentApi</code>, <code>adminApi</code>, <code>publicApi</code>, etc.).
                    </p>
                    <CodeBlock language="javascript">{`// api.js - Agent API
export const agentApi = {
    getListings: (params) => api.get('/agent/listings', { params }),
    createListing: (data) => api.post('/agent/listings', data),
    // ...
};

// api.js - Public Tenant API
export const publicApi = {
    getTenantConfig: () => api.get('/public/tenant/config'),
};`}</CodeBlock>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                    <h4>Backend Router (<code>routes/routes.go</code>)</h4>
                    <p>
                        The Gin router receives the HTTP request and routes it to the correct controller,
                        applying middleware (Auth, Role, Tenant) along the way.
                    </p>
                    <CodeBlock language="go">{`// routes.go
agent.POST("/listings", agentController.CreateListing)
agent.GET("/listings", agentController.GetListings)`}</CodeBlock>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                    <h4>Middleware & Context Pipeline</h4>
                    <p>
                        <strong>TenantMiddleware (Backend)</strong> — Resolves agent from <code>Host</code> header<br />
                        <strong>TenantContext (Frontend)</strong> — Pre-fetches agent config and branding<br />
                        <strong>AuthMiddleware</strong> — Validates JWT token and sets user context<br />
                        <strong>RoleMiddleware</strong> — Checks user role (super_admin, agent, etc.)
                    </p>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">5</div>
                <div className="step-content">
                    <h4>Controller (<code>controllers/*.go</code>)</h4>
                    <p>
                        The controller handles business logic: validates input, queries the database via GORM,
                        and returns a JSON response.
                    </p>
                    <CodeBlock language="go">{`// agent_controller.go
func (ac *AgentController) CreateListing(c *gin.Context) {
    var input models.Listing
    c.ShouldBindJSON(&input)
    ac.DB.Create(&input)
    c.JSON(201, input)
}`}</CodeBlock>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">6</div>
                <div className="step-content">
                    <h4>Model & Database (<code>models/models.go</code>)</h4>
                    <p>
                        GORM auto-migrates the model struct to PostgreSQL. The model defines columns, types,
                        constraints, and relationships. GORM handles the SQL queries.
                    </p>
                    <CodeBlock language="go">{`// models.go
type Listing struct {
    ID    uuid.UUID \`gorm:"type:uuid;primary_key"\`
    Title string    \`gorm:"size:255;not null"\`
    Price float64   \`gorm:"type:decimal(15,2)"\`
    // ...
}`}</CodeBlock>
                </div>
            </div>
        </div>

        <div className="info-box info">
            <span className="info-box-icon">💡</span>
            <div>
                <strong>Key Insight:</strong> GORM's AutoMigrate in <code>main.go</code> automatically creates/updates
                database tables based on model structs. Simply adding a field to the model struct will add the column
                to the database on next restart.
            </div>
        </div>

        {/* File Impact Map */}
        <div className="card">
            <div className="card-title">📁 File Impact Map</div>
            <div className="card-subtitle">Which files are involved for each entity</div>
            <table className="doc-table">
                <thead>
                    <tr>
                        <th>Entity</th>
                        <th>Model</th>
                        <th>Controller</th>
                        <th>Routes</th>
                        <th>Frontend API</th>
                        <th>Frontend Pages</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>User</strong></td>
                        <td><code>models.go</code></td>
                        <td><code>auth_controller.go</code></td>
                        <td><code>routes.go</code></td>
                        <td><code>api.js</code> → authApi</td>
                        <td><code>LoginPage.js</code>, <code>RegisterPage.js</code>, <code>UserProfile.js</code></td>
                    </tr>
                    <tr>
                        <td><strong>Agent</strong></td>
                        <td><code>models.go</code></td>
                        <td><code>super_admin_controller.go</code>, <code>agent_controller.go</code></td>
                        <td><code>routes.go</code></td>
                        <td><code>api.js</code> → adminApi, agentApi</td>
                        <td><code>AgentManagement.js</code>, <code>AgentSettings.js</code>, <code>AgentDashboard.js</code> (all under <code>/dashboard</code>)</td>
                    </tr>
                    <tr>
                        <td><strong>Listing</strong></td>
                        <td><code>models.go</code></td>
                        <td><code>agent_controller.go</code>, <code>public_controller.go</code></td>
                        <td><code>routes.go</code></td>
                        <td><code>api.js</code> → agentApi, publicApi</td>
                        <td><code>AgentListings.js</code>, <code>CreateListing.js</code>, <code>EditListing.js</code>, <code>ListingsPage.js</code>, <code>ListingDetailPage.js</code></td>
                    </tr>
                    <tr>
                        <td><strong>Media</strong></td>
                        <td><code>models.go</code></td>
                        <td><code>upload_controller.go</code></td>
                        <td><code>routes.go</code></td>
                        <td><code>api.js</code> → uploadApi</td>
                        <td><code>CreateListing.js</code>, <code>EditListing.js</code></td>
                    </tr>
                    <tr>
                        <td><strong>Station</strong></td>
                        <td><code>models.go</code></td>
                        <td><code>public_controller.go</code></td>
                        <td><code>routes.go</code></td>
                        <td><code>api.js</code> → publicApi</td>
                        <td><code>ListingsPage.js</code> (TransitMapFilter)</td>
                    </tr>
                    <tr>
                        <td><strong>Theme</strong></td>
                        <td><code>models.go</code></td>
                        <td><code>agent_controller.go</code></td>
                        <td><code>routes.go</code></td>
                        <td><code>api.js</code> → agentApi</td>
                        <td><code>ThemeSettings.js</code>, <code>PublicLayout.js</code></td>
                    </tr>
                    <tr>
                        <td><strong>Subscription</strong></td>
                        <td><code>models.go</code></td>
                        <td><code>super_admin_controller.go</code></td>
                        <td><code>routes.go</code></td>
                        <td><code>api.js</code> → adminApi</td>
                        <td><code>SubscriptionPlans.js</code>, <code>AgentManagement.js</code></td>
                    </tr>
                    <tr>
                        <td><strong>Notification</strong></td>
                        <td><code>models.go</code></td>
                        <td><code>notification_controller.go</code></td>
                        <td><code>routes.go</code></td>
                        <td><code>api.js</code> → notificationApi</td>
                        <td><code>NotificationCenter.js</code></td>
                    </tr>
                    <tr>
                        <td><strong>Banner</strong></td>
                        <td><code>models.go</code></td>
                        <td><code>banner_controller.go</code></td>
                        <td><code>routes.go</code></td>
                        <td><code>api.js</code> → bannerApi</td>
                        <td><code>BannerManagement.js</code>, <code>BannerDetail.js</code>, <code>HomePage.js</code></td>
                    </tr>
                    <tr>
                        <td><strong>Appointment</strong></td>
                        <td><code>models.go</code></td>
                        <td><code>appointment_controller.go</code></td>
                        <td><code>routes.go</code></td>
                        <td><code>api.js</code> → appointmentApi</td>
                        <td><code>AppointmentManagement.js</code>, <code>BookAppointment.js</code>, <code>MyBookings.js</code></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div className="card">
            <div className="card-title">🗺️ Frontend Routes & Pages</div>
            <div className="card-subtitle">Key pages and their corresponding routes</div>
            <table className="doc-table">
                <thead>
                    <tr>
                        <th>Page Name</th>
                        <th>Component</th>
                        <th>Route</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan="4"><h4>Public Routes</h4></td>
                    </tr>
                    <tr>
                        <td><strong>Home Page</strong></td>
                        <td><code>HomePage.js</code></td>
                        <td><code>/</code></td>
                        <td>Main landing page, displays featured listings, search bar, banners.</td>
                    </tr>
                    <tr>
                        <td><strong>Listings Search</strong></td>
                        <td><code>ListingsPage.js</code></td>
                        <td><code>/listings</code></td>
                        <td>Searchable and filterable list of all public listings. Map view integration.</td>
                    </tr>
                    <tr>
                        <td><strong>Listing Detail</strong></td>
                        <td><code>ListingDetailPage.js</code></td>
                        <td><code>/listings/:id</code></td>
                        <td>Detailed view of a single listing, including images, description, agent info, and booking form.</td>
                    </tr>
                    <tr>
                        <td><strong>Login Page</strong></td>
                        <td><code>LoginPage.js</code></td>
                        <td><code>/login</code></td>
                        <td>User authentication page.</td>
                    </tr>
                    <tr>
                        <td><strong>Register Page</strong></td>
                        <td><code>RegisterPage.js</code></td>
                        <td><code>/register</code></td>
                        <td>New user registration page.</td>
                    </tr>
                    <tr>
                        <td colSpan="4"><h4>Agent Dashboard Routes</h4></td>
                    </tr>
                    <tr>
                        <td><strong>Dashboard</strong></td>
                        <td><code>AgentDashboard.js</code></td>
                        <td><code>/dashboard</code></td>
                        <td>Agent-specific stats: total listings, published count, view count, appointments.</td>
                    </tr>
                    <tr>
                        <td><strong>Listings</strong></td>
                        <td><code>AgentListings.js</code></td>
                        <td><code>/dashboard/listings</code></td>
                        <td>Table of all listings with search, date filter, status filter. Publish/unpublish toggle. Actions (edit, delete, view).</td>
                    </tr>
                    <tr>
                        <td><strong>Create Listing</strong></td>
                        <td><code>CreateListing.js</code></td>
                        <td><code>/dashboard/listings/new</code></td>
                        <td>Multi-section form: basic info, location (map + address), features, media upload, transit station selection.</td>
                    </tr>
                    <tr>
                        <td><strong>Edit Listing</strong></td>
                        <td><code>EditListing.js</code></td>
                        <td><code>/dashboard/listings/:id/edit</code></td>
                        <td>Same form as create, pre-populated with existing data. Supports media reordering and deletion.</td>
                    </tr>
                    <tr>
                        <td><strong>Appointments</strong></td>
                        <td><code>AppointmentManagement.js</code></td>
                        <td><code>/dashboard/appointments</code></td>
                        <td>Manage incoming bookings. Status update (pending → confirmed → completed/cancelled). Date filters, notes.</td>
                    </tr>
                    <tr>
                        <td><strong>Sub-Agents</strong></td>
                        <td><code>SubAgents.js</code></td>
                        <td><code>/dashboard/sub-agents</code></td>
                        <td>Manage team members. Create sub-agent accounts, set permissions, activate/deactivate.</td>
                    </tr>
                    <tr>
                        <td><strong>Theme Settings</strong></td>
                        <td><code>ThemeSettings.js</code></td>
                        <td><code>/dashboard/theme</code></td>
                        <td>Customize public site: colors, fonts, logo, header/footer text, custom CSS. Real-time preview.</td>
                    </tr>
                    <tr>
                        <td><strong>Settings</strong></td>
                        <td><code>AgentSettings.js</code></td>
                        <td><code>/dashboard/settings</code></td>
                        <td>Agent profile: name, contact info, price limits, price format.</td>
                    </tr>
                    <tr>
                        <td colSpan="4"><h4>Admin Routes</h4></td>
                    </tr>
                    <tr>
                        <td><strong>Admin Dashboard</strong></td>
                        <td><code>AdminDashboard.js</code></td>
                        <td><code>/admin</code></td>
                        <td>Overview of system health, user activity, and key metrics.</td>
                    </tr>
                    <tr>
                        <td><strong>Agent Management</strong></td>
                        <td><code>AgentManagement.js</code></td>
                        <td><code>/admin/agents</code></td>
                        <td>Manage all agents: create, edit, delete, assign subscriptions.</td>
                    </tr>
                    <tr>
                        <td><strong>Subscription Plans</strong></td>
                        <td><code>SubscriptionPlans.js</code></td>
                        <td><code>/admin/subscriptions</code></td>
                        <td>Configure subscription tiers and features.</td>
                    </tr>
                    <tr>
                        <td><strong>System Settings</strong></td>
                        <td><code>SystemSettings.js</code></td>
                        <td><code>/admin/settings</code></td>
                        <td>Global application settings.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

/* ===== ADD COLUMN ===== */
const AddColumnSection = () => (
    <div>
        <div className="card">
            <div className="card-title">➕ How to Add a Column</div>
            <div className="card-subtitle">Step-by-step guide to add a new field to any model</div>

            <div className="info-box warning">
                <span className="info-box-icon">⚠️</span>
                <div>
                    <strong>Important:</strong> Every column change requires updates in <strong>3-5 files</strong> across
                    backend and frontend. Missing any file will cause data to be silently ignored.
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                    <h4>Add the field to the Model Struct</h4>
                    <p>File: <code>backend/models/models.go</code></p>
                    <CodeBlock language="go">{`// Example: Adding "Parking" field to Listing
type Listing struct {
    // ... existing fields
    Parking  int  \`gorm:"default:0" json:"parking"\`  // ← ADD THIS
}`}</CodeBlock>
                    <div className="info-box success">
                        <span className="info-box-icon">✅</span>
                        <div>GORM AutoMigrate will automatically add the column to the database when the backend restarts. No manual SQL migration needed.</div>
                    </div>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                    <h4>Update the Controller (if needed)</h4>
                    <p>File: <code>backend/controllers/[entity]_controller.go</code></p>
                    <p>
                        If the field needs special handling (validation, filtering, searching), update the relevant
                        controller functions. For simple fields, GORM will auto-bind them from JSON.
                    </p>
                    <CodeBlock language="go">{`// If you need to filter by the new field:
if parking := c.Query("parking"); parking != "" {
    query = query.Where("parking >= ?", parking)
}`}</CodeBlock>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                    <h4>Update the Frontend API (if new endpoint params)</h4>
                    <p>File: <code>frontend/src/services/api.js</code></p>
                    <p>Usually no change needed here since API calls already pass objects. But if you added new query parameters, make sure they're included.</p>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                    <h4>Update the Frontend Pages</h4>
                    <p>File: The relevant page components</p>
                    <p>Add the field to:</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ padding: '4px 0', fontSize: '13px' }}>📝 <strong>Create Form</strong> — <code>CreateListing.js</code> (add input field + form state)</li>
                        <li style={{ padding: '4px 0', fontSize: '13px' }}>✏️ <strong>Edit Form</strong> — <code>EditListing.js</code> (add input field + pre-populate)</li>
                        <li style={{ padding: '4px 0', fontSize: '13px' }}>📋 <strong>Table/List View</strong> — <code>AgentListings.js</code> (add column to table)</li>
                        <li style={{ padding: '4px 0', fontSize: '13px' }}>👁️ <strong>Detail View</strong> — <code>ListingDetailPage.js</code> (display the field)</li>
                        <li style={{ padding: '4px 0', fontSize: '13px' }}>🔍 <strong>Public View</strong> — <code>ListingsPage.js</code> (if shown on cards/filters)</li>
                    </ul>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">5</div>
                <div className="step-content">
                    <h4>Test & Verify</h4>
                    <p>
                        Restart the backend (<code>go run main.go</code>), verify the column exists in the database,
                        then test create/edit/view flows in the frontend.
                    </p>
                </div>
            </div>
        </div>

        {/* Quick Reference Checklist */}
        <div className="card">
            <div className="card-title">✅ Checklist: Adding a Column</div>
            <table className="doc-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>File</th>
                        <th>Action</th>
                        <th>Required?</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td><code>models/models.go</code></td><td>Add struct field with GORM tags</td><td><span className="badge badge-red">Always</span></td></tr>
                    <tr><td>2</td><td><code>controllers/*.go</code></td><td>Add filtering/validation logic</td><td><span className="badge badge-amber">If filterable</span></td></tr>
                    <tr><td>3</td><td><code>services/api.js</code></td><td>Add query params if new filters</td><td><span className="badge badge-amber">If new params</span></td></tr>
                    <tr><td>4</td><td><code>Create[Entity].js</code></td><td>Add form input + state</td><td><span className="badge badge-red">Always</span></td></tr>
                    <tr><td>5</td><td><code>Edit[Entity].js</code></td><td>Add form input + pre-populate</td><td><span className="badge badge-red">Always</span></td></tr>
                    <tr><td>6</td><td><code>[Entity]List.js</code></td><td>Add table column</td><td><span className="badge badge-green">Optional</span></td></tr>
                    <tr><td>7</td><td><code>[Entity]Detail.js</code></td><td>Display the field</td><td><span className="badge badge-green">Optional</span></td></tr>
                </tbody>
            </table>
        </div>
    </div>
);

/* ===== MODIFY COLUMN ===== */
const ModifyColumnSection = () => (
    <div>
        <div className="card">
            <div className="card-title">✏️ How to Modify or Rename a Column</div>
            <div className="card-subtitle">Changing types, renaming fields, or removing columns</div>

            <div className="info-box warning">
                <span className="info-box-icon">⚠️</span>
                <div>
                    <strong>GORM AutoMigrate limitations:</strong> AutoMigrate will <strong>ADD</strong> new columns but
                    will <strong>NOT</strong> rename or delete existing columns. For renames and deletions, you need manual SQL.
                </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '24px', marginBottom: '12px' }}>Renaming a Column</h3>
            <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                    <h4>Run manual SQL migration</h4>
                    <CodeBlock language="sql">{`-- Run in PostgreSQL
ALTER TABLE listings RENAME COLUMN old_name TO new_name;`}</CodeBlock>
                </div>
            </div>
            <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                    <h4>Update the model struct</h4>
                    <p>Change the field name and GORM column tag in <code>models/models.go</code></p>
                </div>
            </div>
            <div className="workflow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                    <h4>Update controllers</h4>
                    <p>Search for the old field name in all <code>controllers/*.go</code> files and replace</p>
                </div>
            </div>
            <div className="workflow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                    <h4>Update frontend</h4>
                    <p>Search for the old JSON field name in all React components and replace with the new name</p>
                </div>
            </div>

            <hr className="section-divider" />

            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Changing a Column Type</h3>
            <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                    <h4>Update the GORM tag</h4>
                    <p>Change the <code>gorm:"type:..."</code> tag in <code>models/models.go</code>. AutoMigrate will handle the type change on restart.</p>
                    <CodeBlock language="go">{`// Before
Price float64 \`gorm:"type:decimal(10,2)"\`
// After
Price float64 \`gorm:"type:decimal(15,2)"\``}</CodeBlock>
                </div>
            </div>

            <hr className="section-divider" />

            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Deleting a Column</h3>
            <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                    <h4>Remove the field from the model</h4>
                    <p>Delete the line from <code>models/models.go</code>. The column will remain in the database but won't be queried.</p>
                </div>
            </div>
            <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                    <h4>(Optional) Drop the column manually</h4>
                    <CodeBlock language="sql">ALTER TABLE listings DROP COLUMN unused_field;</CodeBlock>
                </div>
            </div>
            <div className="workflow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                    <h4>Clean up references</h4>
                    <p>Remove all references in controllers and frontend components.</p>
                </div>
            </div>
        </div>
    </div>
);

/* ===== ADD MODEL ===== */
const AddModelSection = () => (
    <div>
        <div className="card">
            <div className="card-title">🆕 How to Add a New Model</div>
            <div className="card-subtitle">Complete guide to adding a new entity to the system</div>

            <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                    <h4>Define the Model Struct</h4>
                    <p>File: <code>backend/models/models.go</code></p>
                    <CodeBlock language="go">{`type Review struct {
    ID        uuid.UUID      \`gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"\`
    ListingID uuid.UUID      \`gorm:"type:uuid;not null" json:"listing_id"\`
    Listing   *Listing       \`gorm:"foreignKey:ListingID" json:"listing,omitempty"\`
    UserName  string         \`gorm:"size:200;not null" json:"user_name"\`
    Rating    int            \`gorm:"default:5" json:"rating"\`
    Comment   string         \`gorm:"type:text" json:"comment"\`
    CreatedAt time.Time      \`json:"created_at"\`
    DeletedAt gorm.DeletedAt \`gorm:"index" json:"-"\`
}`}</CodeBlock>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                    <h4>Register in AutoMigrate</h4>
                    <p>File: <code>backend/main.go</code></p>
                    <CodeBlock language="go">{`db.AutoMigrate(
    // ... existing models
    &models.Review{}, // ← ADD THIS
)`}</CodeBlock>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                    <h4>Create a Controller</h4>
                    <p>File: <code>backend/controllers/review_controller.go</code> — Create CRUD handlers</p>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                    <h4>Add Routes</h4>
                    <p>File: <code>backend/routes/routes.go</code> — Register the controller and endpoints</p>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">5</div>
                <div className="step-content">
                    <h4>Add Frontend API</h4>
                    <p>File: <code>frontend/src/services/api.js</code> — Add new API object</p>
                    <CodeBlock language="javascript">{`export const reviewApi = {
    getReviews: (listingId) => api.get(\`/public/listings/\${listingId}/reviews\`),
    createReview: (data) => api.post('/public/reviews', data),
};`}</CodeBlock>
                </div>
            </div>

            <div className="workflow-step">
                <div className="step-number">6</div>
                <div className="step-content">
                    <h4>Create Frontend Pages</h4>
                    <p>Create the React component(s) and add routes in <code>App.js</code></p>
                </div>
            </div>
        </div>

        <div className="card">
            <div className="card-title">📂 Files to Create / Modify</div>
            <table className="doc-table">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Action</th>
                        <th>Purpose</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td><code>models/models.go</code></td><td><span className="badge badge-amber">Modify</span></td><td>Add struct definition</td></tr>
                    <tr><td><code>main.go</code></td><td><span className="badge badge-amber">Modify</span></td><td>Add to AutoMigrate list</td></tr>
                    <tr><td><code>controllers/review_controller.go</code></td><td><span className="badge badge-green">Create</span></td><td>CRUD handler functions</td></tr>
                    <tr><td><code>routes/routes.go</code></td><td><span className="badge badge-amber">Modify</span></td><td>Register new routes</td></tr>
                    <tr><td><code>frontend/src/services/api.js</code></td><td><span className="badge badge-amber">Modify</span></td><td>Add API service object</td></tr>
                    <tr><td><code>frontend/src/pages/[Page].js</code></td><td><span className="badge badge-green">Create</span></td><td>UI components</td></tr>
                    <tr><td><code>frontend/src/App.js</code></td><td><span className="badge badge-amber">Modify</span></td><td>Add route to main router</td></tr>
                </tbody>
            </table>
        </div>
    </div>
);

/* ===== API ROUTES ===== */
const ApiRoutesSection = () => (
    <div id="api-routes">
        <div className="card">
            <div className="card-title">🔗 Complete API Route Reference</div>
            <div className="card-subtitle">All endpoints organized by access level</div>
        </div>

        <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>🌐 Public Routes (No Auth)</h3>
            <table className="doc-table">
                <thead><tr><th>Method</th><th>Endpoint</th><th>Controller</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/auth/register</code></td><td>AuthController</td><td>Register new user</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/auth/login</code></td><td>AuthController</td><td>Login & get JWT</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/auth/refresh</code></td><td>AuthController</td><td>Refresh access token</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/public/listings</code></td><td>PublicController</td><td>Browse all listings</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/public/listings/:id</code></td><td>PublicController</td><td>View listing detail</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/public/stations</code></td><td>PublicController</td><td>Get transit stations</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/public/listings/by-station/:stationId</code></td><td>PublicController</td><td>Listings near station</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/public/agent/info</code></td><td>PublicController</td><td>Get agent info</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/public/plans</code></td><td>PublicController</td><td>Get public pricing plans</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/public/appointments</code></td><td>AppointmentController</td><td>Book appointment</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/public/banners</code></td><td>BannerController</td><td>Get public banners</td></tr>
                </tbody>
            </table>
        </div>

        <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>🔒 Protected Routes (Auth Required)</h3>
            <table className="doc-table">
                <thead><tr><th>Method</th><th>Endpoint</th><th>Controller</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/me</code></td><td>AuthController</td><td>Get user profile</td></tr>
                    <tr><td><span className="badge badge-amber">PUT</span></td><td><code>/api/me</code></td><td>AuthController</td><td>Update profile</td></tr>
                    <tr><td><span className="badge badge-amber">PUT</span></td><td><code>/api/me/password</code></td><td>AuthController</td><td>Change password</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/appointments/my</code></td><td>AppointmentController</td><td>My appointments</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/ws</code></td><td>WebSocket</td><td>Real-time connection</td></tr>
                </tbody>
            </table>
        </div>

        <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>🏢 Agent Routes (Agent + Sub-Agent)</h3>
            <table className="doc-table">
                <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/agent/dashboard</code></td><td>Dashboard stats</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/agent/listings</code></td><td>List agent's listings</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/agent/listings</code></td><td>Create listing</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/agent/listings/:id</code></td><td>Get listing detail</td></tr>
                    <tr><td><span className="badge badge-amber">PUT</span></td><td><code>/api/agent/listings/:id</code></td><td>Update listing</td></tr>
                    <tr><td><span className="badge badge-red">DEL</span></td><td><code>/api/agent/listings/:id</code></td><td>Delete listing</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/agent/listings/:id/publish</code></td><td>Publish listing</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/agent/listings/:id/unpublish</code></td><td>Unpublish listing</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/agent/sub-agents</code></td><td>List sub-agents (Agent only)</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/agent/sub-agents</code></td><td>Create sub-agent</td></tr>
                    <tr><td><span className="badge badge-amber">PUT</span></td><td><code>/api/agent/sub-agents/:id</code></td><td>Update sub-agent</td></tr>
                    <tr><td><span className="badge badge-red">DEL</span></td><td><code>/api/agent/sub-agents/:id</code></td><td>Delete sub-agent</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/agent/theme</code></td><td>Get theme settings</td></tr>
                    <tr><td><span className="badge badge-amber">PUT</span></td><td><code>/api/agent/theme</code></td><td>Update theme (Agent only)</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/agent/settings</code></td><td>Get agent settings</td></tr>
                    <tr><td><span className="badge badge-amber">PUT</span></td><td><code>/api/agent/settings</code></td><td>Update settings (Agent only)</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/agent/appointments</code></td><td>List appointments</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/agent/appointments/:id</code></td><td>Appointment detail</td></tr>
                    <tr><td><span className="badge badge-amber">PUT</span></td><td><code>/api/agent/appointments/:id</code></td><td>Update status</td></tr>
                    <tr><td><span className="badge badge-red">DEL</span></td><td><code>/api/agent/appointments/:id</code></td><td>Delete appointment</td></tr>
                </tbody>
            </table>
        </div>

        <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>👑 Super Admin Routes</h3>
            <table className="doc-table">
                <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/admin/stats</code></td><td>Platform dashboard stats</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/admin/agents</code></td><td>List all agents</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/admin/agents</code></td><td>Create agent</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/admin/agents/:id</code></td><td>Get agent detail</td></tr>
                    <tr><td><span className="badge badge-amber">PUT</span></td><td><code>/api/admin/agents/:id</code></td><td>Update agent</td></tr>
                    <tr><td><span className="badge badge-red">DEL</span></td><td><code>/api/admin/agents/:id</code></td><td>Delete agent</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/admin/agents/:id/suspend</code></td><td>Suspend agent</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/admin/agents/:id/activate</code></td><td>Activate agent</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/admin/plans</code></td><td>List subscription plans</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/admin/plans</code></td><td>Create plan</td></tr>
                    <tr><td><span className="badge badge-amber">PUT</span></td><td><code>/api/admin/plans/:id</code></td><td>Update plan</td></tr>
                    <tr><td><span className="badge badge-red">DEL</span></td><td><code>/api/admin/plans/:id</code></td><td>Delete plan</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/admin/users</code></td><td>List all users</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/admin/appointments</code></td><td>All appointments</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/admin/appointment-stats</code></td><td>Appointment analytics</td></tr>
                </tbody>
            </table>
        </div>

        <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>📤 Upload & Utility Routes</h3>
            <table className="doc-table">
                <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
                <tbody>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/upload/image</code></td><td>Upload listing image</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/upload/video</code></td><td>Upload listing video</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/upload/logo</code></td><td>Upload agent logo</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/upload/banner</code></td><td>Upload banner image</td></tr>
                    <tr><td><span className="badge badge-red">DEL</span></td><td><code>/api/upload/:id</code></td><td>Delete media file</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/notifications</code></td><td>Get my notifications</td></tr>
                    <tr><td><span className="badge badge-blue">GET</span></td><td><code>/api/notifications/sent</code></td><td>Get sent notifications</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/notifications</code></td><td>Send notification</td></tr>
                    <tr><td><span className="badge badge-green">POST</span></td><td><code>/api/notifications/:id/read</code></td><td>Mark as read</td></tr>
                </tbody>
            </table>
        </div>
    </div>
);

export default WorkflowGuide;
