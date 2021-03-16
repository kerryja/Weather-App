import React, { useState, useEffect } from "react";
import geolocation from "./geolocation";
import cities from "./cities2.json";
import "./App.css";

function App() {
  const [temperature, setTemperature] = useState();
  const [isFahrenheit, setFahrenheit] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [feelsLikeTemp, setFeelsLikeTemp] = useState();
  const [weatherIcon, setWeatherIcon] = useState("");
  const [weatherDescription, setWeatherDescription] = useState("");
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");

  const GEOCODE_API_KEY = `${process.env.REACT_APP_GEOCODE_API_KEY}`;

  useEffect(() => {
    callAPI();
  }, []);

  const celsiusToFahrenheit = (temp) => {
    return temp * 2 + 30;
  };

  const handleChangeTempMeasurement = () => {
    setFahrenheit(!isFahrenheit);
  };

  const handleLocationChange = () => {
    callAPI();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    callAPI();
  };

  const handleCityInputChange = (e) => {
    const locationInput = document.getElementById("location-input");
    setSearchInput(locationInput.value);
  };

  const geocode = async (scanText) => {
    try {
      const response = await fetch(
        `https://geocode.xyz/?scantext=${encodeURIComponent(
          scanText
        )}&json=1&region=US`
      );
      const responseJSON = await response.json();
      const bestMatch =
        responseJSON.matches * 1 > 0 ? responseJSON.match[0] : responseJSON;
      return { latitude: bestMatch.latt, longitude: bestMatch.longt };
    } catch (error) {
      console.log(error);
    }
  };

  const reverseGeocode = async (coords) => {
    try {
      const response = await fetch(
        `https://geocode.xyz/?locate=${encodeURIComponent(coords)}&json=1`
      );

      // const formData = new FormData();
      // formData.append("auth", GEOCODE_API_KEY);
      // formData.append("locate", coords);
      // formData.append("json", 1);

      // const response = await fetch(`https://geocode.xyz`, {
      //   method: "POST",
      //   formData,
      // });
      const responseJSON = await response.json();

      return {
        city: responseJSON.city,
        state: responseJSON.state,
      };
    } catch (error) {
      console.log(error);
    }
  };

  const callAPI = async () => {
    try {
      const coords = searchInput
        ? await geocode(searchInput)
        : await geolocation();
      const locationInformation = await reverseGeocode(
        `${coords.latitude},${coords.longitude}`
      );
      const response = await fetch(
        `https://weather-proxy.freecodecamp.rocks/api/current?lat=${coords.latitude}&lon=${coords.longitude}`
      );
      const responseJSON = await response.json();
      setCityName(locationInformation.city);
      setStateName(locationInformation.state);
      //comes from Free Code Camp API
      setTemperature(Math.floor(responseJSON.main.temp));
      setFeelsLikeTemp(Math.floor(responseJSON.main.feels_like));
      setWeatherIcon(responseJSON.weather[0].icon);
      setWeatherDescription(responseJSON.weather[0].main);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col text-center text-white">
          <div className="position-absolute ml-0">
            <button
              onClick={handleChangeTempMeasurement}
              className="btn btn-circle"
            >
              &deg;{isFahrenheit ? "C" : "F"}
            </button>
            <div className="mt-10">
              <button onClick={handleLocationChange} className="btn btn-circle">
                <i class="fas fa-location-arrow"></i>
              </button>
            </div>
          </div>
          <h1>
            Weather in{" "}
            <span id="location">
              <span className="text-capitalize">{cityName.toLowerCase()}</span>,{" "}
              {stateName}
            </span>
          </h1>
          <div>
            <img id="weather-icon" src={weatherIcon} alt="weather-icon" />
          </div>
          <div>
            <h4>{weatherDescription}</h4>
          </div>
          <div>
            <h4>
              {isFahrenheit ? celsiusToFahrenheit(temperature) : temperature}
              &deg; {isFahrenheit ? "F" : "C"}
            </h4>
          </div>
          <div>
            <h4>
              Feels Like:{" "}
              {isFahrenheit ? celsiusToFahrenheit(feelsLikeTemp) : temperature}
              &deg; {isFahrenheit ? "F" : "C"}
            </h4>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="mx-auto form-group w-50">
            <form onSubmit={handleSubmit} className="form-group">
              <label for="location-input" className="form-label">
                Search Another Location
              </label>
              <input
                className="form-control"
                id="location-input"
                type="text"
                list="cities-list"
                value={searchInput}
                onChange={handleCityInputChange}
                placeholder="Type to search..."
              />
              <datalist id="cities-list" className="dropdown-menu">
                {cities.map((entry) => (
                  <option value={`${entry.city}, ${entry.state}`} />
                ))}
              </datalist>
              {/* <input type="submit" value="Submit" /> */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
