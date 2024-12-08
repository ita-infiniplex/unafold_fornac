const logUsage = (component, action) => {
    console.log(`[Usage] ${component}: ${action}`);
  };
  
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for fornac:', typeof fornac);
    
    document.getElementById('sequenceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        
        const seq1 = document.getElementById('seq1').value;
        const seq2 = document.getElementById('seq2').value;
        const temp = document.getElementById('temp').value;
        console.log('Input values:', { seq1, seq2, temp });
        
        try {
            const response = await fetch('/api/fold', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ seq1, seq2, temp }),
            });
            
            if (!response.ok) throw new Error('Folding failed');
            
            const data = await response.json();
            console.log('Raw response data:', data);
            
            // Create structure data with strand information
            const structureData = {
                ...data,
                strand: Array(data.sequence.length).fill(1).map((_, i) => 
                    i < seq1.length ? 1 : 2  // First part is strand 1, second part is strand 2
                ),
                sequence2: seq2
            };
            
            console.log('Enhanced structure data with strand info:', structureData);
            displayStructure(structureData);
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Error: ' + error.message);
        }
    });
});

function displayStructure(structureData) {
    console.log('=== Starting displayStructure ===');
    console.log('Structure data:', structureData);
    console.log('Strand information:', structureData.strand);
    console.log('Second sequence:', structureData.sequence2);
    
    if (typeof fornac === 'undefined' || typeof fornac.FornaContainer === 'undefined') {
        console.error('Fornac library not loaded properly');
        const container = document.getElementById('structure-container');
        if (container) {
            container.innerHTML = '<div class="error">Error: Fornac library failed to load properly</div>';
        }
        return;
    }
    
    const container = document.getElementById('structure-container');
    if (!container) {
        console.error('Container not found');
        return;
    }
    
    // Clear previous content
    container.innerHTML = '';
    
    try {
        // Create container with better default settings
        const options = {
            width: 800,
            height: 400,
            animation: true,
            zoomable: true,
            labelInterval: 10,
            layout: 'naview'
        };
        
        console.log('Creating FornaContainer with options:', options);
        
        // Create new container instance
        const rnaContainer = new fornac.FornaContainer(
            '#structure-container', 
            options
        );
        
        const rnaOptions = {
            sequence: structureData.sequence,
            structure: structureData.structure,
            sequence2: structureData.sequence2,
            strand: structureData.strand,
            name: 'RNA Structure'
        };
        
        console.log('Adding RNA with options:', rnaOptions);
        rnaContainer.addRNA(structureData.structure, rnaOptions);
        
        // Get the RNA object using the first key
        const rnaKeys = Object.keys(rnaContainer.rnas);
        console.log('RNA keys:', rnaKeys);
        
        if (rnaKeys.length > 0) {
            const rna = rnaContainer.rnas[rnaKeys[0]];
            console.log('RNA object:', rna);
            
            // Create custom colors text in the format "1:color 2:color ..."
            const colorPairs = structureData.strand.map((strand, i) => 
                `${i + 1}:${strand === 1 ? '#FF9999' : '#99FF99'}`
            );
            const colorText = colorPairs.join(' ');
            
            console.log('Color text:', colorText);
            
            console.log('Container state before colors:', {
                colorScheme: rnaContainer.colorScheme,
                customColors: rnaContainer.customColors
            });
            
            // Add custom colors using the text format
            console.log('Adding custom colors...');
            rnaContainer.addCustomColorsText(colorText);
            
            console.log('Container state after adding colors:', {
                colorScheme: rnaContainer.colorScheme,
                customColors: rnaContainer.customColors
            });
            
            // Force custom color scheme
            console.log('Setting color scheme to custom...');
            rnaContainer.changeColorScheme('custom');
            
            console.log('Final container state:', {
                colorScheme: rnaContainer.colorScheme,
                customColors: rnaContainer.customColors
            });
            
            // Force update
            rnaContainer.update();
        }
        
        console.log('Structure display completed successfully');
        
    } catch (error) {
        console.error('Fornac error:', error);
        console.error('Structure data that caused error:', structureData);
        container.innerHTML = `
            <div class="error">
                Error displaying structure: ${error.message}<br>
                Sequence: ${structureData.sequence}<br>
                Structure: ${structureData.structure}
            </div>`;
    }
} 