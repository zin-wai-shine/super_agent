import React from 'react';
import { useParams } from 'react-router-dom';
import MapConfiguration from '../components/Guide/MapConfiguration';

const UserGuide = () => {
    const { section } = useParams();

    const titles = {
        'structure': '📂 Project Structure',
        'stack': '🛠️ Technology Stack',
        'roles': '🔐 Roles & Guide',
        'features': '📊 Feature Matrix',
        'pages': '📄 All Pages',
        'map-config': '🗺️ Map Configuration',
    };

    return (
        <div>
            <div className="page-header">
                <h1>📖 Project Structure & User Guide</h1>
                <p>{titles[section] || 'User guide documentation'}</p>
            </div>

            {section === 'structure' && <ProjectStructure />}
            {section === 'stack' && <TechStack />}
            {section === 'roles' && <RolesGuide />}
            {section === 'features' && <FeatureMatrix />}
            {section === 'pages' && <AllPages />}
            {section === 'map-config' && <MapConfiguration />}
        </div>
    );
};

/* ===== PROJECT STRUCTURE ===== */
const ProjectStructure = () => (
    <div>
        <div className="card">
            <div className="card-title">📂 Backend Structure</div>
            <div className="card-subtitle">Go (Gin + GORM) — REST API with JWT auth</div>
            <div className="file-tree">
                <div><span className="dir">backend/</span></div>
                <div>&nbsp;&nbsp;├── <span className="file">main.go</span> <span className="comment">— Entry point, DB init, AutoMigrate, server start</span></div>
                <div>&nbsp;&nbsp;├── <span className="file">Dockerfile</span></div>
                <div>&nbsp;&nbsp;├── <span className="file">go.mod</span> / <span className="file">go.sum</span></div>
                <div>&nbsp;&nbsp;├── <span className="file">seed_bkk_prime.sql</span> <span className="comment">— Sample data for Bangkok stations</span></div>
                <div>&nbsp;&nbsp;├── <span className="dir">config/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="file">config.go</span> <span className="comment">— Environment config (DB, JWT, uploads)</span></div>
                <div>&nbsp;&nbsp;├── <span className="dir">models/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="file">models.go</span> <span className="comment">— All 10 model structs + constants</span></div>
                <div>&nbsp;&nbsp;├── <span className="dir">controllers/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">auth_controller.go</span> <span className="comment">— Login, Register, JWT</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">super_admin_controller.go</span> <span className="comment">— Agent & Plan CRUD</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">agent_controller.go</span> <span className="comment">— Listings, Theme, Settings</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">public_controller.go</span> <span className="comment">— Public listing browse</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">appointment_controller.go</span> <span className="comment">— Booking management</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">notification_controller.go</span> <span className="comment">— In-app messaging</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">banner_controller.go</span> <span className="comment">— Banner CRUD</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="file">upload_controller.go</span> <span className="comment">— File uploads</span></div>
                <div>&nbsp;&nbsp;├── <span className="dir">routes/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="file">routes.go</span> <span className="comment">— All route definitions</span></div>
                <div>&nbsp;&nbsp;├── <span className="dir">middleware/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="file">middleware.go</span> <span className="comment">— Auth, Role, Tenant middleware</span></div>
                <div>&nbsp;&nbsp;├── <span className="dir">utils/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">jwt.go</span> <span className="comment">— JWT token utilities</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">websocket.go</span> <span className="comment">— WebSocket manager</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="file">storage.go</span> <span className="comment">— File storage helpers</span></div>
                <div>&nbsp;&nbsp;└── <span className="dir">migrations/</span> <span className="comment">— Manual SQL migrations (if needed)</span></div>
            </div>
        </div>

        <div className="card">
            <div className="card-title">📂 Frontend Structure</div>
            <div className="card-subtitle">React 18 — SPA with role-based routing</div>
            <div className="file-tree">
                <div><span className="dir">frontend/</span></div>
                <div>&nbsp;&nbsp;├── <span className="dir">public/</span></div>
                <div>&nbsp;&nbsp;├── <span className="dir">src/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">App.js</span> <span className="comment">— Main router with role guards</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">index.js</span> <span className="comment">— Entry point</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="file">index.css</span> <span className="comment">— Global styles</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="dir">services/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="file">api.js</span> <span className="comment">— Axios instance + all API objects</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="dir">contexts/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="file">AuthContext.js</span> <span className="comment">— Auth state, login/logout</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="dir">components/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="dir">Common/</span> <span className="comment">— StyledSelect, Modal, Sidebar, etc.</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="dir">Form/</span> <span className="comment">— Reusable form components</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="dir">Layout/</span> <span className="comment">— AdminLayout, AgentLayout, PublicLayout</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;├── <span className="dir">Listings/</span> <span className="comment">— ListingCard, ListingSkeleton, etc.</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="dir">TransitMap/</span> <span className="comment">— SVG transit map + filter</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;└── <span className="dir">pages/</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── <span className="dir">Auth/</span> <span className="comment">— LoginPage, RegisterPage</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── <span className="dir">Admin/</span> <span className="comment">— 5 pages (Dashboard, Agents, Plans, Banners, Notifs)</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── <span className="dir">Agent/</span> <span className="comment">— 8 pages (Dashboard, Listings, Create, Edit, ...)</span></div>
                <div>&nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── <span className="dir">Public/</span> <span className="comment">— 8 pages (Home, Listings, Detail, Booking, ...)</span></div>
                <div>&nbsp;&nbsp;├── <span className="file">Dockerfile</span></div>
                <div>&nbsp;&nbsp;└── <span className="file">package.json</span></div>
            </div>
        </div>
    </div>
);

