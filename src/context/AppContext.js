import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Stato dell'applicazione
  const [participants, setParticipants] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [groups, setGroups] = useState({});
  const [matches, setMatches] = useState({});
  const [brackets, setBrackets] = useState({});
  const [bracketMatches, setBracketMatches] = useState({});
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  
  // Stato per la gestione delle risorse
  const [resources, setResources] = useState({
    tables: {
      total: 4, // Numero predefinito di tavoli
      allocation: {} // Mappa delle allocazioni (ora -> {tableId -> matchId})
    },
    timeSlots: [] // Fasce orarie disponibili per le partite
  });
  
  // AGGIUNTE LE FUNZIONI PER GESTIRE I PARTECIPANTI
  const addParticipant = (participant) => {
    setParticipants(prev => [...prev, { ...participant, id: Date.now() }]);
  };

  const removeParticipant = (id) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const updateParticipant = (id, updatedData) => {
    setParticipants(prev => 
      prev.map(participant => 
        participant.id === id ? { ...participant, ...updatedData } : participant
      )
    );
  };

  const importParticipants = (newParticipants) => {
    setParticipants(prev => [...prev, ...newParticipants]);
  };

  // AGGIUNTE LE FUNZIONI PER GESTIRE LE COMPETIZIONI
  const addCompetition = (competition) => {
    setCompetitions(prev => [...prev, { ...competition, id: Date.now() }]);
  };

  const removeCompetition = (id) => {
    setCompetitions(prev => prev.filter(c => c.id !== id));
  };
  
  // Funzioni per gestire le risorse
  const updateTotalTables = (count) => {
    setResources(prev => ({
      ...prev,
      tables: {
        ...prev.tables,
        total: count
      }
    }));
  };
  
  const allocateTable = (tableId, matchId, timeSlot) => {
    setResources(prev => {
      const newAllocation = { ...prev.tables.allocation };
      if (!newAllocation[timeSlot]) {
        newAllocation[timeSlot] = {};
      }
      newAllocation[timeSlot][tableId] = matchId;
      
      return {
        ...prev,
        tables: {
          ...prev.tables,
          allocation: newAllocation
        }
      };
    });
  };
  
  const deallocateTable = (tableId, timeSlot) => {
    setResources(prev => {
      const newAllocation = { ...prev.tables.allocation };
      if (newAllocation[timeSlot] && newAllocation[timeSlot][tableId]) {
        delete newAllocation[timeSlot][tableId];
      }
      
      return {
        ...prev,
        tables: {
          ...prev.tables,
          allocation: newAllocation
        }
      };
    });
  };
  
  const addTimeSlot = (startTime, endTime) => {
    setResources(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime, endTime, id: Date.now() }]
    }));
  };
  
  const removeTimeSlot = (timeSlotId) => {
    setResources(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter(slot => slot.id !== timeSlotId)
    }));
  };
  
  // Funzione avanzata per ottimizzare l'allocazione dei tavoli
  const optimizeTableAllocation = () => {
    // Qui implementeremo l'algoritmo di ottimizzazione
    // Per ora, è solo un placeholder
    console.log("Ottimizzazione delle allocazioni dei tavoli...");
    
    // Raccogliamo tutte le partite da tutte le competizioni
    const allMatches = [];
    Object.keys(matches).forEach(competitionId => {
      matches[competitionId].forEach(match => {
        allMatches.push({
          ...match,
          competitionId
        });
      });
    });
    
    Object.keys(bracketMatches).forEach(competitionId => {
      bracketMatches[competitionId].forEach(match => {
        if (match.player1 && match.player2) { // Solo partite con giocatori assegnati
          allMatches.push({
            ...match,
            competitionId,
            isBracketMatch: true
          });
        }
      });
    });
    
    console.log(`Trovate ${allMatches.length} partite da allocare`);
    
    // Qui implementeremo l'algoritmo vero e proprio
    // Per ora, restituiamo solo le partite
    return allMatches;
  };
  
  const value = {
    // Stato e funzioni esistenti
    participants,
    competitions,
    groups,
    matches,
    brackets,
    bracketMatches,
    selectedCompetition,
    setParticipants,
    addParticipant,
    removeParticipant,
    updateParticipant,
    importParticipants,
    setCompetitions,
    addCompetition,
    removeCompetition,
    setSelectedCompetition,
    setGroups,
    setMatches,
    setBrackets,
    setBracketMatches,
    
    // Proprietà e funzioni per le risorse
    resources,
    updateTotalTables,
    allocateTable,
    deallocateTable,
    addTimeSlot,
    removeTimeSlot,
    optimizeTableAllocation
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;