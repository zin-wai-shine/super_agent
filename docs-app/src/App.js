import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DatabaseSchema from './pages/DatabaseSchema';
import WorkflowGuide from './pages/WorkflowGuide';
import UserGuide from './pages/UserGuide';
import DeploymentPage from './pages/DeploymentPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/database/er-diagram" replace />} />

          {/* Database Schema — each child is its own route */}
          <Route path="/database" element={<Navigate to="/database/er-diagram" replace />} />
          <Route path="/database/:section" element={<DatabaseSchema />} />

          {/* Workflow Guide — each child is its own route */}
          <Route path="/workflow" element={<Navigate to="/workflow/dataflow" replace />} />
          <Route path="/workflow/:section" element={<WorkflowGuide />} />

          {/* User Guide — each child is its own route */}
          <Route path="/guide" element={<Navigate to="/guide/structure" replace />} />
          <Route path="/guide/:section" element={<UserGuide />} />

          {/* Deployment - Top Level */}
          <Route path="/deploy" element={<DeploymentPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