/* ===== TECH STACK ===== */
const TechStack = () => (
    <div>
        <div className="card">
            <div className="card-title">🛠️ Technology Stack</div>
            <div className="card-subtitle">Complete list of technologies used across the platform</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--accent)' }}>Backend</h3>
                    <table className="doc-table">
                        <tbody>
                            <tr><td><strong>Language</strong></td><td>Go (Golang)</td></tr>
                            <tr><td><strong>HTTP Framework</strong></td><td>Gin</td></tr>
                            <tr><td><strong>ORM</strong></td><td>GORM</td></tr>
                            <tr><td><strong>Database</strong></td><td>PostgreSQL</td></tr>
                            <tr><td><strong>Auth</strong></td><td>JWT (JSON Web Tokens)</td></tr>
                            <tr><td><strong>WebSocket</strong></td><td>gorilla/websocket</td></tr>
                            <tr><td><strong>UUID</strong></td><td>google/uuid</td></tr>
                            <tr><td><strong>Containerization</strong></td><td>Docker</td></tr>
                        </tbody>
                    </table>
                </div>
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--purple)' }}>Frontend</h3>
                    <table className="doc-table">
                        <tbody>
                            <tr><td><strong>Framework</strong></td><td>React 18</td></tr>
                            <tr><td><strong>Routing</strong></td><td>React Router v6</td></tr>
                            <tr><td><strong>Styling</strong></td><td>Tailwind CSS + Custom CSS</td></tr>
                            <tr><td><strong>HTTP Client</strong></td><td>Axios</td></tr>
                            <tr><td><strong>Icons</strong></td><td>Heroicons (React)</td></tr>
                            <tr><td><strong>Date Picker</strong></td><td>react-date-range + date-fns</td></tr>
                            <tr><td><strong>Select</strong></td><td>react-select</td></tr>
                            <tr><td><strong>Maps</strong></td><td>Leaflet + react-leaflet</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="card">
            <div className="card-title">🏗️ Architecture Pattern</div>
            <div className="card-subtitle">Multi-tenant SaaS with subdomain routing</div>
            <div className="info-box info">
                <span className="info-box-icon">📐</span>
                <div>
                    The platform uses a <strong>multi-tenant architecture</strong> where each agent (tenant) gets their own subdomain
                    (e.g. <code>agent-name.super.app</code>) or custom domain. The <strong>TenantMiddleware</strong> resolves the
                    agent from the request host header and injects it into the context for all downstream handlers.
                </div>
            </div>

            <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Key Architectural Decisions:</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--accent)' }}>▸</span>
                        <strong>Shared Database</strong> — All tenants share one PostgreSQL database; data is isolated via <code>agent_id</code> foreign keys
                    </li>
                    <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--accent)' }}>▸</span>
                        <strong>GORM AutoMigrate</strong> — Schema changes are applied automatically; no separate migration tool needed
                    </li>
                    <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--accent)' }}>▸</span>
                        <strong>Soft Deletes</strong> — Most models use <code>gorm.DeletedAt</code> for recoverable deletion
                    </li>
                    <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--accent)' }}>▸</span>
                        <strong>JWT with Refresh</strong> — Short-lived access tokens + refresh tokens for security
                    </li>
                    <li style={{ padding: '6px 0', fontSize: '13px', display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--accent)' }}>▸</span>
                        <strong>Role-Based Access</strong> — Middleware enforces permissions per route group
                    </li>
                </ul>
            </div>
        </div>
    </div>
);

