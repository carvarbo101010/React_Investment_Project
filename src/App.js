import React, { useState } from 'react';
// Side Note: React is the main library, useState is a Hook for managing component state

import axios from 'axios';
// Side Note: axios is the HTTP library we installed for making API calls

import './App.css';
// Side Note: Imports the CSS file for styling this component

function App() {
  const [loading, setLoading] = useState(false);
  // Side Note: useState creates a state variable 'loading' with setter 'setLoading'
  // Initial value is false, will be true while generating CSV
  
  const [error, setError] = useState('');
  // Side Note: Stores any error messages to display to the user
  
  const [csvData, setCsvData] = useState([
    { name: 'John Doe', email: 'john@example.com', age: 30 },
    { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
  ]);
  // Side Note: Stores the data that will be converted to CSV
  // Initialized with sample data so users can see the format

  const handleGenerateCSV = async () => {
    // Side Note: async allows us to use await for asynchronous operations
    
    setLoading(true);
    // Side Note: Shows loading state while processing
    
    setError('');
    // Side Note: Clears any previous error messages

    try {
      const response = await axios({
        method: 'POST',
        // Side Note: HTTP method - POST sends data to the server
        
        url: 'http://localhost:5000/api/generate-csv',
        // Side Note: The Flask endpoint we created
        
        responseType: 'blob',
        // Side Note: 'blob' tells axios to handle the response as binary data (file)
        
        data: {
          rows: csvData
          // Side Note: Sends our table data as JSON in the request body
        }
      });

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      // Side Note: Creates a temporary URL for the blob (file) data
      
      const link = document.createElement('a');
      // Side Note: Creates an invisible <a> element
      
      link.href = url;
      // Side Note: Sets the link to point to our blob URL
      
      link.setAttribute('download', `data_${Date.now()}.csv`);
      // Side Note: Sets filename with timestamp (Date.now() gives milliseconds since 1970)
      
      document.body.appendChild(link);
      // Side Note: Adds the link to the page (still invisible)
      
      link.click();
      // Side Note: Programmatically clicks the link to trigger download
      
      link.parentNode.removeChild(link);
      // Side Note: Removes the link from the page after clicking
      
      window.URL.revokeObjectURL(url);
      // Side Note: Frees up memory by releasing the blob URL
    } catch (err) {
      setError('Failed to generate CSV. Please try again.');
      console.error('Error:', err);
      // Side Note: Shows error to user and logs details to console for debugging
    } finally {
      setLoading(false);
      // Side Note: finally block runs whether try succeeds or fails
      // Always turns off loading state
    }
  };

  const addRow = () => {
    setCsvData([...csvData, { name: '', email: '', age: 0 }]);
    // Side Note: ...csvData spreads the existing array items
    // Then adds a new empty row object at the end
  };

  const updateRow = (index, field, value) => {
    // Side Note: index - which row, field - which column, value - new value
    
    const newData = [...csvData];
    // Side Note: Creates a copy of the array (React needs new objects for re-rendering)
    
    newData[index][field] = value;
    // Side Note: Updates the specific field in the specific row
    
    setCsvData(newData);
    // Side Note: Updates state with the modified data
  };

  const deleteRow = (index) => {
    setCsvData(csvData.filter((_, i) => i !== index));
    // Side Note: filter creates new array excluding the item at the specified index
    // _ is a convention for unused parameters (the row data)
    // i is the current index being checked
  };

  return (
    <div className="App">
      {/* Side Note: JSX allows us to write HTML-like code in JavaScript */}
      
      <header className="App-header">
        <h1>CSV Generator with React + Python</h1>
        
        <div className="data-editor">
          <h2>Edit Data</h2>
          <table>
            <thead>
              {/* Side Note: thead groups header rows */}
              <tr>
                {/* Side Note: tr = table row */}
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Actions</th>
                {/* Side Note: th = table header cells */}
              </tr>
            </thead>
            <tbody>
              {/* Side Note: tbody groups data rows */}
              
              {csvData.map((row, index) => (
                // Side Note: map() loops through array and returns JSX for each item
                // row = current data object, index = position in array
                
                <tr key={index}>
                  {/* Side Note: key prop helps React track which items change */}
                  
                  <td>
                    {/* Side Note: td = table data cell */}
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(index, 'name', e.target.value)}
                      // Side Note: e.target.value gets the current input value
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      // Side Note: type="email" adds browser email validation
                      value={row.email}
                      onChange={(e) => updateRow(index, 'email', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      // Side Note: type="number" shows number input controls
                      value={row.age}
                      onChange={(e) => updateRow(index, 'age', parseInt(e.target.value) || 0)}
                      // Side Note: parseInt converts string to number, || 0 handles NaN
                    />
                  </td>
                  <td>
                    <button onClick={() => deleteRow(index)}>Delete</button>
                    {/* Side Note: Arrow function prevents immediate execution */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button onClick={addRow} className="add-btn">Add Row</button>
        </div>

        <button 
          onClick={handleGenerateCSV} 
          disabled={loading}
          // Side Note: disabled prevents clicking while processing
          className="generate-btn"
        >
          {loading ? 'Generating...' : 'Generate CSV'}
          {/* Side Note: Ternary operator shows different text based on loading state */}
        </button>

        {error && <p className="error">{error}</p>}
        {/* Side Note: && means only render if error is truthy (not empty string) */}
      </header>
    </div>
  );
}

export default App;