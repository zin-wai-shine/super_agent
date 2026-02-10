import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    // Track which parent menus are expanded
    const [expanded, setExpanded] = useState({
        database: true,
        workflow: false,
        guide: false,
        deploy: false,
    });

    const toggleExpand = (key) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Auto-expand the active parent on page change
    React.useEffect(() => {
        if (location.pathname.startsWith('/database')) {
            setExpanded(prev => ({ ...prev, database: true }));
        } else if (location.pathname.startsWith('/workflow')) {
            setExpanded(prev => ({ ...prev, workflow: true }));
        } else if (location.pathname.startsWith('/guide')) {
            setExpanded(prev => ({ ...prev, guide: true }));
        } else if (location.pathname.startsWith('/deploy')) {
            setExpanded(prev => ({ ...prev, deploy: true }));
        }
    }, [location.pathname]);

    const isParentActive = (prefix) => location.pathname.startsWith(prefix);

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">S</div>
                    <div className="sidebar-logo-text">
                        <h2>Super Real Estate</h2>
                        <span>Technical Documentation</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Documentation</div>

                {/* Database Schema */}
                <div className="sidebar-menu-group">
                    <div className="sidebar-parent" onClick={() => toggleExpand('database')}>
                        <div className={`sidebar-link parent-link ${isParentActive('/database') ? 'active' : ''}`}>
                            <span className="sidebar-link-icon">🗄️</span>
                            Database Schema
                        </div>
                        <span className={`expand-arrow ${expanded.database ? 'open' : ''}`}>›</span>
                    </div>
                    {expanded.database && (
                        <div className="sidebar-children">
                            <NavLink to="/database/er-diagram" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                📊 ER Diagram
                            </NavLink>
                            <NavLink to="/database/models" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                📋 Model Details
                            </NavLink>
                            <NavLink to="/database/relationships" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                🔗 Relationships
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Workflow & Modification */}
                <div className="sidebar-menu-group">
                    <div className="sidebar-parent" onClick={() => toggleExpand('workflow')}>
                        <div className={`sidebar-link parent-link ${isParentActive('/workflow') ? 'active' : ''}`}>
                            <span className="sidebar-link-icon">⚙️</span>
                            Workflow & Modification
                        </div>
                        <span className={`expand-arrow ${expanded.workflow ? 'open' : ''}`}>›</span>
                    </div>
                    {expanded.workflow && (
                        <div className="sidebar-children">
                            <NavLink to="/workflow/dataflow" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                📊 Data Flow
                            </NavLink>
                            <NavLink to="/workflow/add-column" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                ➕ Add Column
                            </NavLink>
                            <NavLink to="/workflow/modify-column" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                ✏️ Modify Column
                            </NavLink>
                            <NavLink to="/workflow/add-model" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                🏗️ Add Model
                            </NavLink>
                            <NavLink to="/workflow/api-routes" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                🔗 API Routes
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* User Guide & Structure */}
                <div className="sidebar-menu-group">
                    <div className="sidebar-parent" onClick={() => toggleExpand('guide')}>
                        <div className={`sidebar-link parent-link ${isParentActive('/guide') ? 'active' : ''}`}>
                            <span className="sidebar-link-icon">📖</span>
                            User Guide & Structure
                        </div>
                        <span className={`expand-arrow ${expanded.guide ? 'open' : ''}`}>›</span>
                    </div>
                    {expanded.guide && (
                        <div className="sidebar-children">
                            <NavLink to="/guide/structure" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                📂 Project Structure
                            </NavLink>
                            <NavLink to="/guide/stack" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                🛠️ Tech Stack
                            </NavLink>
                            <NavLink to="/guide/roles" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                🔐 Roles & Guide
                            </NavLink>
                            <NavLink to="/guide/features" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                📊 Feature Matrix
                            </NavLink>
                            <NavLink to="/guide/pages" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                📄 All Pages
                            </NavLink>

                            <NavLink to="/guide/map-config" className={({ isActive }) => `sidebar-child-link ${isActive ? 'active' : ''}`}>
                                🗺️ Map Config
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Deployment - Top Level */}
                <div className="sidebar-menu-group">
                    <NavLink to="/deploy" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <span className="sidebar-link-icon">🚀</span>
                        Deployment
                    </NavLink>
                </div>
            </nav>

            <div className="sidebar-footer">
                <span>v1.0.0 — Built with React</span>
            </div>
        </aside >
    );
};

export default Sidebar;
