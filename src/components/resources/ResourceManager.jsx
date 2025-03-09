import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import TableManager from './TableManager';
import TimeSlotManager from './TimeSlotManager';
import ScheduleVisualizer from './ScheduleVisualizer';

const ResourceManager = () => {
  const [activeTab, setActiveTab] = useState('tables');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gestione Risorse</h2>
      
      <div className="mb-4">
        <div className="flex border-b">
          <button 
            className={`py-2 px-4 ${activeTab === 'tables' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} 
            onClick={() => setActiveTab('tables')}
          >
            Tavoli
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'timeSlots' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} 
            onClick={() => setActiveTab('timeSlots')}
          >
            Fasce Orarie
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'schedule' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`} 
            onClick={() => setActiveTab('schedule')}
          >
            Pianificazione
          </button>
        </div>
      </div>
      
      {activeTab === 'tables' && <TableManager />}
      {activeTab === 'timeSlots' && <TimeSlotManager />}
      {activeTab === 'schedule' && <ScheduleVisualizer />}
    </div>
  );
};

export default ResourceManager;