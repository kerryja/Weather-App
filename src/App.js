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
    <div className="container d-flex h-100 mt-5">
      <div className="row justify-content-center text-center align-self-center">
        <h1>
          Weather in <span className="text-capitalize">{cityName}</span>,{" "}
          {location}
        </h1>
        <p>
          <img src={weatherIcon} alt="weather-icon" />
        </p>
        <p>{weatherDescription}</p>
        <p>
          {isFahrenheit ? celsiusToFahrenheit(temperature) : temperature}&deg;{" "}
          {isFahrenheit ? "F" : "C"}
        </p>
        <p>
          Feels Like:{" "}
          {isFahrenheit ? celsiusToFahrenheit(feelsLikeTemp) : temperature}&deg;{" "}
          {isFahrenheit ? "F" : "C"}
        </p>
        <button onClick={handleChangeTempMeasurement}>
          {isFahrenheit ? "Display Celsius" : " Display Fahrenheit"}
        </button>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            list="cities-list"
            value={city}
            onChange={handleCityInputChange}
          />
          <datalist id="cities-list">
            {cities.map((entry) => (
              <option value={`${entry.city}, ${entry.state}`} />
            ))}
          </datalist>
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
}

export default App;
