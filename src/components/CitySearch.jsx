import { useState, useEffect } from 'react';
import { CITIES } from './constants/constants';

const CitySearch = ({ selectedCity, setSelectedCity, cityInput, setCityInput }) => {
    const [filteredCities, setFilteredCities] = useState([]);
  
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
  
    const handleCityInputChange = (e) => {
      setCityInput(e.target.value);
    };
  
    const handleCitySelect = (city) => {
      setSelectedCity(city);
      setCityInput(city);
      setFilteredCities([]);
    };
  
    const handleCityInputKeyDown = (e) => {
      if (e.key === 'Enter' && filteredCities.length > 0) {
        handleCitySelect(filteredCities[0]);
      }
    };
  
    return (
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
    );
  };
  
  export default CitySearch;