/* ===== ROLES GUIDE ===== */
const RolesGuide = () => (
    <div>
        <div className="role-grid">
            <div className="role-card">
                <div className="role-card-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>👑</div>
                <h3>Super Admin</h3>
                <p>Platform owner with full system access</p>
                <ul>
                    <li>View platform-wide dashboard with stats</li>
                    <li>Create, edit, suspend, and delete agents</li>
                    <li>Manage subscription plans and pricing</li>
                    <li>View all appointments across all agents</li>
                    <li>Manage banners and notifications</li>
                    <li>View all registered users</li>
                </ul>
            </div>

            <div className="role-card">
                <div className="role-card-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>🏢</div>
                <h3>Agent</h3>
                <p>Real estate agency owner managing their listings</p>
                <ul>
                    <li>View agent-specific dashboard with stats</li>
                    <li>Create, edit, publish, delete property listings</li>
                    <li>Upload photos and videos for listings</li>
                    <li>Manage sub-agent team members</li>
                    <li>Customize site theme and branding</li>
                    <li>Manage incoming appointments</li>
                    <li>Configure agent settings (price limits, etc.)</li>
                    <li>Create and manage banners</li>
                </ul>
            </div>

            <div className="role-card">
                <div className="role-card-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>👤</div>
                <h3>Sub-Agent</h3>
                <p>Team member under an agent with limited access</p>
                <ul>
                    <li>Create and edit listings (own listings only)</li>
                    <li>Upload media for their listings</li>
                    <li>View agent dashboard stats</li>
                    <li>View and manage assigned appointments</li>
                    <li>Cannot manage sub-agents or theme</li>
                    <li>Cannot modify agent settings</li>
                </ul>
            </div>

            <div className="role-card">
                <div className="role-card-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>🌐</div>
                <h3>Public User</h3>
                <p>Visitors browsing agent websites</p>
                <ul>
                    <li>Browse property listings with filters</li>
                    <li>View listing details with photos and maps</li>
                    <li>Book property viewing appointments</li>
                    <li>View their booking history</li>
                    <li>Filter by transit stations (BTS/MRT)</li>
                    <li>Register account and manage profile</li>
                </ul>
            </div>
        </div>

        <div className="card">
            <div className="card-title">🔐 Access Control Flow</div>
            <div className="card-subtitle">How the system determines what a user can and cannot do</div>

            <div className="workflow-step">
                <div className="step-number">1</div>
                <div className="step-content">
                    <h4>User logs in via <code>/api/auth/login</code></h4>
                    <p>Backend verifies credentials, returns JWT with user ID and role embedded in claims</p>
                </div>
            </div>
            <div className="workflow-step">
                <div className="step-number">2</div>
                <div className="step-content">
                    <h4>Frontend stores token and redirects by role</h4>
                    <p><code>super_admin</code> → <code>/admin/dashboard</code> | <code>agent/sub_agent</code> → <code>/agent/dashboard</code> | <code>public</code> → <code>/</code></p>
                </div>
            </div>
            <div className="workflow-step">
                <div className="step-number">3</div>
                <div className="step-content">
                    <h4>Every API request includes JWT in Authorization header</h4>
                    <p><code>AuthMiddleware</code> validates token → <code>RoleMiddleware</code> checks role → Controller executes</p>
                </div>
            </div>
            <div className="workflow-step">
                <div className="step-number">4</div>
                <div className="step-content">
                    <h4>TenantMiddleware resolves agent scope</h4>
                    <p>For agent/sub-agent requests, the middleware ensures they can only access their own agent's data</p>
                </div>
            </div>
        </div>
    </div>
);

