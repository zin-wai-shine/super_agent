import React from 'react';
import DeploymentGuide from '../components/Guide/DeploymentGuide';

const DeploymentPage = () => {
    return (
        <div>
            <div className="page-header">
                <h1>🚀 Deployment Guide</h1>
                <p>Comprehensive guide to deploying Super Real Estate to production</p>
            </div>
            <DeploymentGuide />
        </div>
    );
};

export default DeploymentPage;
