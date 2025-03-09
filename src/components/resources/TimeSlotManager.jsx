import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Trash } from 'lucide-react';

const TimeSlotManager = () => {
  const { resources, addTimeSlot, removeTimeSlot } = useAppContext();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const handleAddTimeSlot = () => {
    if (!startTime || !endTime) {
      alert('Seleziona entrambi gli orari di inizio e fine');
      return;
    }
    
    // Validazione dei tempi
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    if (start >= end) {
      alert('L\'orario di inizio deve essere precedente all\'orario di fine');
      return;
    }
    
    addTimeSlot(startTime, endTime);
    
    // Reset dei campi
    setStartTime('09:00');
    setEndTime('10:00');
  };

  // Funzione per formattare l'ora
  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold text-lg mb-4">Gestione Fasce Orarie</h3>
      
      <div className="mb-4">
        <p className="mb-2">
          Configura le fasce orarie disponibili per le partite del torneo.
          Queste fasce orarie saranno utilizzate per pianificare le partite.
        </p>
        
        <div className="flex flex-wrap items-end space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orario di Inizio
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orario di Fine
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          
          <button
            onClick={handleAddTimeSlot}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Aggiungi Fascia Oraria
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Fasce Orarie Configurate</h4>
        
        {resources.timeSlots.length === 0 ? (
          <p className="text-gray-500 italic">Nessuna fascia oraria configurata</p>
        ) : (
          <div className="space-y-2 mt-2">
            {resources.timeSlots.map(slot => (
              <div 
                key={slot.id} 
                className="flex justify-between items-center bg-gray-100 p-3 rounded"
              >
                <div>
                  <span className="font-medium">{formatTime(slot.startTime)}</span>
                  {" - "}
                  <span className="font-medium">{formatTime(slot.endTime)}</span>
                </div>
                
                <button
                  onClick={() => removeTimeSlot(slot.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotManager;