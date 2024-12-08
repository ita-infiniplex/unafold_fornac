const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/js', express.static(path.join(__dirname, '../public/js')));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));

app.post('/api/fold', async (req, res) => {
    const { seq1, seq2, temp = 37 } = req.body;
    console.log('Received request:', { seq1, seq2, temp });
    
    try {
        const result = await foldSequences(seq1, seq2, temp);
        console.log('Folding result:', result);
        res.json(result);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

async function foldSequences(seq1, seq2, temp) {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fold-'));
    const seq1Path = path.join(tmpDir, 'sequence1.fasta');
    const seq2Path = path.join(tmpDir, 'sequence2.fasta');
    
    try {
        await fs.writeFile(seq1Path, seq1);
        await fs.writeFile(seq2Path, seq2);
        
        return new Promise((resolve, reject) => {
            const command = `/opt/unafold-4.0/bin/hybrid-min ${seq1Path} ${seq2Path} -n DNA -t ${temp} -T ${temp}`;
            console.log('Executing command:', command);
            
            exec(command, { cwd: tmpDir }, async (error, stdout, stderr) => {
                console.log('stdout:', stdout);
                console.log('stderr:', stderr);
                
                if (error) {
                    console.error('Execution error:', error);
                    reject(error);
                    return;
                }
                
                try {
                    // List directory contents to debug
                    const files = await fs.readdir(tmpDir);
                    console.log('Files in temp directory:', files);
                    
                    const ctFile = path.join(tmpDir, 'sequence1.fasta-sequence2.fasta.ct');
                    const structures = await parseCTFile(ctFile);
                    resolve(structures);
                } catch (err) {
                    console.error('Error after UNAFold execution:', err);
                    reject(err);
                }
            });
        });
    } catch (error) {
        console.error('Error in foldSequences:', error);
        throw error;
    } finally {
        // Delay cleanup to allow for debugging
        setTimeout(async () => {
            try {
                await fs.rm(tmpDir, { recursive: true, force: true });
            } catch (err) {
                console.error('Error during cleanup:', err);
            }
        }, 1000);
    }
}

async function parseCTFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.trim().split('\n');
        
        // First line contains the number of bases and the energy
        const [numBases, , , , dG] = lines[0].trim().split(/\s+/);
        
        // Get the sequence and structure
        let sequence = '';
        let pairs = new Array(parseInt(numBases)).fill(0);
        
        // Start from line 1 (0-based index) as first line is header
        for (let i = 1; i < lines.length; i++) {
            const [, base, , , j] = lines[i].trim().split(/\s+/);
            sequence += base;
            pairs[i-1] = parseInt(j) || 0;
        }
        
        // Convert pairs array to dot-bracket notation
        let structure = new Array(pairs.length).fill('.');
        for (let i = 0; i < pairs.length; i++) {
            if (pairs[i] > i + 1) {  // Opening bracket
                structure[i] = '(';
                structure[pairs[i] - 1] = ')';
            }
        }
        structure = structure.join('');
        
        // Validate the structure
        if (sequence.length !== structure.length) {
            throw new Error('Sequence and structure lengths do not match');
        }
        
        console.log('Parsed structure:', {
            sequence,
            structure,
            energy: parseFloat(dG)
        });
        
        return {
            sequence,
            structure,
            energy: parseFloat(dG)
        };
    } catch (error) {
        console.error('Error parsing CT file:', error);
        throw new Error('Failed to parse structure file');
    }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 