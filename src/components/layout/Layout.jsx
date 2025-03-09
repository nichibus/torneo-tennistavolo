import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ParticipantList from '../participants/ParticipantList';
import CompetitionList from '../competitions/CompetitionList';
import GroupView from '../groups/GroupView';
import ResourceManager from '../resources/ResourceManager';

const Layout = () => {
  const [activeTab, setActiveTab] = useState('participants');

  const renderContent = () => {
    switch(activeTab) {
      case 'participants':
        return <ParticipantList />;
      case 'competitions':
        return <CompetitionList />;
      case 'groups':
        return <GroupView />;
      case 'brackets':
        return <div className="p-4">Sezione Tabelloni in fase di sviluppo</div>;
      case 'resources':
        return <ResourceManager />;
      case 'reports':
        return <div className="p-4">Sezione Reportistica in fase di sviluppo</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Layout;