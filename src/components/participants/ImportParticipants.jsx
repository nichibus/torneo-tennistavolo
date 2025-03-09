import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAppContext } from '../../context/AppContext';

const categories = [
  'Giovanissimi', 'Giovanissime', 
  'Ragazzi', 'Ragazze', 
  'Allievi', 'Allieve', 
  'Juniores Maschile', 'Juniores Femminile', 
  'Seniores Maschile', 'Seniores Femminile', 
  'Adulti Maschile', 'Adulti Femminile', 
  'Veterani A Maschile', 'Veterani A Femminile', 
  'Veterani B Maschile', 'Veterani B Femminile', 
  'Eccellenza B Maschile', 'Eccellenza A Maschile', 'Eccellenza Femminile'
];

const ImportParticipants = ({ onClose }) => {
  const { importParticipants } = useAppContext();
  const fileInputRef = useRef(null);

  // Funzione di supporto per trovare la categoria che corrisponde meglio
  const findMatchingCategory = (categoryText) => {
    if (!categoryText) return categories[0]; // Default alla prima categoria
    
    // Cerca una corrispondenza esatta
    const exactMatch = categories.find(cat => 
      cat.toLowerCase() === categoryText.toLowerCase()
    );
    
    if (exactMatch) return exactMatch;
    
    // Cerca una corrispondenza parziale
    const partialMatch = categories.find(cat => 
      cat.toLowerCase().includes(categoryText.toLowerCase()) ||
      categoryText.toLowerCase().includes(cat.toLowerCase())
    );
    
    return partialMatch || categories[0]; // Ritorna la corrispondenza parziale o la prima categoria
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Prendi il primo foglio del file Excel
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Converti il foglio in JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          alert('Nessun dato trovato nel file Excel');
          return;
        }

        // Mappiamo i campi del file Excel ai campi del nostro applicativo
        const mappedData = jsonData.map(row => {
          return {
            id: Date.now() + Math.floor(Math.random() * 1000), // Id univoco
            firstName: row['Nome'] || row['NOME'] || row['nome'] || '',
            lastName: row['Cognome'] || row['COGNOME'] || row['cognome'] || '',
            club: row['Società'] || row['Societa'] || row['SOCIETA'] || row['Club'] || row['CLUB'] || row['club'] || '',
            birthDate: row['Data di Nascita'] || row['DataNascita'] || row['DATA_NASCITA'] || '',
            category: findMatchingCategory(row['Categoria'] || row['CATEGORIA'] || row['categoria'] || ''),
            rankingPoints: row['Punteggio'] || row['Classifica'] || row['PUNTEGGIO'] || row['punteggio'] || '1000'
          };
        });

        // Aggiungi i partecipanti importati alla lista esistente
        importParticipants(mappedData);
        
        alert(`Importati con successo ${mappedData.length} partecipanti`);
        onClose();
      } catch (error) {
        console.error('Errore durante la lettura del file Excel:', error);
        alert('Si è verificato un errore durante l\'importazione. Verifica il formato del file.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="bg-gray-100 p-4 rounded mb-4">
      <h3 className="font-bold mb-2">Importa Iscritti da Excel</h3>
      <p className="mb-4">Seleziona un file Excel (.xlsx, .xls) contenente i dati degli iscritti.</p>
      
      <div className="mb-4">
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload}
        />
        <button 
          className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded"
          onClick={() => fileInputRef.current.click()}
        >
          Seleziona File Excel
        </button>
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Formato supportato:</h4>
        <p className="text-sm">Il file Excel deve contenere le seguenti colonne (i nomi sono case-insensitive):</p>
        <ul className="text-sm list-disc ml-4 mt-2">
          <li>Nome</li>
          <li>Cognome</li>
          <li>Società / Club</li>
          <li>Data di Nascita (opzionale)</li>
          <li>Categoria</li>
          <li>Punteggio / Classifica (opzionale)</li>
        </ul>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button 
          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
          onClick={onClose}
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default ImportParticipants;