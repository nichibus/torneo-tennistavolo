import React from 'react';
import { Users, Trophy, FileText, Info } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-gray-800 text-white">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Ping Pong Tournament Manager</h1>
      </div>
      <nav className="p-2">
        <ul>
          <li>
            <button 
              className={`w-full text-left p-2 rounded flex items-center ${activeTab === 'participants' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setActiveTab('participants')}
            >
              <Users size={18} className="mr-2" />
              Iscritti
            </button>
          </li>
          <li>
            <button 
              className={`w-full text-left p-2 rounded flex items-center ${activeTab === 'competitions' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setActiveTab('competitions')}
            >
              <Trophy size={18} className="mr-2" />
              Competizioni
            </button>
          </li>
          <li>
            <button 
              className={`w-full text-left p-2 rounded flex items-center ${activeTab === 'groups' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setActiveTab('groups')}
            >
              <Users size={18} className="mr-2" />
              Gironi
            </button>
          </li>
          <li>
            <button 
              className={`w-full text-left p-2 rounded flex items-center ${activeTab === 'brackets' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setActiveTab('brackets')}
            >
              <Trophy size={18} className="mr-2" />
              Tabelloni
            </button>
          </li>
          <li>
            <button 
              className={`w-full text-left p-2 rounded flex items-center ${activeTab === 'resources' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setActiveTab('resources')}
            >
              <FileText size={18} className="mr-2" />
              Risorse
            </button>
          </li>
          <li>
            <button 
              className={`w-full text-left p-2 rounded flex items-center ${activeTab === 'reports' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              onClick={() => setActiveTab('reports')}
            >
              <FileText size={18} className="mr-2" />
              Reportistica
            </button>
          </li>
        </ul>
      </nav>
      <div className="absolute bottom-0 p-4 w-64 border-t border-gray-700">
        <div className="flex items-center text-sm">
          <Info size={16} className="mr-2" />
          Tornei di Tennistavolo v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;