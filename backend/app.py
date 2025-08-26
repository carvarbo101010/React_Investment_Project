import io
# Side Note: io provides Python's main facilities for dealing with various types of I/O
# BytesIO creates an in-memory bytes buffer (like a file in RAM)

from datetime import datetime
# Side Note: datetime is used to add timestamps to generated files

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
# Side Note: Creates the Flask application instance

CORS(app)  # Enable CORS for React frontend
# Side Note: Applies CORS to all routes, allowing the React app to make requests

@app.route('/api/generate-csv', methods=['POST'])
# Side Note: @app.route is a decorator that maps the URL path to this function
# '/api/generate-csv' is the endpoint URL
# methods=['POST'] means this endpoint only accepts POST requests
def generate_csv():
    try:
        # Get data from request
        data = request.json
        # Side Note: request.json automatically parses JSON data sent from React
        
        # Example: Generate CSV based on received data
        # You can customize this based on your needs
        if data and 'rows' in data:
            # Create DataFrame from received data
            df = pd.DataFrame(data['rows'])
            # Side Note: pd.DataFrame() creates a table-like structure from the data
            # data['rows'] accesses the 'rows' key from the JSON sent by React
        else:
            # Generate sample data if none provided
            df = pd.DataFrame({
                'ID': range(1, 11),  # Creates numbers 1-10
                'Name': [f'Item {i}' for i in range(1, 11)],  # f-strings format strings with variables
                'Value': [i * 10 for i in range(1, 11)],  # List comprehension creates [10,20,30...]
                'Date': [datetime.now().strftime('%Y-%m-%d')] * 10  # Current date repeated 10 times
            })
        
        # Create a BytesIO object to hold the CSV data
        output = io.BytesIO()
        # Side Note: BytesIO creates a file-like object in memory (not on disk)
        
        df.to_csv(output, index=False)
        # Side Note: to_csv() converts DataFrame to CSV format
        # index=False prevents row numbers from being included in the CSV
        
        output.seek(0)
        # Side Note: seek(0) moves the "cursor" back to the beginning of the file
        # Like rewinding a tape before playing it
        
        # Send the CSV file
        return send_file(
            io.BytesIO(output.getvalue()),
            # Side Note: output.getvalue() gets all the bytes from the buffer
            # We create a new BytesIO to ensure proper file handling
            
            mimetype='text/csv',
            # Side Note: MIME type tells the browser this is a CSV file
            
            as_attachment=True,
            # Side Note: Forces download rather than displaying in browser
            
            download_name=f'generated_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            # Side Note: Sets the filename with timestamp (e.g., generated_data_20240315_143022.csv)
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        # Side Note: Catches any errors and returns them as JSON
        # 500 is the HTTP status code for "Internal Server Error"

@app.route('/api/health', methods=['GET'])
# Side Note: A simple endpoint to check if the server is running
def health_check():
    return jsonify({'status': 'healthy'})
    # Side Note: Returns JSON confirming the server is working

if __name__ == '__main__':
    # Side Note: This condition ensures the code below only runs when the script is executed directly
    # Not when it's imported as a module
    
    app.run(debug=True, port=5000)
    # Side Note: debug=True enables auto-reload when code changes and shows detailed error messages
    # port=5000 sets the server to run on localhost:5000