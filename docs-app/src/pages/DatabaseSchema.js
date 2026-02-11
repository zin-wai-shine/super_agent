import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import mermaid from 'mermaid';
import CodeBlock from '../components/Common/CodeBlock';

// Initialize mermaid with dark theme
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#e8eaed',
        primaryBorderColor: '#2a2d3e',
        lineColor: '#6b7280',
        secondaryColor: '#1c1f2e',
        tertiaryColor: '#161922',
        edgeLabelBackground: '#161922',
        fontSize: '13px',
    },
    er: {
        diagramPadding: 20,
        layoutDirection: 'TB',
        minEntityWidth: 100,
        minEntityHeight: 75,
        entityPadding: 15,
        useMaxWidth: true,
    },
});

const erDiagram = `erDiagram
    USER {
        uuid ID PK
        string Email UK
        string PasswordHash
        string FirstName
        string LastName
        string Role "super_admin | agent | sub_agent | public"
        uuid AgentID FK
        boolean IsActive
        timestamp CreatedAt
        timestamp UpdatedAt
        timestamp DeletedAt
    }

    AGENT {
        uuid ID PK
        string Name
        string Subdomain UK
        string DomainType "subdomain | custom"
        string CustomDomain
        string Domain
        string Logo
        text Description
        string Phone
        string Email
        text Address
        decimal MinPriceLimit
        decimal MaxPriceLimit
        string PriceFormat "full | short"
        boolean IsActive
        boolean IsSuspended
        uuid SubscriptionID FK
        timestamp CreatedAt
        timestamp UpdatedAt
        timestamp DeletedAt
    }

    THEME {
        uuid ID PK
        uuid AgentID FK "UK"
        string BackgroundColor
        string PrimaryColor
        string SecondaryColor
        string TextColor
        string FontFamily
        string LogoURL
        string HeaderText
        string FooterText
        text CustomCSS
        timestamp CreatedAt
        timestamp UpdatedAt
    }

    SUBSCRIPTION {
        uuid ID PK
        string PlanName
        text Description
        string DomainType "subdomain | custom"
        decimal Price
        int Duration "days"
        int MaxListings
        int MaxSubAgents
        boolean AllowCustomDomain
        text Features "JSON"
        boolean IsActive
        timestamp StartDate
        timestamp EndDate
        timestamp CreatedAt
        timestamp UpdatedAt
        timestamp DeletedAt
    }

    LISTING {
        uuid ID PK
        uuid AgentID FK
        uuid CreatedBy FK
        string Title
        text Description
        string PropertyType "condo | house | land"
        string ListingType "sale | rent"
        decimal Price
        string PriceUnit "THB"
        int Bedrooms
        int Bathrooms
        decimal Area "sqm"
        string Floor
        string Road
        text Address
        string District
        string Province
        string PostalCode
        decimal Latitude
        decimal Longitude
        text MapURL
        string StationID FK
        string StationName
        int DistanceToStation "meters"
        string AvailabilityStatus
        int YearBuilt
        text Features "JSON array"
        boolean IsPublished
        boolean IsFeatured
        int ViewCount
        timestamp CreatedAt
        timestamp UpdatedAt
        timestamp DeletedAt
    }

    MEDIA {
        uuid ID PK
        uuid ListingID FK
        string Type "image | video"
        string URL
        string Thumbnail
        string Caption
        int SortOrder
        timestamp CreatedAt
    }

    STATION {
        string ID PK "e.g. BL01 N24"
        string NameEN
        string NameTH
        string LineName
        string LineColor
        string Status "open | future | under-construction"
        decimal Latitude
        decimal Longitude
    }

    NOTIFICATION {
        uuid ID PK
        string Title
        text Message
        uuid SenderID FK
        uuid ReceiverID FK
        string TargetRole "agent | public"
        uuid TargetAgentID FK
        string Type "info | warning | system"
        boolean IsRead
        timestamp CreatedAt
        timestamp UpdatedAt
        timestamp DeletedAt
    }

    BANNER {
        uuid ID PK
        string Title
        text Description
        string ImageURL
        string LinkURL
        uuid OwnerID FK
        string TargetRole "all"
        uuid AgentID FK
        boolean IsActive
        timestamp StartDate
        timestamp EndDate
        timestamp CreatedAt
        timestamp UpdatedAt
        timestamp DeletedAt
    }

    APPOINTMENT {
        uuid ID PK
        uuid ListingID FK
        uuid AgentID FK
        string FullName
        string Email
        string Phone
        date PreferredDate
        string PreferredTime
        string Purpose "rent | buy"
        text Message
        string Status "pending | confirmed | completed | cancelled"
        text AgentNotes
        timestamp CreatedAt
        timestamp UpdatedAt
        timestamp DeletedAt
    }

    USER ||--o| AGENT : "belongs to"
    AGENT ||--o| SUBSCRIPTION : "subscribes"
    AGENT ||--|| THEME : "has one"
    AGENT ||--o{ LISTING : "owns"
    AGENT ||--o{ USER : "has members"
    AGENT ||--o{ BANNER : "creates"
    AGENT ||--o{ APPOINTMENT : "receives"
    LISTING ||--o{ MEDIA : "contains"
    LISTING }o--o| STATION : "near"
    LISTING ||--o{ APPOINTMENT : "for"
    USER ||--o{ NOTIFICATION : "sends"
    USER ||--o{ NOTIFICATION : "receives"
`;