/* ===== FEATURE MATRIX ===== */
const FeatureMatrix = () => (
    <div>
        <div className="card">
            <div className="card-title">📊 Feature Access Matrix</div>
            <div className="card-subtitle">Which features are available to each role</div>
            <div className="feature-matrix">
                <table>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left' }}>Feature</th>
                            <th>👑 Super Admin</th>
                            <th>🏢 Agent</th>
                            <th>👤 Sub-Agent</th>
                            <th>🌐 Public</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Platform Dashboard</td><td className="check">✓</td><td className="cross">—</td><td className="cross">—</td><td className="cross">—</td></tr>
                        <tr><td>Agent Dashboard</td><td className="cross">—</td><td className="check">✓</td><td className="check">✓</td><td className="cross">—</td></tr>
                        <tr><td>Create Agent</td><td className="check">✓</td><td className="cross">—</td><td className="cross">—</td><td className="cross">—</td></tr>
                        <tr><td>Suspend/Activate Agent</td><td className="check">✓</td><td className="cross">—</td><td className="cross">—</td><td className="cross">—</td></tr>
                        <tr><td>Manage Subscription Plans</td><td className="check">✓</td><td className="cross">—</td><td className="cross">—</td><td className="cross">—</td></tr>
                        <tr><td>View All Users</td><td className="check">✓</td><td className="cross">—</td><td className="cross">—</td><td className="cross">—</td></tr>
                        <tr><td>Create/Edit Listings</td><td className="cross">—</td><td className="check">✓</td><td className="check">✓</td><td className="cross">—</td></tr>
                        <tr><td>Publish/Unpublish Listings</td><td className="cross">—</td><td className="check">✓</td><td className="check">✓</td><td className="cross">—</td></tr>
                        <tr><td>Upload Media</td><td className="cross">—</td><td className="check">✓</td><td className="check">✓</td><td className="cross">—</td></tr>
                        <tr><td>Manage Sub-Agents</td><td className="cross">—</td><td className="check">✓</td><td className="cross">—</td><td className="cross">—</td></tr>
                        <tr><td>Customize Theme</td><td className="cross">—</td><td className="check">✓</td><td className="cross">—</td><td className="cross">—</td></tr>
                        <tr><td>Agent Settings</td><td className="cross">—</td><td className="check">✓</td><td className="cross">—</td><td className="cross">—</td></tr>
                        <tr><td>Manage Appointments</td><td className="check">✓ (all)</td><td className="check">✓ (own)</td><td className="check">✓ (own)</td><td className="cross">—</td></tr>
                        <tr><td>Create Banners</td><td className="check">✓</td><td className="check">✓</td><td className="cross">—</td><td className="cross">—</td></tr>
                        <tr><td>Send Notifications</td><td className="check">✓</td><td className="check">✓</td><td className="cross">—</td><td className="cross">—</td></tr>
                        <tr><td>Browse Listings</td><td className="cross">—</td><td className="cross">—</td><td className="cross">—</td><td className="check">✓</td></tr>
                        <tr><td>Book Appointments</td><td className="cross">—</td><td className="cross">—</td><td className="cross">—</td><td className="check">✓</td></tr>
                        <tr><td>View Booking History</td><td className="cross">—</td><td className="cross">—</td><td className="cross">—</td><td className="check">✓</td></tr>
                        <tr><td>Transit Map Filter</td><td className="cross">—</td><td className="cross">—</td><td className="cross">—</td><td className="check">✓</td></tr>
                        <tr><td>User Profile</td><td className="check">✓</td><td className="check">✓</td><td className="check">✓</td><td className="check">✓</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

/* ===== ALL PAGES ===== */
const AllPages = () => (
    <div>
        <div className="card">
            <div className="card-title">🔐 Auth Pages</div>
            <table className="doc-table">
                <thead>
                    <tr><th>Page</th><th>File</th><th>Route</th><th>Description</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>Login</strong></td><td><code>LoginPage.js</code></td><td><code>/login</code></td><td>Email/password login form with role-based redirect</td></tr>
                    <tr><td><strong>Register</strong></td><td><code>RegisterPage.js</code></td><td><code>/register</code></td><td>New user registration with email, name, and password</td></tr>
                </tbody>
            </table>
        </div>

        <div className="card">
            <div className="card-title">👑 Admin Pages (Super Admin Only)</div>
            <table className="doc-table">
                <thead>
                    <tr><th>Page</th><th>File</th><th>Route</th><th>Description</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Dashboard</strong></td>
                        <td><code>AdminDashboard.js</code></td>
                        <td><code>/admin/dashboard</code></td>
                        <td>Platform-wide stats: total agents, listings, users, appointments. Summary cards and charts.</td>
                    </tr>
                    <tr>
                        <td><strong>Agent Management</strong></td>
                        <td><code>AgentManagement.js</code></td>
                        <td><code>/admin/agents</code></td>
                        <td>Full CRUD for agents. Table with search, filters, pagination. Create/edit modal with domain type selection. Suspend/activate toggle.</td>
                    </tr>
                    <tr>
                        <td><strong>Subscription Plans</strong></td>
                        <td><code>SubscriptionPlans.js</code></td>
                        <td><code>/admin/plans</code></td>
                        <td>Manage subscription tiers. Set pricing, max listings, max sub-agents, domain type, and feature flags.</td>
                    </tr>
                    <tr>
                        <td><strong>Banner Management</strong></td>
                        <td><code>BannerManagement.js</code></td>
                        <td><code>/admin/banners</code></td>
                        <td>Create and manage promotional banners displayed on agent sites. Upload images, set schedule, target roles.</td>
                    </tr>
                    <tr>
                        <td><strong>Notifications</strong></td>
                        <td><code>NotificationCenter.js</code></td>
                        <td><code>/admin/notifications</code></td>
                        <td>Send in-app notifications to agents or broadcast to roles. View sent notifications history.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div className="card">
            <div className="card-title">🏢 Agent Pages</div>
            <table className="doc-table">
                <thead>
                    <tr><th>Page</th><th>File</th><th>Route</th><th>Description</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Dashboard</strong></td>
                        <td><code>AgentDashboard.js</code></td>
                        <td><code>/agent/dashboard</code></td>
                        <td>Agent-specific stats: total listings, published count, view count, appointments.</td>
                    </tr>
                    <tr>
                        <td><strong>Listings</strong></td>
                        <td><code>AgentListings.js</code></td>
                        <td><code>/agent/listings</code></td>
                        <td>Table of all listings with search, date filter, status filter. Publish/unpublish toggle. Actions (edit, delete, view).</td>
                    </tr>
                    <tr>
                        <td><strong>Create Listing</strong></td>
                        <td><code>CreateListing.js</code></td>
                        <td><code>/agent/listings/new</code></td>
                        <td>Multi-section form: basic info, location (map + address), features, media upload, transit station selection.</td>
                    </tr>
                    <tr>
                        <td><strong>Edit Listing</strong></td>
                        <td><code>EditListing.js</code></td>
                        <td><code>/agent/listings/:id/edit</code></td>
                        <td>Same form as create, pre-populated with existing data. Supports media reordering and deletion.</td>
                    </tr>
                    <tr>
                        <td><strong>Appointments</strong></td>
                        <td><code>AppointmentManagement.js</code></td>
                        <td><code>/agent/appointments</code></td>
                        <td>Manage incoming bookings. Status update (pending → confirmed → completed/cancelled). Date filters, notes.</td>
                    </tr>
                    <tr>
                        <td><strong>Sub-Agents</strong></td>
                        <td><code>SubAgents.js</code></td>
                        <td><code>/agent/sub-agents</code></td>
                        <td>Manage team members. Create sub-agent accounts, set permissions, activate/deactivate.</td>
                    </tr>
                    <tr>
                        <td><strong>Theme Settings</strong></td>
                        <td><code>ThemeSettings.js</code></td>
                        <td><code>/agent/theme</code></td>
                        <td>Customize public site: colors, fonts, logo, header/footer text, custom CSS. Real-time preview.</td>
                    </tr>
                    <tr>
                        <td><strong>Settings</strong></td>
                        <td><code>AgentSettings.js</code></td>
                        <td><code>/agent/settings</code></td>
                        <td>Agent profile: name, contact info, price limits, price format.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div className="card">
            <div className="card-title">🌐 Public Pages</div>
            <table className="doc-table">
                <thead>
                    <tr><th>Page</th><th>File</th><th>Route</th><th>Description</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Home</strong></td>
                        <td><code>HomePage.js</code></td>
                        <td><code>/</code></td>
                        <td>Landing page with agent branding, featured listings, banners, and search.</td>
                    </tr>
                    <tr>
                        <td><strong>Listings</strong></td>
                        <td><code>ListingsPage.js</code></td>
                        <td><code>/listings</code></td>
                        <td>Browse all published listings. Filters: property type, listing type, price range, bedrooms, transit station. Infinite scroll.</td>
                    </tr>
                    <tr>
                        <td><strong>Listing Detail</strong></td>
                        <td><code>ListingDetailPage.js</code></td>
                        <td><code>/listings/:id</code></td>
                        <td>Full property detail: image gallery, description, features, map, nearby transit, contact form, book appointment CTA.</td>
                    </tr>
                    <tr>
                        <td><strong>Book Appointment</strong></td>
                        <td><code>BookAppointment.js</code></td>
                        <td><code>/book/:listingId</code></td>
                        <td>Multi-step booking form: select date/time, enter contact info, choose purpose (rent/buy), confirm.</td>
                    </tr>
                    <tr>
                        <td><strong>My Bookings</strong></td>
                        <td><code>MyBookings.js</code></td>
                        <td><code>/my-bookings</code></td>
                        <td>View booking history with status badges. See appointment details and agent notes.</td>
                    </tr>
                    <tr>
                        <td><strong>Banner Detail</strong></td>
                        <td><code>BannerDetail.js</code></td>
                        <td><code>/banners/:id</code></td>
                        <td>Full banner view with description and link.</td>
                    </tr>
                    <tr>
                        <td><strong>Mobile Search</strong></td>
                        <td><code>MobileSearchPage.js</code></td>
                        <td><code>/search</code></td>
                        <td>Mobile-optimized search page with filters.</td>
                    </tr>
                    <tr>
                        <td><strong>User Profile</strong></td>
                        <td><code>UserProfile.js</code></td>
                        <td><code>/profile</code></td>
                        <td>User profile page. Edit name, view role and agent assignment.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

export default UserGuide;
