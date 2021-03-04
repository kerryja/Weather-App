import React, { useState, useEffect } from "react";
import geolocation from "./geolocation";

function App() {
  const [temperature, setTemperature] = useState();
  const [isFahrenheit, setFahrenheit] = useState(true);
  const [cityName, setCityName] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [feelsLikeTemp, setFeelsLikeTemp] = useState();
  const [weatherIcon, setWeatherIcon] = useState("");
  const [weatherDescription, setWeatherDescription] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    callAPI();
  };

  const handleCityInputChange = (e) => {
    setCity(e.target.value);
    console.log(city);
  };

  const geocode = async (city) => {
    try {
      const response = await fetch(
        `https://geocode.xyz/${encodeURIComponent(city)}?json=1`
      );
      const responseJSON = await response.json();
      return { latitude: responseJSON.latt, longitude: responseJSON.longt };
    } catch (error) {
      console.log(error);
    }
  };

  const reverseGeocode = async (coords) => {
    try {
      const formData = new FormData();
      formData.append("auth", GEOCODE_API_KEY);
      formData.append("locate", coords);
      formData.append("json", 1);

      const response = await fetch(`https://geocode.xyz`, {
        method: "POST",
        body: formData,
      });
      const responseJSON = await response.json();
      console.log(responseJSON);
      return {
        city: responseJSON.city,
        location:
          responseJSON.country === "United States of America"
            ? responseJSON.state
            : responseJSON.country,
      };
    } catch (error) {
      console.log(error);
    }
  };

  const callAPI = async () => {
    try {
      const coords = city ? await geocode(city) : await geolocation();
      const locationInformation = await reverseGeocode(
        `${coords.latitude},${coords.longitude}`
      );

      const response = await fetch(
        `https://weather-proxy.freecodecamp.rocks/api/current?lat=${coords.latitude}&lon=${coords.longitude}`
      );
      const responseJSON = await response.json();
      setCityName(locationInformation.city);
      setLocation(locationInformation.location);
      setTemperature(Math.floor(responseJSON.main.temp));
      setFeelsLikeTemp(Math.floor(responseJSON.main.feels_like));
      setWeatherIcon(responseJSON.weather[0].icon);
      setWeatherDescription(responseJSON.weather[0].main);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <p id="city">
        Weather in {cityName}, {location}
      </p>
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
        <input type="text" value={city} onChange={handleCityInputChange} />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default App;
