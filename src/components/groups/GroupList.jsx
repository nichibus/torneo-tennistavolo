import React from 'react';

const GroupList = ({ competition, groupData, onGenerateGroups }) => {
  return (
    <div>
      {groupData && groupData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupData.map((group, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg mb-2">Girone {index + 1}</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">Giocatore</th>
                    <th className="p-2 border text-left">Categoria</th>
                    <th className="p-2 border text-left">Società</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map(player => (
                    <tr key={player.id}>
                      <td className="p-2 border">{player.firstName} {player.lastName}</td>
                      <td className="p-2 border">{player.category}</td>
                      <td className="p-2 border">{player.club}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow">
          <p className="mb-4">Nessun girone generato. Crea i gironi per la competizione.</p>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => onGenerateGroups(competition)}
          >
            Genera Gironi
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupList;