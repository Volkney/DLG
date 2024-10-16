import { useState, useEffect } from 'react';

const BIN_CAPACITIES = {
  A: 25, B: 10, C: 50, D: 80, E: 10, F: 10
};

const CITIES = [
  "ABQ", "ALB", "AMA", "ATL", "AUA", "AUS", "BDL", "BHM", "BNA", "BOI", "BOS", "BUF", "BUR", "BWI", "BZE", "BZN",
  "CHS", "CLE", "CLT", "CMH", "COS", "CRP", "CUN", "CVG", "DAL", "DCA", "DEN", "DSM", "DTW", "ECP", "ELP", "EUG",
  "FAT", "FLL", "GCM", "GEG", "GRR", "GSP", "HAV", "HDN", "HNL", "HOU", "HRL", "IAD", "ICT", "IND", "ISP", "ITO",
  "JAN", "JAX", "KOA", "LAS", "LAX", "LIH", "LBB", "LGA", "LGB", "LIR", "LIT", "MAF", "MBJ", "MCI", "MCO", "MDW",
  "MEM", "MHT", "MIA", "MKE", "MSP", "MSY", "MTJ", "MYR", "NAS", "OAK", "OGG", "OKC", "OMA", "ONT", "ORD", "ORF",
  "PBI", "PDX", "PHL", "PHX", "PIT", "PLS", "PNS", "PSP", "PUJ", "PVD", "PVR", "PWM", "RDU", "RIC", "RNO", "ROC",
  "RSW", "SAN", "SAT", "SAV", "SBA", "SDF", "SEA", "SFO", "SJC", "SJD", "SJO", "SJU", "SLC", "SMF", "SNA", "SRQ",
  "STL", "TPA", "TUL", "TUS", "VPS"
];

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
    A: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: 0 },
    B: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: 0 },
    C: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: 0 },
    D: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: 0 },
    E: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: 0 },
    F: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: 0 }
  });

  const [output, setOutput] = useState('');
  const [alert, setAlert] = useState('');
  const [warning, setWarning] = useState('');
  const [freightInput, setFreightInput] = useState('');

  useEffect(() => {
    if (cityInput) {
      const filtered = CITIES.filter(city =>
        city.toLowerCase().includes(cityInput.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [cityInput]);



  const handleInputChange = (type, value) => {
    if (type === 'freight') {
      setFreightInput(value);
    } else {
      setTotals(prev => ({ ...prev, [type]: parseInt(value) || 0 }));
    }
  };
  

  const handleCityInputChange = (e) => {
    setCityInput(e.target.value);
  };


  const handleCityInputKeyDown = (e) => {
    if (e.key === 'Enter' && filteredCities.length > 0) {
      handleCitySelect(filteredCities[0]);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setCityInput(city);
    setFilteredCities([]);
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
      A: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: [] },
      B: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: [] },
      C: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: [] },
      D: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: [] },
      E: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: [] },
      F: { count: 0, isTransfer: false, city: '', gateChecks: 0, freight: [] }
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
          newBins[bin].count = Math.min(remainingLocal, BIN_CAPACITIES[bin]);
          remainingLocal -= newBins[bin].count;
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
          newBins[bin].count = Math.min(remainingTransfer, BIN_CAPACITIES[bin]);
          newBins[bin].isTransfer = true;
          remainingTransfer -= newBins[bin].count;
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
      newBins.C.count = Math.min(halfLocal, BIN_CAPACITIES.C);
      remainingLocal -= newBins.C.count;
      
      newBins.D.count = Math.min(remainingLocal, BIN_CAPACITIES.D);
      remainingLocal -= newBins.D.count;
  
      // Add transfer bags to bin D if there's space, keeping them separate
      if (remainingTransfer > 0) {
        const availableSpaceInD = BIN_CAPACITIES.D - newBins.D.count;
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
  
    // Set city for all bins that have bags
    Object.keys(newBins).forEach(bin => {
      if (newBins[bin].count > 0 || (bin === 'D' && newBins[bin].transferCount > 0)) {
        newBins[bin].city = selectedCity;
      }
    });
  
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
    let newOutput = Object.entries(currentBins).map(([bin, content]) => {
      let binContent = [];
      if (content.count > 0) {
        binContent.push(`${content.city} ${content.count}${content.isTransfer ? ' X' : ''}`);
      }
      if (content.transferCount && content.transferCount > 0) {
        binContent.push(`${content.city} X ${content.transferCount}`);
      }
      if (content.gateChecks > 0) {
        binContent.push(`GC ${content.gateChecks}`);
      }
      if (content.freight && content.freight.length > 0) {
        content.freight.forEach(f => {
          if (f.pieces > 0) {
            binContent.push(`F ${f.pieces}/${f.weight}`);
          }
        });
      }
      return `Bin ${bin}: ${binContent.length > 0 ? binContent.join(', ') : '-'}`;
    }).join('\n');
    setOutput(newOutput);
  };

  const renderBinContents = (bin, content) => {
    return (
      <div>
        <p>{content.count > 0 ? `${content.count} ${content.isTransfer ? 'X' : ''} ${content.city}` : '-'}</p>
        {content.gateChecks > 0 && <p>{content.gateChecks} GC</p>}
        {content.freight && (
          Array.isArray(content.freight) 
            ? content.freight.map((f, index) => 
                f.pieces > 0 && <p key={index}>F {f.pieces}/{f.weight}</p>
              )
            : content.freight.pieces > 0 && <p>F {content.freight.pieces}/{content.freight.weight}</p>
        )}
      </div>
    );
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
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Type to search for a city"
          value={cityInput}
          onChange={handleCityInputChange}
          onKeyDown={handleCityInputKeyDown}
          className="w-full p-2 border rounded"
        />
        {filteredCities.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto">
            {filteredCities.map((city) => (
              <li
                key={city}
                onClick={() => handleCitySelect(city)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {city}
              </li>
            ))}
          </ul>
        )}
      </div>
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
      <div className="grid grid-cols-3 gap-4 mb-4">
        {Object.entries(bins).map(([bin, content]) => (
          <div key={bin} className="border p-2 rounded">
            <h3 className="font-bold mb-2">Bin {bin}</h3>
            {renderBinContents(bin, content)}
          </div>
        ))}
      </div>
      {output && (
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
          {output}
        </pre>
      )}
    </div>
  );
};

export default AircraftLoadingForm;