const models = [
    {
        name: 'User', icon: '👤', color: '#3b82f6',
        desc: 'System users with role-based access (Super Admin, Agent, Sub-Agent, Public)',
        columns: [
            ['ID', 'uuid', 'PK, auto-gen'],
            ['Email', 'string', 'Unique, required'],
            ['PasswordHash', 'string', 'Bcrypt hashed'],
            ['FirstName', 'string(100)', ''],
            ['LastName', 'string(100)', ''],
            ['Role', 'string(20)', 'super_admin | agent | sub_agent | public'],
            ['AgentID', 'uuid FK', 'Links to Agent (nullable)'],
            ['IsActive', 'boolean', 'Default: true'],
            ['CreatedAt', 'timestamp', 'Auto-set'],
            ['UpdatedAt', 'timestamp', 'Auto-set'],
            ['DeletedAt', 'timestamp', 'Soft delete'],
        ]
    },
    {
        name: 'Agent', icon: '🏢', color: '#8b5cf6',
        desc: 'Real estate agent/tenant — the core multi-tenant entity',
        columns: [
            ['ID', 'uuid', 'PK, auto-gen'],
            ['Name', 'string(200)', 'Required'],
            ['Subdomain', 'string(100)', 'Unique index'],
            ['DomainType', 'string(20)', 'subdomain | custom'],
            ['CustomDomain', 'string(255)', 'e.g. agent.com'],
            ['Domain', 'string(255)', 'Computed full domain'],
            ['Logo', 'string(500)', 'Logo URL'],
            ['Description', 'text', ''],
            ['Phone', 'string(50)', ''],
            ['Email', 'string(255)', ''],
            ['Address', 'text', ''],
            ['MinPriceLimit', 'decimal(15,2)', 'Default: 0'],
            ['MaxPriceLimit', 'decimal(15,2)', 'Default: 0'],
            ['PriceFormat', 'string(20)', 'full | short'],
            ['IsActive', 'boolean', 'Default: true'],
            ['IsSuspended', 'boolean', 'Default: false'],
            ['SubscriptionID', 'uuid FK', 'Links to Subscription'],
            ['CreatedAt/UpdatedAt/DeletedAt', 'timestamps', 'Auto-managed'],
        ]
    },
    {
        name: 'Listing', icon: '🏠', color: '#10b981',
        desc: 'Property listing with location, pricing, features, and transit info',
        columns: [
            ['ID', 'uuid', 'PK'],
            ['AgentID', 'uuid FK', 'Owner agent'],
            ['CreatedBy', 'uuid FK', 'User who created'],
            ['Title', 'string(255)', 'Required'],
            ['Description', 'text', ''],
            ['PropertyType', 'string(50)', 'condo | house | land | etc.'],
            ['ListingType', 'string(20)', 'sale | rent'],
            ['Price', 'decimal(15,2)', ''],
            ['PriceUnit', 'string(20)', 'Default: THB'],
            ['Bedrooms / Bathrooms', 'int', 'Default: 0'],
            ['Area', 'decimal(10,2)', 'sqm'],
            ['Floor', 'string(50)', 'e.g. G, 12A, PH'],
            ['Road / Address / District / Province', 'string/text', 'Location fields'],
            ['Latitude / Longitude', 'decimal(10,7)', 'Map coords'],
            ['StationID', 'string FK', 'Transit station'],
            ['StationName / DistanceToStation', 'string/int', 'Transit proximity'],
            ['Features', 'text', 'JSON array'],
            ['IsPublished / IsFeatured', 'boolean', ''],
            ['ViewCount', 'int', 'Default: 0'],
        ]
    },
    {
        name: 'Media', icon: '📸', color: '#f59e0b',
        desc: 'Images and videos attached to listings',
        columns: [
            ['ID', 'uuid', 'PK'],
            ['ListingID', 'uuid FK', 'Parent listing'],
            ['Type', 'string(20)', 'image | video'],
            ['URL', 'string(500)', 'File path'],
            ['Thumbnail', 'string(500)', 'For videos'],
            ['Caption', 'string(255)', ''],
            ['SortOrder', 'int', 'Display order'],
            ['CreatedAt', 'timestamp', ''],
        ]
    },
    {
        name: 'Station', icon: '🚇', color: '#06b6d4',
        desc: 'Bangkok transit stations (BTS/MRT) pre-populated from SVG map',
        columns: [
            ['ID', 'string(20)', 'PK, e.g. BL01, N24'],
            ['NameEN', 'string(100)', 'English name'],
            ['NameTH', 'string(100)', 'Thai name'],
            ['LineName', 'string(50)', 'Line name'],
            ['LineColor', 'string(20)', 'CSS color'],
            ['Status', 'string(20)', 'open | future | under-construction'],
            ['Latitude / Longitude', 'decimal(10,7)', 'Coordinates'],
        ]
    },
    {
        name: 'Theme', icon: '🎨', color: '#ec4899',
        desc: 'Visual customization for each agent\'s public site',
        columns: [
            ['ID', 'uuid', 'PK'],
            ['AgentID', 'uuid FK', 'Unique index — one-to-one with Agent'],
            ['BackgroundColor', 'string(20)', 'Default: #f5f5f5'],
            ['PrimaryColor', 'string(20)', 'Default: #1a73e8'],
            ['SecondaryColor', 'string(20)', 'Default: #34a853'],
            ['TextColor', 'string(20)', 'Default: #202124'],
            ['FontFamily', 'string(100)', 'Default: Inter'],
            ['LogoURL', 'string(500)', 'Override logo'],
            ['HeaderText / FooterText', 'string', 'Branding text'],
            ['CustomCSS', 'text', 'Custom styling'],
        ]
    },
    {
        name: 'Subscription', icon: '💳', color: '#a855f7',
        desc: 'Subscription plans that control agent capabilities and limits',
        columns: [
            ['ID', 'uuid', 'PK'],
            ['PlanName', 'string(100)', 'Required'],
            ['Description', 'text', ''],
            ['DomainType', 'string(20)', 'subdomain | custom'],
            ['Price', 'decimal(10,2)', 'Default: 0'],
            ['Duration', 'int', 'Days, Default: 30'],
            ['MaxListings', 'int', 'Default: 10'],
            ['MaxSubAgents', 'int', 'Default: 2'],
            ['AllowCustomDomain', 'boolean', 'Default: false'],
            ['Features', 'text', 'JSON capabilities'],
            ['IsActive', 'boolean', 'Default: true'],
            ['StartDate / EndDate', 'timestamp', 'Nullable'],
        ]
    },
    {
        name: 'Notification', icon: '🔔', color: '#f97316',
        desc: 'In-app notifications with sender, receiver, and broadcast support',
        columns: [
            ['ID', 'uuid', 'PK'],
            ['Title', 'string(255)', 'Required'],
            ['Message', 'text', 'Required'],
            ['SenderID', 'uuid FK', 'User who sent'],
            ['ReceiverID', 'uuid FK', 'Nullable for broadcast'],
            ['TargetRole', 'string(50)', 'agent | public'],
            ['TargetAgentID', 'uuid FK', 'Agent-scoped broadcast'],
            ['Type', 'string(20)', 'info | warning | system'],
            ['IsRead', 'boolean', 'Default: false'],
        ]
    },
    {
        name: 'Banner', icon: '🖼️', color: '#14b8a6',
        desc: 'Promotional banners displayed on agent or platform sites',
        columns: [
            ['ID', 'uuid', 'PK'],
            ['Title', 'string(255)', 'Required'],
            ['Description', 'text', ''],
            ['ImageURL', 'string(500)', 'Required'],
            ['LinkURL', 'string(500)', 'Click target'],
            ['OwnerID', 'uuid FK', 'Creator'],
            ['TargetRole', 'string(50)', 'Default: all'],
            ['AgentID', 'uuid FK', 'Null for platform banners'],
            ['IsActive', 'boolean', 'Default: true'],
            ['StartDate / EndDate', 'timestamp', 'Schedule'],
        ]
    },
    {
        name: 'Appointment', icon: '📅', color: '#ef4444',
        desc: 'Property viewing appointments booked by public visitors',
        columns: [
            ['ID', 'uuid', 'PK'],
            ['ListingID', 'uuid FK', 'Which property'],
            ['AgentID', 'uuid FK', 'Indexed, which agent'],
            ['FullName', 'string(200)', 'Visitor name'],
            ['Email', 'string(255)', 'Contact email'],
            ['Phone', 'string(50)', 'Contact phone'],
            ['PreferredDate', 'date', 'Visit date'],
            ['PreferredTime', 'string(10)', 'e.g. 10:00, 14:30'],
            ['Purpose', 'string(20)', 'rent | buy'],
            ['Message', 'text', 'Optional notes'],
            ['Status', 'string(20)', 'pending | confirmed | completed | cancelled'],
            ['AgentNotes', 'text', 'Agent\'s private notes'],
        ]
    },
];

