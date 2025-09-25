import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Home</h2>
            <p>Welcome to Genius DB Dashboard</p>
          </div>
        );
      case 'Summary':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <p>Summary content goes here</p>
          </div>
        );
      case 'Map View':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Map View</h2>
            <p>Map view content goes here</p>
          </div>
        );
      case 'Table View':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Table View</h2>
            <p>Table view content goes here</p>
          </div>
        );
      case 'Admin Panel':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            <p>Admin panel content goes here</p>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Home</h2>
            <p>Welcome to Genius DB Dashboard</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="mt-32">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;