import React, { useState } from 'react';
import { Users, Trophy, FileText, Info } from 'lucide-react';

const MinimalTournamentApp = () => {
  const [activeTab, setActiveTab] = useState('participants');
  const [participants, setParticipants] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    firstName: '',
    lastName: '',
    club: '',
    category: 'Seniores Maschile'
  });

  const categories = [
    'Giovanissimi', 'Giovanissime', 
    'Ragazzi', 'Ragazze', 
    'Allievi', 'Allieve', 
    'Juniores Maschile', 'Juniores Femminile', 
    'Seniores Maschile', 'Seniores Femminile'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewParticipant({
      ...newParticipant,
      [name]: value
    });
  };

  const addParticipant = () => {
    if (newParticipant.firstName && newParticipant.lastName) {
      setParticipants([...participants, { ...newParticipant, id: Date.now() }]);
      setNewParticipant({
        firstName: '',
        lastName: '',
        club: '',
        category: 'Seniores Maschile'
      });
      setShowAddForm(false);
    }
  };

  const removeParticipant = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'participants':
        return (
          <div className="p-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Gestione Iscritti</h2>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => setShowAddForm(true)}
              >
                Nuovo Iscritto
              </button>
            </div>
            
            {showAddForm && (
              <div className="bg-gray-100 p-4 rounded mb-4">
                <h3 className="font-bold mb-2">Aggiungi Nuovo Iscritto</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Nome</label>
                    <input 
                      type="text"
                      name="firstName"
                      value={newParticipant.firstName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Cognome</label>
                    <input 
                      type="text"
                      name="lastName"
                      value={newParticipant.lastName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Società</label>
                    <input 
                      type="text"
                      name="club"
                      value={newParticipant.club}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Categoria</label>
                    <select 
                      name="category"
                      value={newParticipant.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button 
                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                    onClick={() => setShowAddForm(false)}
                  >
                    Annulla
                  </button>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={addParticipant}
                  >
                    Salva
                  </button>
                </div>
              </div>
            )}
            
            {participants.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Nome</th>
                      <th className="p-2 border">Cognome</th>
                      <th className="p-2 border">Società</th>
                      <th className="p-2 border">Categoria</th>
                      <th className="p-2 border">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map(participant => (
                      <tr key={participant.id}>
                        <td className="p-2 border">{participant.firstName}</td>
                        <td className="p-2 border">{participant.lastName}</td>
                        <td className="p-2 border">{participant.club}</td>
                        <td className="p-2 border">{participant.category}</td>
                        <td className="p-2 border">
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeParticipant(participant.id)}
                          >
                            Rimuovi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-100 rounded">
                <p>Nessun iscritto registrato. Aggiungi nuovi iscritti per iniziare.</p>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="p-4 text-center">
            <p>Questa sezione è in fase di sviluppo.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Ping Pong Tournament</h1>
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
          </ul>
        </nav>
        <div className="absolute bottom-0 p-4 w-64 border-t border-gray-700">
          <div className="flex items-center text-sm">
            <Info size={16} className="mr-2" />
            Tornei di Tennistavolo v0.1
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default MinimalTournamentApp;