const ZoomableMermaidChart = ({ chart }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const panStart = useRef({ x: 0, y: 0 });

    const MIN_ZOOM = 0.3;
    const MAX_ZOOM = 3;
    const ZOOM_STEP = 0.15;

    const handleZoomIn = useCallback(() => {
        setZoom(z => Math.min(z + ZOOM_STEP, MAX_ZOOM));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(z => Math.max(z - ZOOM_STEP, MIN_ZOOM));
    }, []);

    const handleReset = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    // Render mermaid
    useEffect(() => {
        const render = async () => {
            if (svgRef.current) {
                svgRef.current.innerHTML = '';
                try {
                    const { svg } = await mermaid.render('er-diagram', chart);
                    svgRef.current.innerHTML = svg;
                } catch (err) {
                    svgRef.current.innerHTML = `<pre style="color: #f87171;">Error rendering diagram: ${err.message}</pre>`;
                }
            }
        };
        render();
    }, [chart]);

    // Cmd+/Cmd- keyboard zoom
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.metaKey || e.ctrlKey) {
                if (e.key === '=' || e.key === '+') {
                    e.preventDefault();
                    handleZoomIn();
                } else if (e.key === '-') {
                    e.preventDefault();
                    handleZoomOut();
                } else if (e.key === '0') {
                    e.preventDefault();
                    handleReset();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleZoomIn, handleZoomOut, handleReset]);

    // Cmd+scroll wheel zoom
    const handleWheel = useCallback((e) => {
        if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                setZoom(z => Math.min(z + ZOOM_STEP, MAX_ZOOM));
            } else {
                setZoom(z => Math.max(z - ZOOM_STEP, MIN_ZOOM));
            }
        }
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (el) {
            el.addEventListener('wheel', handleWheel, { passive: false });
            return () => el.removeEventListener('wheel', handleWheel);
        }
    }, [handleWheel]);

    // Drag to pan
    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        panStart.current = { ...pan };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPan({
            x: panStart.current.x + (e.clientX - dragStart.current.x),
            y: panStart.current.y + (e.clientY - dragStart.current.y),
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const zoomPercent = Math.round(zoom * 100);

    return (
        <div style={{ position: 'relative' }}>
            {/* Zoom Controls */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '12px', padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                fontSize: '12px', color: '#9aa0b2', userSelect: 'none',
            }}>
                <button onClick={handleZoomOut} style={zoomBtnStyle} title="Zoom Out (⌘ -)">−</button>
                <span style={{ minWidth: '44px', textAlign: 'center', fontWeight: 600, color: '#e8eaed' }}>
                    {zoomPercent}%
                </span>
                <button onClick={handleZoomIn} style={zoomBtnStyle} title="Zoom In (⌘ +)">+</button>
                <button onClick={handleReset} style={{ ...zoomBtnStyle, width: 'auto', padding: '0 10px', fontSize: '11px' }} title="Reset (⌘ 0)">Reset</button>
                <span style={{ marginLeft: '8px', opacity: 0.6 }}>
                    ⌘ +/− to zoom · ⌘ scroll · drag to pan
                </span>
            </div>

            {/* Zoomable Diagram */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    overflow: 'hidden',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'rgba(0,0,0,0.2)',
                    minHeight: '400px',
                }}
            >
                <div
                    ref={svgRef}
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'top left',
                        transition: isDragging ? 'none' : 'transform 0.15s ease',
                        padding: '20px',
                    }}
                />
            </div>
        </div>
    );
};

