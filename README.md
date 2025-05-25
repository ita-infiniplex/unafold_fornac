# DNA/RNA Structure Viewer

A web application for visualizing DNA/RNA secondary structures using UNAFold and fornac visualization library.

## Description

This tool allows users to:
- Input two DNA/RNA sequences
- Set temperature for folding analysis
- Visualize the predicted secondary structure
- Get energy calculations for the folding

## Prerequisites

- Node.js (v12 or higher)
- UNAFold 4.0 installed at `/opt/unafold-4.0/`
- Modern web browser with JavaScript enabled

## Installation

1. Clone the repository:

    git clone [your-repo-url]
    cd [repository-name]

2. Install dependencies:

    npm install

3. Verify UNAFold installation:

    /opt/unafold-4.0/bin/hybrid-min --version

## Usage

1. Start the server:

    npm start

2. Open your browser and navigate to:

    http://localhost:3000

3. Enter two sequences in the provided text areas
4. Set the desired temperature (default is 37°C)
5. Click "Analyze Structure" to view the results

## API Endpoints

### POST /api/fold
Calculates the secondary structure for two input sequences.

Request Body:

    {
      "seq1": "GCGCTTAAGCGC",
      "seq2": "GCGCTTAAGCGC",
      "temp": 37
    }

Response:

    {
      "sequence": "GCGCTTAAGCGC",
      "structure": "((((....))))",
      "energy": -3.4
    }

## Technology Stack

- Backend: Node.js with Express
- Frontend: HTML, CSS, JavaScript
- Structure Prediction: UNAFold 4.0
- Visualization: fornac.js
- Dependencies Management: npm

## File Structure

    ├── src/
    │   └── server.js
    ├── public/
    │   ├── index.html
    │   ├── styles.css
    │   └── app.js
    ├── package.json
    └── README.md

## Dependencies

- express: Web server framework
- fornac: RNA/DNA structure visualization
- d3.v3: Required for fornac visualization

## Acknowledgments

- UNAFold developers
- fornac.js developers
