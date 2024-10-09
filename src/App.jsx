import React, { useState, useEffect } from 'react';

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
    freight: 0,
    gateChecks: 0
  });

  const [selectedCity, setSelectedCity] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [strategy, setStrategy] = useState('SLG');
  const [bins, setBins] = useState({
    A: { count: 0, isTransfer: false, city: '', gateChecks: 0 },
    B: { count: 0, isTransfer: false, city: '', gateChecks: 0 },
    C: { count: 0, isTransfer: false, city: '', gateChecks: 0 },
    D: { count: 0, isTransfer: false, city: '', gateChecks: 0 },
    E: { count: 0, isTransfer: false, city: '', gateChecks: 0 },
    F: { count: 0, isTransfer: false, city: '', gateChecks: 0 }
  });

  const [output, setOutput] = useState('');
  const [alert, setAlert] = useState('');

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
    setTotals(prev => ({ ...prev, [type]: parseInt(value) || 0 }));
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setCityInput(city);
    setFilteredCities([]);
  };

  const distributeBags = () => {
    if (!selectedCity) {
      setAlert("Please select a destination city before distributing bags.");
      return;
    }

    let newBins = {
      A: { count: 0, isTransfer: false, city: '', gateChecks: 0 },
      B: { count: 0, isTransfer: false, city: '', gateChecks: 0 },
      C: { count: 0, isTransfer: false, city: '', gateChecks: 0 },
      D: { count: 0, isTransfer: false, city: '', gateChecks: 0 },
      E: { count: 0, isTransfer: false, city: '', gateChecks: 0 },
      F: { count: 0, isTransfer: false, city: '', gateChecks: 0 }
    };

    // Distribute gate checks
    let remainingGateChecks = totals.gateChecks;
    ['B', 'A', 'C', 'D', 'E', 'F'].forEach(bin => {
      if (remainingGateChecks > 0) {
        newBins[bin].gateChecks = Math.min(remainingGateChecks, BIN_CAPACITIES[bin]);
        remainingGateChecks -= newBins[bin].gateChecks;
      }
    });

    // Distribute bags based on strategy
    if (strategy === 'SLG') {
      newBins.C.count = Math.min(totals.local, BIN_CAPACITIES.C);
      newBins.D.count = Math.min(totals.transfer, BIN_CAPACITIES.D);
      newBins.D.isTransfer = true;
    } else if (strategy === '50/50') {
      const halfLocal = Math.ceil(totals.local / 2);
      newBins.C.count = Math.min(halfLocal, BIN_CAPACITIES.C);
      newBins.D.count = Math.min(totals.local - newBins.C.count, BIN_CAPACITIES.D);
    }

    newBins.C.city = selectedCity;
    newBins.D.city = selectedCity;

    // Distribute freight (no capacity limit)
    let remainingFreight = totals.freight;
    ['D', 'C', 'E', 'F', 'A', 'B'].forEach(bin => {
      if (remainingFreight > 0) {
        newBins[bin].freight = remainingFreight;
        remainingFreight = 0;
      }
    });

    setBins(newBins);
    generateOutput(newBins);
  };

  const generateOutput = (currentBins) => {
    let newOutput = Object.entries(currentBins).map(([bin, content]) => {
      let binContent = [];
      if (content.count > 0) {
        binContent.push(`${content.count} ${content.isTransfer ? 'X' : ''} ${content.city}`);
      }
      if (content.gateChecks > 0) {
        binContent.push(`${content.gateChecks} GC`);
      }
      if (content.freight > 0) {
        binContent.push(`${content.freight} F`);
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
        {content.freight > 0 && <p>{content.freight} F</p>}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">700 Aircraft Loading Form</h1>
      {alert && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{alert}</span>
        </div>
      )}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Type to search for a city"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
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
        <input
          type="number"
          placeholder="Freight (F)"
          className="p-2 border rounded"
          onChange={(e) => handleInputChange('freight', e.target.value)}
        />
        <input
          type="number"
          placeholder="Gate Checks (GC)"
          className="p-2 border rounded"
          onChange={(e) => handleInputChange('gateChecks', e.target.value)}
        />
      </div>
      <select 
        onChange={(e) => setStrategy(e.target.value)} 
        className="w-full p-2 border rounded mb-4"
        value={strategy}
      >
        <option value="">Select loading strategy</option>
        <option value="SLG">Standard Loading Guidelines (SLG)</option>
        <option value="50/50">50/50 Split</option>
      </select>
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