const zoomBtnStyle = {
    width: '28px', height: '28px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)',
    borderRadius: '6px', color: '#e8eaed', fontSize: '16px', fontWeight: 700,
    cursor: 'pointer', transition: 'background 0.15s',
};

const DatabaseSchema = () => {
    const { section } = useParams();

    const titles = {
        'er-diagram': '📊 Entity-Relationship Diagram',
        'models': '📋 Model Details',
        'relationships': '🔗 Relationships',
    };

    return (
        <div>
            <div className="page-header">
                <h1>🗄️ Database Schema</h1>
                <p>{titles[section] || 'Complete database documentation'}</p>
            </div>

            {section === 'er-diagram' && (
                <>
                    <div className="card">
                        <div className="card-title">📊 Entity-Relationship Diagram</div>
                        <div className="card-subtitle">Interactive Mermaid ER diagram showing all models and their relationships</div>
                        <div className="mermaid-container">
                            <ZoomableMermaidChart chart={erDiagram} />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-title">📝 Mermaid Source Code</div>
                        <div className="card-subtitle">Copy this to any Mermaid-compatible tool to render</div>
                        <CodeBlock language="mermaid">{erDiagram}</CodeBlock>
                    </div>
                </>
            )}

            {section === 'models' && (
                <div className="page-section">
                    <h2>📋 Model Details</h2>
                    <p>Detailed column-by-column breakdown of every model in the database.</p>

                    <div className="model-grid">
                        {models.map((model) => (
                            <div className="model-card" key={model.name}>
                                <div className="model-card-header" style={{ borderLeft: `3px solid ${model.color}` }}>
                                    <span style={{ fontSize: '18px' }}>{model.icon}</span>
                                    <h3>{model.name}</h3>
                                    <span className="badge badge-blue" style={{ marginLeft: 'auto', fontSize: '10px' }}>
                                        {model.columns.length} columns
                                    </span>
                                </div>
                                <div style={{ padding: '10px 16px 6px', fontSize: '12px', color: '#9aa0b2', borderBottom: '1px solid var(--border)' }}>
                                    {model.desc}
                                </div>
                                <div className="model-card-body">
                                    <table>
                                        <tbody>
                                            {model.columns.map(([name, type, note], idx) => (
                                                <tr key={idx}>
                                                    <td className="col-name">{name}</td>
                                                    <td className="col-type">{type}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {section === 'relationships' && (
                <div className="card">
                    <div className="card-title">🔗 Relationship Summary</div>
                    <div className="card-subtitle">All foreign key relationships in the system</div>
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th>From</th>
                                <th>To</th>
                                <th>Type</th>
                                <th>FK Column</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>User</td><td>Agent</td><td><span className="badge badge-blue">Many-to-One</span></td><td><code>agent_id</code></td><td>Users belong to an agent</td></tr>
                            <tr><td>Agent</td><td>Subscription</td><td><span className="badge badge-purple">Many-to-One</span></td><td><code>subscription_id</code></td><td>Agent subscribes to a plan</td></tr>
                            <tr><td>Agent</td><td>Theme</td><td><span className="badge badge-green">One-to-One</span></td><td><code>agent_id</code> (on Theme)</td><td>Each agent has one theme</td></tr>
                            <tr><td>Agent</td><td>Listing</td><td><span className="badge badge-amber">One-to-Many</span></td><td><code>agent_id</code> (on Listing)</td><td>Agent owns many listings</td></tr>
                            <tr><td>Listing</td><td>Media</td><td><span className="badge badge-amber">One-to-Many</span></td><td><code>listing_id</code> (on Media)</td><td>Listing has many photos/videos</td></tr>
                            <tr><td>Listing</td><td>Station</td><td><span className="badge badge-cyan">Many-to-One</span></td><td><code>station_id</code></td><td>Listing near a transit station</td></tr>
                            <tr><td>Listing</td><td>Appointment</td><td><span className="badge badge-amber">One-to-Many</span></td><td><code>listing_id</code> (on Appointment)</td><td>Listing has many appointments</td></tr>
                            <tr><td>Agent</td><td>Appointment</td><td><span className="badge badge-amber">One-to-Many</span></td><td><code>agent_id</code> (on Appointment)</td><td>Agent receives appointments</td></tr>
                            <tr><td>User</td><td>Notification</td><td><span className="badge badge-amber">One-to-Many</span></td><td><code>sender_id</code> / <code>receiver_id</code></td><td>User sends/receives notifications</td></tr>
                            <tr><td>Agent</td><td>Banner</td><td><span className="badge badge-amber">One-to-Many</span></td><td><code>agent_id</code> (on Banner)</td><td>Agent-specific banners</td></tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DatabaseSchema;

