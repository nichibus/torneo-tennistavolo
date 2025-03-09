import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import GroupList from './GroupList';
import GroupMatches from './GroupMatches';
import GroupStandings from './GroupStandings';
import { generateGroups } from '../../utils/groupUtils';

const GroupView = () => {
  const { 
    competitions, 
    participants, 
    selectedCompetition, 
    setSelectedCompetition,
    groups,
    setGroups,
    matches,
    setMatches
  } = useAppContext();
  
  const [activeGroupTab, setActiveGroupTab] = useState('groups');

  const handleGenerateGroups = (competition) => {
    generateGroups(competition, participants, setGroups, setMatches);
  };

  return (
    <div className="p-4">
      {selectedCompetition ? (
        <>
          <div className="flex justify-between mb-4 items-center">
            <h2 className="text-xl font-bold">Gestione Gironi: {selectedCompetition.name}</h2>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 rounded ${activeGroupTab === 'groups' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveGroupTab('groups')}
              >
                Gironi
              </button>
              <button 
                className={`px-3 py-1 rounded ${activeGroupTab === 'matches' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveGroupTab('matches')}
              >
                Partite
              </button>
              <button 
                className={`px-3 py-1 rounded ${activeGroupTab === 'standings' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveGroupTab('standings')}
              >
                Classifiche
              </button>
              <button 
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded ml-4"
                onClick={() => setSelectedCompetition(null)}
              >
                Torna alle competizioni
              </button>
            </div>
          </div>
          
          {activeGroupTab === 'groups' && (
            <GroupList 
              competition={selectedCompetition} 
              groupData={groups[selectedCompetition.id]} 
              onGenerateGroups={handleGenerateGroups}
            />
          )}
          
          {activeGroupTab === 'matches' && (
            <GroupMatches 
              competition={selectedCompetition}
              groupData={groups[selectedCompetition.id]}
              matchData={matches[selectedCompetition.id]}
            />
          )}
          
          {activeGroupTab === 'standings' && (
            <GroupStandings 
              competition={selectedCompetition}
              groupData={groups[selectedCompetition.id]}
              matchData={matches[selectedCompetition.id]}
            />
          )}
        </>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Seleziona una Competizione</h2>
          {competitions.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {competitions.map(competition => (
                <div key={competition.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-bold text-lg mb-2">{competition.name}</h3>
                  <p className="text-sm mb-2"><span className="font-semibold">Categorie:</span> {competition.categories.join(', ')}</p>
                  <button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mt-2"
                    onClick={() => setSelectedCompetition(competition)}
                  >
                    Gestisci Gironi
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded">
              <p>Nessuna competizione configurata. Vai alla sezione "Competizioni" per crearne una.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupView;