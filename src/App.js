import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticker, setTicker] = useState('');
  const [debtToEquityData, setDebtToEquityData] = useState([]);

  const handleCalculateDebtToEquity = async () => {
    if (!ticker.trim()) {
      setError('Please enter a ticker symbol');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/debt-to-equity', {
        ticker: ticker.toUpperCase()
      });

      setDebtToEquityData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to calculate debt-to-equity ratio');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!ticker.trim()) {
      setError('Please enter a ticker symbol');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios({
        method: 'POST',
        url: 'http://localhost:5000/api/debt-to-equity-csv',
        responseType: 'blob',
        data: {
          ticker: ticker.toUpperCase()
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `debt_to_equity_${ticker.toUpperCase()}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to download CSV');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>Debt-to-Equity Ratio Calculator</h1>
        
        <div className="input-section">
          <label htmlFor="ticker">Stock Ticker Symbol:</label>
          <input
            id="ticker"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="e.g., AAPL, MSFT, GOOGL"
            disabled={loading}
          />
        </div>

        <div className="button-section">
          <button 
            onClick={handleCalculateDebtToEquity} 
            disabled={loading || !ticker.trim()}
            className="calculate-btn"
          >
            {loading ? 'Calculating...' : 'Calculate Debt-to-Equity'}
          </button>

          <button 
            onClick={handleDownloadCSV} 
            disabled={loading || !ticker.trim()}
            className="download-btn"
          >
            {loading ? 'Generating...' : 'Download CSV'}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {debtToEquityData.length > 0 && (
          <div className="results-section">
            <h2>Debt-to-Equity Ratios for {ticker.toUpperCase()}</h2>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Debt-to-Equity Ratio</th>
                </tr>
              </thead>
              <tbody>
                {debtToEquityData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.year}</td>
                    <td>{item.debt_to_equity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;