import React, { useState } from 'react';
import { calculateGroupStandings, getCategoriesInGroup } from '../../utils/groupUtils';

const GroupStandings = ({ competition, groupData, matchData }) => {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedCategories, setSelectedCategories] = useState({});
  
  if (!groupData || groupData.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow text-center">
        <p>Nessuna classifica disponibile. Genera prima i gironi e inserisci i risultati.</p>
      </div>
    );
  }

  // Toggle l'espansione di un girone per vedere tutte le statistiche
  const toggleGroupExpand = (groupIndex) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupIndex]: !prev[groupIndex]
    }));
  };
  
  // Cambia la categoria selezionata per un girone
  const changeSelectedCategory = (groupIndex, category) => {
    setSelectedCategories(prev => ({
      ...prev,
      [groupIndex]: category
    }));
  };

  return (
    <div>
      <h3 className="font-bold text-lg mb-4">Classifiche dei Gironi</h3>
      
      {/* Stats Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded p-4 border border-blue-200 flex items-center">
          <div className="text-blue-500 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">Calcolo Classifica</h4>
            <p className="text-sm text-gray-600">Le classifiche sono ordinate per punti vittoria, scontro diretto, quoziente set e quoziente punti.</p>
          </div>
        </div>
        
        <div className="bg-green-50 rounded p-4 border border-green-200 flex items-center">
          <div className="text-green-500 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">Filtro per Categoria</h4>
            <p className="text-sm text-gray-600">Per gironi con più categorie, seleziona una categoria per vedere la classifica specifica.</p>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded p-4 border border-purple-200 flex items-center">
          <div className="text-purple-500 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-1">Statistiche Dettagliate</h4>
            <p className="text-sm text-gray-600">Clicca su "Espandi" per vedere statistiche avanzate con set vinti/persi e punti vinti/persi.</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {groupData.map((group, groupIndex) => {
          // Ottieni tutte le categorie presenti in questo girone
          const categoriesInGroup = getCategoriesInGroup(group);
          
          // Determina quale categoria visualizzare
          const selectedCategory = selectedCategories[groupIndex] || 
                                 (categoriesInGroup.length === 1 ? categoriesInGroup[0] : null);
          
          // Calcola la classifica per la categoria selezionata o per tutti
          const standings = calculateGroupStandings(
            group, 
            matchData ? matchData.filter(m => m.groupIndex === groupIndex && m.result) : [],
            selectedCategory
          );
          
          // Converti i valori a percentuale per una migliore visualizzazione
          const enhancedStandings = standings.map(player => ({
            ...player,
            // Converti i rapporti in percentuali per una migliore visualizzazione
            setRatioPercent: player.setRatio !== Infinity ? 
                             Math.round(player.setRatio * 100) : 100,
            pointRatioPercent: player.pointRatio !== Infinity ? 
                              Math.round(player.pointRatio * 100) : 100
          }));

          // Stato di espansione corrente per questo girone
          const isExpanded = expandedGroups[groupIndex] || false;
          
          return (
            <div key={groupIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <h4 className="font-bold text-gray-800">Girone {groupIndex + 1}</h4>
                
                {/* Se ci sono più categorie, mostra un selettore */}
                {categoriesInGroup.length > 1 && (
                  <select 
                    value={selectedCategory || ''} 
                    onChange={(e) => changeSelectedCategory(groupIndex, e.target.value || null)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="">Tutte le categorie</option>
                    {categoriesInGroup.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {enhancedStandings.length > 0 ? (
                <div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border text-left">Pos.</th>
                        <th className="p-2 border text-left">Giocatore</th>
                        {isExpanded && (
                          <>
                            <th className="p-2 border text-center">Cat.</th>
                            <th className="p-2 border text-center">Part.</th>
                          </>
                        )}
                        <th className="p-2 border text-center">V</th>
                        <th className="p-2 border text-center">Punti</th>
                        {isExpanded && (
                          <>
                            <th className="p-2 border text-center">Set V/P</th>
                            <th className="p-2 border text-center">Q.Set</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {enhancedStandings.map((player, index) => (
                        <tr key={player.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2 border text-center font-bold">
                            {index + 1}
                          </td>
                          <td className="p-2 border">
                            <div className="font-medium">{player.firstName} {player.lastName}</div>
                            {isExpanded && (
                              <div className="text-xs text-gray-500">{player.club}</div>
                            )}
                          </td>
                          {isExpanded && (
                            <>
                              <td className="p-2 border text-center text-xs">
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                  {player.category}
                                </span>
                              </td>
                              <td className="p-2 border text-center">{player.matches}</td>
                            </>
                          )}
                          <td className="p-2 border text-center">
                            <span className="font-semibold">{player.wins}</span>
                            {isExpanded && player.matches > 0 && (
                              <div className="text-xs text-gray-500">
                                ({Math.round(player.wins / player.matches * 100)}%)
                              </div>
                            )}
                          </td>
                          <td className="p-2 border text-center font-bold text-lg">
                            {player.points}
                          </td>
                          
                          {isExpanded && (
                            <>
                              <td className="p-2 border text-center">
                                <span className="text-green-600">{player.setsWon}</span>
                                {" / "}
                                <span className="text-red-600">{player.setsLost}</span>
                              </td>
                              <td className="p-2 border text-center">
                                <div className="inline-block w-12 bg-gray-200 rounded-full h-4 overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500" 
                                    style={{width: `${Math.min(player.setRatioPercent, 100)}%`}}
                                  ></div>
                                </div>
                                <div className="text-xs mt-1">{player.setRatioPercent}%</div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Statistiche dettagliate espandibili */}
                  {isExpanded && (
                    <div className="bg-blue-50 p-3 border-t">
                      <h5 className="font-semibold text-sm mb-2">Dettagli del Calcolo Classifica</h5>
                      
                      <div className="text-xs text-gray-700 space-y-1">
                        <p>• <strong>Parità tra 2 giocatori</strong>: Risoluzione tramite scontro diretto</p>
                        <p>• <strong>Parità tra 3+ giocatori</strong>: Mini classifica con scontri diretti</p>
                        <p>• <strong>Quoziente Set</strong>: Rapporto tra set vinti e set persi</p>
                        <p>• <strong>Quoziente Punti</strong>: Rapporto tra punti vinti e punti persi</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 px-4 py-2 border-t text-right">
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() => toggleGroupExpand(groupIndex)}
                    >
                      {isExpanded ? 'Comprimi' : 'Espandi'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {selectedCategory ? 
                    `Nessun giocatore della categoria ${selectedCategory} in questo girone.` : 
                    'Nessun risultato disponibile per questo girone.'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupStandings;