import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const ScheduleVisualizer = () => {
  const { resources, matches, bracketMatches, competitions, optimizeTableAllocation } = useAppContext();
  const [scheduledMatches, setScheduledMatches] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  
  useEffect(() => {
    // In una applicazione reale, qui calcoleremmo lo stato attuale delle allocazioni
    // Per ora, generiamo alcuni dati di esempio
    const allMatches = optimizeTableAllocation();
    setScheduledMatches(allMatches.slice(0, 10)); // Prendiamo solo 10 partite per semplicità
    
    // Simuliamo alcuni conflitti
    setConflicts([
      {
        id: 1,
        description: "Il giocatore Mario Rossi è stato assegnato a due partite contemporaneamente",
        timeSlot: "10:00 - 11:00",
        affectedMatches: [1, 3]
      },
      {
        id: 2,
        description: "Più partite assegnate allo stesso tavolo",
        timeSlot: "11:00 - 12:00",
        affectedMatches: [5, 8]
      }
    ]);
  }, [optimizeTableAllocation]);
  
  // Funzione per ottenere il nome della competizione
  const getCompetitionName = (competitionId) => {
    const comp = competitions.find(c => c.id === Number(competitionId));
    return comp ? comp.name : 'Competizione sconosciuta';
  };
  
  // Funzione per ottenere il nome del giocatore
  const getPlayerName = (player) => {
    return player ? `${player.firstName} ${player.lastName}` : 'TBD';
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold text-lg mb-4">Pianificazione Partite</h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <p className="mb-2">
            Visualizza e ottimizza l'allocazione dei tavoli per tutte le partite pianificate.
          </p>
          
          <button
            onClick={() => alert('Funzionalità di ottimizzazione da implementare')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Ottimizza Pianificazione
          </button>
        </div>
      </div>
      
      {conflicts.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-red-600 mb-2">Conflitti Rilevati</h4>
          <div className="space-y-2">
            {conflicts.map(conflict => (
              <div key={conflict.id} className="bg-red-50 border border-red-200 p-3 rounded">
                <div className="text-red-800 font-medium">{conflict.description}</div>
                <div className="text-sm text-red-600">Fascia oraria: {conflict.timeSlot}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Competizione</th>
              <th className="p-2 border">Giocatore 1</th>
              <th className="p-2 border">Giocatore 2</th>
              <th className="p-2 border">Fase</th>
              <th className="p-2 border">Tavolo</th>
              <th className="p-2 border">Orario</th>
              <th className="p-2 border">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {scheduledMatches.length > 0 ? (
              scheduledMatches.map((match, index) => (
                <tr key={index}>
                  <td className="p-2 border">{getCompetitionName(match.competitionId)}</td>
                  <td className="p-2 border">{getPlayerName(match.player1)}</td>
                  <td className="p-2 border">{getPlayerName(match.player2)}</td>
                  <td className="p-2 border">
                    {match.isBracketMatch 
                      ? `Tabellone (${match.round === 0 ? "Quarti" : match.round === 1 ? "Semifinali" : "Finali"})`
                      : `Girone ${match.groupIndex + 1}`
                    }
                  </td>
                  <td className="p-2 border text-center">{match.table || '—'}</td>
                  <td className="p-2 border text-center">Non assegnato</td>
                  <td className="p-2 border">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => alert(`Implementare la riallocazione della partita ${index + 1}`)}
                    >
                      Riassegna
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  Nessuna partita pianificata. Genera i gironi e i tabelloni per iniziare.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleVisualizer;