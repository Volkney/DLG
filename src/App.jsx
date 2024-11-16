import { useState, useEffect } from 'react';
import DraggableBinLayout from './components/DraggableBinLayout'
import { BIN_CAPACITIES } from './components/constants/constants'
import CitySearch from './components/citySearch.jsx';

const AircraftLoadingForm = () => {
  const [totals, setTotals] = useState({
    local: 0,
    transfer: 0,
    freight: [],  // Changed to an array to store multiple freight entries
    gateChecks: 0
  });

  const [selectedCity, setSelectedCity] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [strategy, setStrategy] = useState('SLG');
  const [isReversed, setIsReversed] = useState(false);
  const [bins, setBins] = useState({
    A: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] },
    B: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] },
    C: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] },
    D: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] },
    E: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] },
    F: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] }
  });

  const [output, setOutput] = useState('');
  const [alert, setAlert] = useState('');
  const [warning, setWarning] = useState('');
  const [freightInput, setFreightInput] = useState('');
  
  // new section

  const handleBinContentMove = (fromBinId, toBinId, content) => {
    setBins((prevBins) => {
      const newBins = { ...prevBins };
  
      // Handle gate checks (GC)
      if (content.includes('GC')) {
        const gcCount = parseInt(content.split(' ')[1]);
        newBins[fromBinId].gateChecks -= gcCount;
        newBins[toBinId].gateChecks += gcCount;
  
      // Handle freight (F)
      } else if (content.includes('F')) {
        const [_, pieces, weight] = content.match(/F (\d+)\/(\d+)/);
        const freightItem = { pieces: parseInt(pieces), weight: parseInt(weight) };
  
        // Remove freight from source bin
        newBins[fromBinId].freight = newBins[fromBinId].freight.filter(
          (f) => f.pieces !== freightItem.pieces || f.weight !== freightItem.weight
        );
  
        // Add freight to target bin
        newBins[toBinId].freight.push(freightItem);
  
      // Handle transfer bags (new format: "{city} X {count}")
      } else if (content.includes('X')) {
        const parts = content.trim().split(' ');
        const city = parts[0];
        const bagCount = parseInt(parts[2]); // Get the number after 'X'
  
        // Remove bags from source bin
        newBins[fromBinId].transferCount -= bagCount;
        if (newBins[fromBinId].localCount === 0 && newBins[fromBinId].transferCount === 0) {
          newBins[fromBinId].city = '';
        }
  
        // Add bags to target bin
        newBins[toBinId].transferCount += bagCount;
        newBins[toBinId].city = city;
  
      // Handle local bags (format: "{city} {count}")
      } else if (content !== '-') {
        const parts = content.trim().split(' ');
        const city = parts[0];
        const bagCount = parseInt(parts[1]);
  
        // Remove bags from source bin
        newBins[fromBinId].localCount -= bagCount;
        if (newBins[fromBinId].localCount === 0 && newBins[fromBinId].transferCount === 0) {
          newBins[fromBinId].city = '';
        }
  
        // Add bags to target bin
        newBins[toBinId].localCount += bagCount;
        newBins[toBinId].city = city;
      }
  
      // Clean up empty bins
      Object.keys(newBins).forEach((bin) => {
        if (newBins[bin].localCount === 0 && newBins[bin].transferCount === 0) {
          newBins[bin].city = '';
        }
      });
  
      // Generate updated output after moving the content
      generateOutput(newBins);
      return newBins;
    });
  };
  
  // new section

  // new section

  const handleInputChange = (type, value) => {
    if (type === 'freight') {
      setFreightInput(value);
    } else {
      setTotals(prev => ({ ...prev, [type]: parseInt(value) || 0 }));
    }
  };

  const reverseCurrentDistribution = () => {
    setBins(prevBins => {
      const newBins = { ...prevBins };
      // Swap C and D contents
      [newBins.C, newBins.D] = [newBins.D, newBins.C];
      // Reverse gate checks
      const gateCheckOrder = ['B', 'A', 'C', 'D', 'E', 'F'];
      const reversedGateChecks = gateCheckOrder.map(bin => newBins[bin].gateChecks).reverse();
      gateCheckOrder.forEach((bin, index) => {
        newBins[bin].gateChecks = reversedGateChecks[index];
      });
      // Reverse freight
      const freightOrder = ['D', 'C', 'E', 'F', 'A', 'B'];
      const reversedFreight = freightOrder.map(bin => newBins[bin].freight).reverse();
      freightOrder.forEach((bin, index) => {
        newBins[bin].freight = reversedFreight[index];
      });
      generateOutput(newBins);
      return newBins;
    });
  };

  const handleReverseToggle = (e) => {
    setIsReversed(e.target.checked);
    reverseCurrentDistribution();
  };


