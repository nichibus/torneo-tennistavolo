import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const GroupMatches = ({ competition, groupData, matchData }) => {
  const [showResultForm, setShowResultForm] = useState(false);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(null);
  const [setScores, setSetScores] = useState([{ player1: '', player2: '' }]);
  const [setsWon, setSetsWon] = useState({ player1: 0, player2: 0 });
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  
  // Refs per i campi di input
  const inputRefs = useRef([]);
  
  // Otteniamo le funzioni di aggiornamento dal contesto
  const { setMatches } = useAppContext();

  // Determina il numero massimo di set e quanti per vincere in base al formato
  const maxSets = competition ? (competition.setFormat === '3' ? 3 : 5) : 3;
  const setsToWin = Math.ceil(maxSets / 2);

  // Effetto per gestire il focus automatico quando cambia currentSetIndex
  useEffect(() => {
    if (showResultForm && inputRefs.current[currentSetIndex * 2]) {
      inputRefs.current[currentSetIndex * 2].focus();
    }
  }, [currentSetIndex, showResultForm]);

  // Effetto per calcolare i set vinti quando cambiano i punteggi
  useEffect(() => {
    if (setScores.length > 0) {
      let p1Sets = 0;
      let p2Sets = 0;
      
      setScores.forEach(set => {
        if (isSetValid(set)) {
          if (parseInt(set.player1) > parseInt(set.player2)) {
            p1Sets++;
          } else {
            p2Sets++;
          }
        }
      });
      
      setSetsWon({ player1: p1Sets, player2: p2Sets });
    }
  }, [setScores]);

  // Funzione per aprire il form di inserimento risultato
  const openResultForm = (match, index) => {
    setSelectedMatchIndex(index);
    setCurrentSetIndex(0);
    
    // Azzera i refs degli input
    inputRefs.current = [];
    
    // Se c'è già un risultato con i punteggi dei set, li carichiamo
    if (match.result && match.result.setScores) {
      setSetScores(match.result.setScores.map(set => ({
        player1: set.player1.toString(),
        player2: set.player2.toString()
      })));
      
      // Calcola subito i set vinti
      let p1Sets = 0;
      let p2Sets = 0;
      match.result.setScores.forEach(set => {
        if (set.player1 > set.player2) p1Sets++;
        else p2Sets++;
      });
      setSetsWon({ player1: p1Sets, player2: p2Sets });
    } else {
      // Inizializziamo con un set vuoto
      setSetScores([{ player1: '', player2: '' }]);
      setSetsWon({ player1: 0, player2: 0 });
    }
    
    setShowResultForm(true);
  };

  // Verifica se la partita è terminata (un giocatore ha vinto abbastanza set)
  const isMatchComplete = () => {
    return setsWon.player1 >= setsToWin || setsWon.player2 >= setsToWin;
  };

  // Funzione per gestire l'inserimento nei campi di punteggio
  const handleScoreInput = (setIndex, player, value) => {
    // Accetta solo numeri
    if (!/^\d*$/.test(value)) return;
    
    const updatedScores = [...setScores];
    
    // Assicurati che questo set esista
    if (!updatedScores[setIndex]) {
      updatedScores[setIndex] = { player1: '', player2: '' };
    }
    
    // Aggiorna il punteggio
    updatedScores[setIndex][player] = value;
    
    // Aggiorna lo stato
    setSetScores(updatedScores);
    
    // Verifica se il set è valido e se dobbiamo aggiungere automaticamente un nuovo set
    const currentSet = updatedScores[setIndex];
    if (isSetComplete(currentSet)) {
      // Se abbiamo completato un set e non abbiamo raggiunto il limite
      if (!isMatchComplete() && setIndex === updatedScores.length - 1 && updatedScores.length < maxSets) {
        // Aggiungi automaticamente un nuovo set
        updatedScores.push({ player1: '', player2: '' });
        setSetScores(updatedScores);
        
        // Passa al prossimo set
        setCurrentSetIndex(setIndex + 1);
      }
    }
  };

  // Gestisce la pressione di tasti nei campi di input
  const handleKeyDown = (e, setIndex, playerField) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      
      // Se siamo nel campo player1, passa a player2 dello stesso set
      if (playerField === 'player1') {
        if (inputRefs.current[setIndex * 2 + 1]) {
          inputRefs.current[setIndex * 2 + 1].focus();
        }
      } 
      // Se siamo nel campo player2 dell'ultimo set
      else if (setIndex === setScores.length - 1) {
        // Se la partita non è completa e non abbiamo raggiunto il massimo dei set, aggiungi un set
        if (!isMatchComplete() && setScores.length < maxSets) {
          const newScores = [...setScores, { player1: '', player2: '' }];
          setSetScores(newScores);
          setCurrentSetIndex(setIndex + 1);
          // Il focus verrà gestito dall'effetto useEffect
        } else if (isResultValid()) {
          // Se la partita è completa e valida, salva il risultato
          saveResult();
        }
      } 
      // Altrimenti passa al campo player1 del set successivo
      else if (inputRefs.current[(setIndex + 1) * 2]) {
        inputRefs.current[(setIndex + 1) * 2].focus();
      }
    }
  };

  // Verifica se un set è valido secondo le regole del tennistavolo
  const isSetValid = (set) => {
    // Se un campo è vuoto, il set non è valido
    if (set.player1 === '' || set.player2 === '') return false;
    
    const p1 = parseInt(set.player1);
    const p2 = parseInt(set.player2);
    
    // Almeno un giocatore deve avere raggiunto 11 punti
    const reachedMinimum = p1 >= 11 || p2 >= 11;
    
    // Deve esserci uno scarto di almeno 2 punti
    const hasTwoPointLead = Math.abs(p1 - p2) >= 2;
    
    return reachedMinimum && hasTwoPointLead;
  };

  // Verifica se un set è stato completato (anche se non è necessariamente valido)
  const isSetComplete = (set) => {
    // Se un campo è vuoto, il set non è completo
    if (set.player1 === '' || set.player2 === '') return false;
    
    const p1 = parseInt(set.player1);
    const p2 = parseInt(set.player2);
    
    // Verifica che il set sembri completo
    const seemsComplete = (p1 >= 11 && p1 - p2 >= 2) || (p2 >= 11 && p2 - p1 >= 2);
    
    return seemsComplete;
  };

  // Verifica se il risultato complessivo è valido
  const isResultValid = () => {
    // Deve esserci almeno un set
    if (setScores.length === 0) return false;
    
    // Tutti i set inseriti devono essere validi
    const allSetsValid = setScores.every(isSetValid);
    if (!allSetsValid) return false;
    
    // Un giocatore deve aver vinto sufficienti set
    return setsWon.player1 >= setsToWin || setsWon.player2 >= setsToWin;
  };

  // Funzione per salvare il risultato
  const saveResult = () => {
    if (selectedMatchIndex === null || !isResultValid()) return;
    
    // Converti i punteggi da string a number
    const numericSetScores = setScores.map(set => ({
      player1: parseInt(set.player1),
      player2: parseInt(set.player2)
    }));
    
    // Crea il risultato finale
    const result = {
      player1Sets: setsWon.player1,
      player2Sets: setsWon.player2,
      setScores: numericSetScores
    };
    
    // Aggiorna il risultato nella lista delle partite
    setMatches(prevMatches => {
      const updatedMatches = [...(prevMatches[competition.id] || [])];
      updatedMatches[selectedMatchIndex] = {
        ...updatedMatches[selectedMatchIndex],
        result
      };
      
      return {
        ...prevMatches,
        [competition.id]: updatedMatches
      };
    });
    
    // Chiudi il form
    setShowResultForm(false);
    setSelectedMatchIndex(null);
  };

  // Funzione per simulare un risultato casuale intelligente
  const simulateRandomResult = () => {
    const newSetScores = [];
    let p1Sets = 0;
    let p2Sets = 0;
    
    // Genera set fino a quando un giocatore non vince
    while (p1Sets < setsToWin && p2Sets < setsToWin && newSetScores.length < maxSets) {
      // Decide casualmente chi vince questo set
      const player1Wins = Math.random() > 0.5;
      
      let p1Score, p2Score;
      
      if (player1Wins) {
        // Player 1 vince questo set
        p1Score = 11;
        // Genera un punteggio realistico per il perdente
        if (Math.random() < 0.7) {
          // Partita non troppo combattuta
          p2Score = Math.floor(Math.random() * 8); // 0-7
        } else if (Math.random() < 0.5) {
          // Partita combattuta
          p2Score = 8 + Math.floor(Math.random() * 3); // 8-10
        } else {
          // Partita ai vantaggi
          p1Score = 11 + Math.floor(Math.random() * 5); // 11-15
          p2Score = p1Score - 2;
        }
        p1Sets++;
      } else {
        // Player 2 vince questo set
        p2Score = 11;
        // Genera un punteggio realistico per il perdente
        if (Math.random() < 0.7) {
          // Partita non troppo combattuta
          p1Score = Math.floor(Math.random() * 8); // 0-7
        } else if (Math.random() < 0.5) {
          // Partita combattuta
          p1Score = 8 + Math.floor(Math.random() * 3); // 8-10
        } else {
          // Partita ai vantaggi
          p2Score = 11 + Math.floor(Math.random() * 5); // 11-15
          p1Score = p2Score - 2;
        }
        p2Sets++;
      }
      
      newSetScores.push({ 
        player1: p1Score.toString(), 
        player2: p2Score.toString() 
      });
    }
    
    setSetScores(newSetScores);
    setSetsWon({ player1: p1Sets, player2: p2Sets });
  };

  if (!matchData || matchData.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow text-center">
        <p>Nessuna partita programmata. Genera prima i gironi.</p>
      </div>
    );
  }

  // Raggruppare le partite per girone
  const matchesByGroup = {};
  matchData.forEach(match => {
    if (!matchesByGroup[match.groupIndex]) {
      matchesByGroup[match.groupIndex] = [];
    }
    matchesByGroup[match.groupIndex].push(match);
  });

  return (
    <div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold text-lg mb-4">Calendario Partite</h3>
        
        {/* Form per inserire il risultato con i punteggi dei set */}
        {showResultForm && selectedMatchIndex !== null && (
          <div className="bg-gray-100 p-4 rounded mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold">
                {matchData[selectedMatchIndex].player1.firstName} {matchData[selectedMatchIndex].player1.lastName} vs {matchData[selectedMatchIndex].player2.firstName} {matchData[selectedMatchIndex].player2.lastName}
              </h4>
              <div className="text-sm">
                Formato: {competition.setFormat === '3' ? 'Al meglio dei 3 set (2 su 3)' : 'Al meglio dei 5 set (3 su 5)'}
              </div>
            </div>
            
            {/* Sistema di inserimento rapido dei punteggi */}
            <div className="overflow-hidden bg-white border rounded-lg mb-4">
              <div className="grid grid-cols-9 bg-gray-200 p-1">
                <div className="col-span-4 font-semibold pl-3">
                  {matchData[selectedMatchIndex].player1.firstName} {matchData[selectedMatchIndex].player1.lastName}
                </div>
                <div className="col-span-1 text-center font-bold">
                  {setsWon.player1}
                </div>
                <div className="col-span-4 font-semibold pl-3">
                  {matchData[selectedMatchIndex].player2.firstName} {matchData[selectedMatchIndex].player2.lastName}
                </div>
              </div>
              
              {/* Righe per l'inserimento dei punteggi */}
              <div className="max-h-64 overflow-y-auto">
                {setScores.map((set, index) => {
                  const isValid = isSetValid(set);
                  const isComplete = isSetComplete(set);
                  const isCurrentSet = index === currentSetIndex;
                  
                  return (
                    <div 
                      key={index} 
                      className={`grid grid-cols-9 p-1 border-b ${isValid ? 'bg-green-50' : isComplete ? 'bg-red-50' : 'bg-white'} ${isCurrentSet ? 'ring-2 ring-blue-300' : ''}`}
                    >
                      <div className="col-span-4 flex items-center">
                        <div className="w-6 text-center mr-2 text-gray-500">
                          {index + 1}
                        </div>
                        <input
                          ref={el => inputRefs.current[index * 2] = el}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className={`w-16 p-2 border rounded ${isValid && parseInt(set.player1) > parseInt(set.player2) ? 'bg-green-100 font-bold' : ''}`}
                          value={set.player1}
                          onChange={(e) => handleScoreInput(index, 'player1', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index, 'player1')}
                          disabled={isMatchComplete() && index >= setsWon.player1 + setsWon.player2}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        {isValid && (
                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="col-span-4 flex items-center">
                        <input
                          ref={el => inputRefs.current[index * 2 + 1] = el}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className={`w-16 p-2 border rounded ${isValid && parseInt(set.player2) > parseInt(set.player1) ? 'bg-green-100 font-bold' : ''}`}
                          value={set.player2}
                          onChange={(e) => handleScoreInput(index, 'player2', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index, 'player2')}
                          disabled={isMatchComplete() && index >= setsWon.player1 + setsWon.player2}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {/* Pulsante per aggiungere un set (visibile solo se necessario) */}
                {!isMatchComplete() && setScores.length < maxSets && (
                  <div 
                    className="p-2 text-center text-blue-600 hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      const newScores = [...setScores, { player1: '', player2: '' }];
                      setSetScores(newScores);
                      setCurrentSetIndex(setScores.length);
                    }}
                  >
                    + Aggiungi Set
                  </div>
                )}
              </div>
            </div>
            
            {/* Stato della partita e pulsanti di azione */}
            <div className="flex justify-between items-center">
              <div>
                {isMatchComplete() ? (
                  <div className="text-green-600 font-semibold">
                    Partita completata: {setsWon.player1 > setsWon.player2 
                      ? `${matchData[selectedMatchIndex].player1.firstName} ha vinto ${setsWon.player1}-${setsWon.player2}`
                      : `${matchData[selectedMatchIndex].player2.firstName} ha vinto ${setsWon.player2}-${setsWon.player1}`}
                  </div>
                ) : (
                  <div className="text-blue-600">
                    Inserisci i punteggi dei set. Premi Tab o Enter per navigare tra i campi.
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={simulateRandomResult}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Simula
                </button>
                
                <button
                  onClick={() => setShowResultForm(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Annulla
                </button>
                
                <button
                  onClick={saveResult}
                  disabled={!isResultValid()}
                  className={`px-3 py-1 rounded flex items-center ${!isResultValid() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salva
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Tabelle delle partite raggruppate per girone */}
        {Object.keys(matchesByGroup).map(groupIndex => {
          const groupMatches = matchesByGroup[groupIndex];
          
          return (
            <div key={groupIndex} className="mb-6">
              <h4 className="font-semibold mb-2">Girone {parseInt(groupIndex) + 1}</h4>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Ordine</th>
                    <th className="p-2 border">Giocatore 1</th>
                    <th className="p-2 border">Giocatore 2</th>
                    <th className="p-2 border">Tavolo</th>
                    <th className="p-2 border">Arbitro</th>
                    <th className="p-2 border">Risultato</th>
                    <th className="p-2 border">Dettagli</th>
                    <th className="p-2 border">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {groupMatches.map((match, idx) => {
                    const globalIndex = matchData.findIndex(m => 
                      m.player1.id === match.player1.id && 
                      m.player2.id === match.player2.id && 
                      m.groupIndex === match.groupIndex
                    );
                    
                    return (
                      <tr key={idx} className={match.result ? 'bg-green-50' : ''}>
                        <td className="p-2 border text-center">{idx + 1}</td>
                        <td className="p-2 border">
                          <div className={match.result && match.result.player1Sets > match.result.player2Sets ? "font-semibold" : ""}>
                            {match.player1.firstName} {match.player1.lastName}
                          </div>
                        </td>
                        <td className="p-2 border">
                          <div className={match.result && match.result.player2Sets > match.result.player1Sets ? "font-semibold" : ""}>
                            {match.player2.firstName} {match.player2.lastName}
                          </div>
                        </td>
                        <td className="p-2 border text-center">
                          {match.table ? match.table : (
                            <span className="text-gray-500">Non assegnato</span>
                          )}
                        </td>
                        <td className="p-2 border text-sm">
                          {match.referee ? `${match.referee.firstName} ${match.referee.lastName}` : '-'}
                        </td>
                        <td className="p-2 border text-center font-bold">
                          {match.result ? (
                            <>
                              <span className={match.result.player1Sets > match.result.player2Sets ? "text-green-600" : ""}>
                                {match.result.player1Sets}
                              </span>
                              {" - "}
                              <span className={match.result.player2Sets > match.result.player1Sets ? "text-green-600" : ""}>
                                {match.result.player2Sets}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400 font-normal">In attesa</span>
                          )}
                        </td>
                        <td className="p-2 border text-center">
                          {match.result && match.result.setScores ? (
                            <div className="flex flex-col text-xs">
                              {match.result.setScores.map((set, setIdx) => (
                                <div key={setIdx} className="mb-1 last:mb-0">
                                  <span className={set.player1 > set.player2 ? "font-bold" : ""}>
                                    {set.player1}
                                  </span>
                                  {"-"}
                                  <span className={set.player2 > set.player1 ? "font-bold" : ""}>
                                    {set.player2}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-2 border">
                          <button 
                            className={`px-2 py-1 rounded text-sm ${match.result ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white flex items-center mx-auto`}
                            onClick={() => openResultForm(match, globalIndex)}
                          >
                            {match.result ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Modifica
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Inserisci
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupMatches;