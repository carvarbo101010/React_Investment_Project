import io
from datetime import datetime
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import pandas as pd
import yfinance as yf

app = Flask(__name__)
CORS(app)

@app.route('/api/debt-to-equity', methods=['POST'])
def calculate_debt_to_equity():
    try:
        data = request.json
        ticker = data.get('ticker')
        
        if not ticker:
            return jsonify({'error': 'Ticker is required'}), 400
        
        # Create ticker object
        tckr = yf.Ticker(ticker)
        
        # Get annual balance sheet data
        balance_sheet = tckr.balance_sheet
        
        if balance_sheet.empty:
            return jsonify({'error': f'No balance sheet data found for {ticker}'}), 404
        
        data_list = []
        
        # Calculate debt-to-equity ratio for each year
        for date in balance_sheet.columns:
            year = date.strftime('%Y')
            
            # Get debt components
            long_term_debt = balance_sheet.loc['Long Term Debt', date] if 'Long Term Debt' in balance_sheet.index else 0
            short_term_debt = balance_sheet.loc['Current Debt', date] if 'Current Debt' in balance_sheet.index else 0
            
            # Calculate total debt
            total_debt = (long_term_debt if pd.notna(long_term_debt) else 0) + (short_term_debt if pd.notna(short_term_debt) else 0)
            
            # Get total equity - try different possible field names
            equity_fields = ['Total Stockholder Equity', 'Stockholders Equity', 'Total Equity', 'Shareholders Equity']
            total_equity = None
            
            for field in equity_fields:
                if field in balance_sheet.index:
                    total_equity = balance_sheet.loc[field, date]
                    break
            
            # Calculate debt-to-equity ratio
            if pd.notna(total_equity) and total_equity != 0:
                debt_to_equity = total_debt / total_equity
                data_list.append({
                    'year': year,
                    'debt_to_equity': round(debt_to_equity, 2),
                    'stock': ticker
                })
        
        return jsonify({'data': data_list})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/debt-to-equity-csv', methods=['POST'])
def generate_debt_to_equity_csv():
    try:
        data = request.json
        ticker = data.get('ticker')
        
        if not ticker:
            return jsonify({'error': 'Ticker is required'}), 400
        
        # Create ticker object
        tckr = yf.Ticker(ticker)
        
        # Get annual balance sheet data
        balance_sheet = tckr.balance_sheet
        
        if balance_sheet.empty:
            return jsonify({'error': f'No balance sheet data found for {ticker}'}), 404
        
        data_list = []
        
        # Calculate debt-to-equity ratio for each year
        for date in balance_sheet.columns:
            year = date.strftime('%Y')
            
            # Get debt components
            long_term_debt = balance_sheet.loc['Long Term Debt', date] if 'Long Term Debt' in balance_sheet.index else 0
            short_term_debt = balance_sheet.loc['Current Debt', date] if 'Current Debt' in balance_sheet.index else 0
            
            # Calculate total debt
            total_debt = (long_term_debt if pd.notna(long_term_debt) else 0) + (short_term_debt if pd.notna(short_term_debt) else 0)
            
            # Get total equity - try different possible field names
            equity_fields = ['Total Stockholder Equity', 'Stockholders Equity', 'Total Equity', 'Shareholders Equity']
            total_equity = None
            
            for field in equity_fields:
                if field in balance_sheet.index:
                    total_equity = balance_sheet.loc[field, date]
                    break
            
            # Calculate debt-to-equity ratio
            if pd.notna(total_equity) and total_equity != 0:
                debt_to_equity = total_debt / total_equity
                data_list.append({
                    'year': year,
                    'debt_to_equity': round(debt_to_equity, 2),
                    'stock': ticker
                })
        
        # Create DataFrame and CSV
        df = pd.DataFrame(data_list)
        
        # Create a BytesIO object to hold the CSV data
        output = io.BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        # Send the CSV file
        return send_file(
            io.BytesIO(output.getvalue()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'debt_to_equity_{ticker}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    # Side Note: This condition ensures the code below only runs when the script is executed directly
    # Not when it's imported as a module
    
    app.run(debug=True, port=5000)
    # Side Note: debug=True enables auto-reload when code changes and shows detailed error messages
    # port=5000 sets the server to run on localhost:5000