const distributeBags = () => {
  if (!selectedCity) {
    setAlert("Please select a destination city before distributing bags");
    return;
  }

  setWarning(''); // Clear any previous warnings

  let newBins = {
    A: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] },
    B: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] },
    C: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] },
    D: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] },
    E: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] },
    F: { localCount: 0, transferCount: 0, city: '', gateChecks: 0, freight: [] }
  };

  // Distribute gate checks
  let remainingGateChecks = totals.gateChecks;
  const gateCheckOrder = ['B', 'A', 'C', 'D', 'E', 'F'];
  gateCheckOrder.forEach(bin => {
    if (remainingGateChecks > 0) {
      newBins[bin].gateChecks = Math.min(remainingGateChecks, BIN_CAPACITIES[bin]);
      remainingGateChecks -= newBins[bin].gateChecks;
    }
  });

  // Distribute bags based on strategy
  if (strategy === 'SLG') {
    // Distribute local bags to forward bins (C, A, B)
    let remainingLocal = totals.local;
    const localBinOrder = ['C', 'A', 'B'];
    localBinOrder.forEach(bin => {
      if (remainingLocal > 0) {
        newBins[bin].localCount = Math.min(remainingLocal, BIN_CAPACITIES[bin]);
        newBins[bin].city = selectedCity;
        remainingLocal -= newBins[bin].localCount;
      }
    });

    // Check if there are still remaining local bags
    if (remainingLocal > 0) {
      setWarning(prev => prev + `Warning: ${remainingLocal} local bags could not be accommodated in forward bins.\n`);
    }

    // Distribute transfer bags to aft bins (D, E, F)
    let remainingTransfer = totals.transfer;
    const transferBinOrder = ['D', 'E', 'F'];
    transferBinOrder.forEach(bin => {
      if (remainingTransfer > 0) {
        newBins[bin].transferCount = Math.min(remainingTransfer, BIN_CAPACITIES[bin]);
        newBins[bin].city = selectedCity;
        remainingTransfer -= newBins[bin].transferCount;
      }
    });

    // Check if there are still remaining transfer bags
    if (remainingTransfer > 0) {
      setWarning(prev => prev + `Warning: ${remainingTransfer} transfer bags could not be accommodated in aft bins.\n`);
    }
  } else if (strategy === '50/50') {
    let remainingLocal = totals.local;
    let remainingTransfer = totals.transfer;
    
    // Distribute local bags evenly between C and D
    const halfLocal = Math.ceil(remainingLocal / 2);
    newBins.C.localCount = Math.min(halfLocal, BIN_CAPACITIES.C);
    newBins.C.city = selectedCity;
    remainingLocal -= newBins.C.localCount;
    
    newBins.D.localCount = Math.min(remainingLocal, BIN_CAPACITIES.D);
    newBins.D.city = selectedCity;
    remainingLocal -= newBins.D.localCount;

    // Add transfer bags to bin D if there's space
    if (remainingTransfer > 0) {
      const availableSpaceInD = BIN_CAPACITIES.D - newBins.D.localCount;
      const transferToBinD = Math.min(remainingTransfer, availableSpaceInD);
      if (transferToBinD > 0) {
        newBins.D.transferCount = transferToBinD;
        remainingTransfer -= transferToBinD;
      }
    }

    // Check if there are still remaining bags
    if (remainingLocal > 0) {
      setWarning(prev => prev + `Warning: ${remainingLocal} local bags could not be accommodated.\n`);
    }
    if (remainingTransfer > 0) {
      setWarning(prev => prev + `Warning: ${remainingTransfer} transfer bags could not be accommodated.\n`);
    }
  }

  // Distribute freight (no capacity limit)
  let remainingFreight = [...totals.freight];
  const freightOrder = ['D', 'C', 'E', 'F', 'A', 'B'];
  freightOrder.forEach(bin => {
    if (remainingFreight.length > 0) {
      newBins[bin].freight.push(remainingFreight.shift());
    }
  });

  setBins(newBins);
  if (isReversed) {
    reverseCurrentDistribution();
  } else {
    generateOutput(newBins);
  }
};

