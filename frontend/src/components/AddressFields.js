import React, { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import { Select } from './ui';

const AddressFields = ({ register, errors, setValue, watch }) => {
  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const selectedCountry = watch('country');
  const selectedState = watch('state');

  useEffect(() => {
    if (selectedCountry) {
      const countryData = countries.find(c => c.name === selectedCountry);
      if (countryData) {
        const stateList = State.getStatesOfCountry(countryData.isoCode);
        setStates(stateList);
        setCities([]);
        setValue('state', '');
        setValue('city', '');
      }
    }
  }, [selectedCountry, countries, setValue]);

  useEffect(() => {
    if (selectedState && selectedCountry) {
      const countryData = countries.find(c => c.name === selectedCountry);
      const stateData = states.find(s => s.name === selectedState);
      if (countryData && stateData) {
        const cityList = City.getCitiesOfState(countryData.isoCode, stateData.isoCode);
        setCities(cityList);
        setValue('city', '');
      }
    }
  }, [selectedState, selectedCountry, countries, states, setValue]);

  return (
    <>
      <Select
        label="Country"
        error={errors.country?.message}
        {...register('country')}
      >
        <option value="">Select Country</option>
        {countries.map((country) => (
          <option key={country.isoCode} value={country.name}>
            {country.name}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="State / Province"
          error={errors.state?.message}
          {...register('state')}
          disabled={!selectedCountry}
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.name}>
              {state.name}
            </option>
          ))}
        </Select>

        <Select
          label="City"
          error={errors.city?.message}
          {...register('city')}
          disabled={!selectedState}
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </Select>
      </div>
    </>
  );
};

export default AddressFields;
