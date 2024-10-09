import React, { useState } from 'react';

const BIN_CAPACITIES = {
  A: 25, B: 10, C: 50, D: 80, E: 10, F: 10
};

const CITIES = ["SNA", "LAX", "SFO", "JFK", "ORD"];

const AircraftLoadingForm = () => {
  const [totals, setTotals] = useState({
    local: 0,
    transfer: 0,
    freight: 0,
    gateChecks: 0
  });

  const [selectedCity, setSelectedCity] = useState('');
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

  const handleInputChange = (type, value) => {
    setTotals(prev => ({ ...prev, [type]: parseInt(value) || 0 }));
  };

  const distributeBags = () => {
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
    } else if (strategy === '50/50') {
      const halfLocal = Math.ceil(totals.local / 2);
      newBins.C.count = Math.min(halfLocal, BIN_CAPACITIES.C);
      newBins.D.count = Math.min(totals.local - newBins.C.count, BIN_CAPACITIES.D);
    }

    newBins.C.city = selectedCity;
    newBins.D.city = selectedCity;
    newBins.D.isTransfer = strategy === 'SLG';

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
      return `Bin ${bin}: ${binContent.length > 0 ? binContent.join(', ') : '-'}`;
    }).join('\n');
    setOutput(newOutput);
  };


return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">700 Aircraft Loading Form</h1>
      {alert && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{alert}</AlertDescription>
        </Alert>
      )}
      <div className="relative mb-4">
        <Input
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
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCitySelect(city)}
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
      <Select onValueChange={setStrategy}>
        <SelectTrigger className="w-full mb-4">
          <SelectValue placeholder="Select loading strategy" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SLG">Standard Loading Guidelines (SLG)</SelectItem>
          <SelectItem value="50/50">50/50 Split</SelectItem>
        </SelectContent>
      </Select>
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
        <pre className="p-2 bg-gray-100 rounded whitespace-pre-wrap">
          {output}
        </pre>
      )}
    </div>
  );