const generateOutput = (currentBins) => {
  let newOutput = Object.entries(currentBins)
    .map(([bin, content]) => {
      const binContent = [];

      // Add local bags if present
      if (content.localCount > 0) {
        binContent.push(`${content.city} ${content.localCount}`);
      }

      // Add transfer bags if present
      if (content.transferCount > 0) {
        binContent.push(`${content.city} X ${content.transferCount}`);
      }

      // Add gate checks if present
      if (content.gateChecks > 0) {
        binContent.push(`GC ${content.gateChecks}`);
      }

      // Add freight if present
      if (content.freight && content.freight.length > 0) {
        content.freight.forEach(f => {
          if (f.pieces > 0) {
            binContent.push(`${content.city} F ${f.pieces}/${f.weight}`);
          }
        });
      }

      // Join the content with commas, trimming any extra spaces
      const binOutput = binContent.length > 0 ? binContent.join(', ').trim() : '-';
      return `Bin ${bin}: ${binOutput}`;
    })
    .join('\n');

  setOutput(newOutput);
};



  const addFreightEntry = () => {
    const [pieces, weight] = freightInput.split('/');
    if (pieces && weight && !isNaN(pieces) && !isNaN(weight)) {
      setTotals(prev => ({
        ...prev,
        freight: [...prev.freight, { pieces: parseInt(pieces), weight: parseInt(weight) }]
      }));
      setFreightInput('');
    } else {
      // Optionally, you can set an alert or warning here for invalid input
      console.log('Invalid freight input');
    }
  };
  
  const removeFreightEntry = (index) => {
    setTotals(prev => ({
      ...prev,
      freight: prev.freight.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">700 Aircraft Loading Form</h1>
      {alert && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{alert}</span>
        </div>
      )}
      {warning && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{warning}</span>
        </div>
      )}
      <CitySearch
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        cityInput={cityInput}
        setCityInput={setCityInput}
      />
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="number"
          placeholder="Local Bags"
          className="p-2 border rounded"
          onChange={(e) => handleInputChange('local', e.target.value)}
        />
        <input
          type="number"
          placeholder="Transfer Bags (X)"
          className="p-2 border rounded"
          onChange={(e) => handleInputChange('transfer', e.target.value)}
        />
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Freight (F) pieces/weight, e.g. 10/850"
            className="p-2 border rounded flex-grow"
            value={freightInput}
            onChange={(e) => handleInputChange('freight', e.target.value)}
          />
          <button
            onClick={addFreightEntry}
            className="ml-2 bg-blue-500 text-white p-2 rounded"
          >
            +
          </button>
        </div>
        <input
          type="number"
          placeholder="Gate Checks (GC)"
          className="p-2 border rounded"
          onChange={(e) => handleInputChange('gateChecks', e.target.value)}
        />
      </div>
      <div className="mb-4">
        {totals.freight.map((entry, index) => (
          <div key={index} className="mb-2">
            F {entry.pieces}/{entry.weight}
            {index > 0 && (
              <button
                onClick={() => removeFreightEntry(index)}
                className="ml-2 text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-4">
        <select
          onChange={(e) => setStrategy(e.target.value)}
          className="w-1/2 p-2 border rounded"
          value={strategy}
        >
          <option value="">Select loading strategy</option>
          <option value="SLG">Standard Loading Guidelines (SLG)</option>
          <option value="50/50">50/50 Split</option>
        </select>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isReversed}
            onChange={handleReverseToggle}
            className="mr-2"
          />
          Reverse
        </label>
      </div>
      <button
        onClick={distributeBags}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4"
      >
        Distribute Bags
      </button>
      
      {/* Two column layout for draggable content and output */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left column - Single column draggable content */}
        <div>
          <DraggableBinLayout
            bins={bins}
            output={output}
            onContentMove={handleBinContentMove}
          />
        </div>
        
        {/* Right column - Output */}
        {output && (
          <div className='my-6'>
            <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap my-6">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
export default AircraftLoadingForm;