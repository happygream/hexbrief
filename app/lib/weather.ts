export interface WeatherData {
  temp: number;
  feels_like: number;
  description: string;
  weatherCode: number;
  city: string;
  country: string;
  humidity: number;
  wind: number;
  pressure: number;
  visibility: number;
}

interface LocationData {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

async function getLocation(): Promise<LocationData> {
  try {
    const res = await fetch('https://ip-api.com/json/?fields=city,country,lat,lon');
    if (!res.ok) throw new Error('Location failed');
    const d = await res.json();
    return { city: d.city || 'Unknown', country: d.country || '', lat: d.lat, lon: d.lon };
  } catch {
    return { city: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 };
  }
}

export async function fetchWeather(cityOverride?: string): Promise<WeatherData> {
  const loc = await getLocation();

  // If user has set a city, geocode it via Open-Meteo geocoding API
  let lat = loc.lat;
  let lon = loc.lon;
  let city = loc.city;
  let country = loc.country;

  if (cityOverride && cityOverride.trim()) {
    try {
      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityOverride)}&count=1`
      );
      const gd = await geo.json();
      if (gd.results?.[0]) {
        lat = gd.results[0].latitude;
        lon = gd.results[0].longitude;
        city = gd.results[0].name;
        country = gd.results[0].country || '';
      }
    } catch {}
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code&wind_speed_unit=ms`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  const d = await res.json();
  const c = d.current;

  return {
    temp: Math.round(c.temperature_2m),
    feels_like: Math.round(c.apparent_temperature),
    description: weatherDescription(c.weather_code),
    weatherCode: c.weather_code,
    city,
    country,
    humidity: c.relative_humidity_2m,
    wind: Math.round(c.wind_speed_10m),
    pressure: Math.round(c.surface_pressure),
    visibility: 10,
  };
}

function weatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}
