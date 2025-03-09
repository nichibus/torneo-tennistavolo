import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const TableManager = () => {
  const { resources, updateTotalTables } = useAppContext();
  const [tempTableCount, setTempTableCount] = useState(resources.tables.total);

  const handleSave = () => {
    updateTotalTables(Number(tempTableCount));
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold text-lg mb-4">Gestione Tavoli</h3>
      
      <div className="mb-4">
        <p className="mb-2">
          Configura il numero totale di tavoli disponibili per tutte le competizioni. 
          Questi tavoli saranno condivisi tra tutte le competizioni attive.
        </p>
        
        <div className="flex items-center space-x-4">
          <div className="w-full max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero di Tavoli
            </label>
            <input
              type="number"
              min="1"
              value={tempTableCount}
              onChange={(e) => setTempTableCount(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-5"
          >
            Salva
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Stato Attuale</h4>
        <div className="grid grid-cols-4 gap-4 mt-2">
          {Array.from({ length: resources.tables.total }).map((_, index) => (
            <div 
              key={index} 
              className="bg-green-100 border border-green-300 rounded p-4 text-center"
            >
              <div className="font-bold">Tavolo {index + 1}</div>
              <div className="text-sm text-green-600">Disponibile</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableManager;