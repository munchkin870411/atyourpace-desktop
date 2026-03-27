"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./Weather.module.css";

type WeatherData = {
  temperature: number;
  description: string;
  icon: string;
  city: string;
  code: number;
};

// Open-Meteo WMO weather codes → description + emoji
function weatherFromCode(code: number): { description: string; icon: string } {
  if (code === 0) return { description: "Klart", icon: "☀️" };
  if (code <= 3) return { description: "Delvis molnigt", icon: "⛅" };
  if (code <= 49) return { description: "Dimma", icon: "🌫️" };
  if (code <= 59) return { description: "Duggregn", icon: "🌦️" };
  if (code <= 69) return { description: "Regn", icon: "🌧️" };
  if (code <= 79) return { description: "Snö", icon: "🌨️" };
  if (code <= 84) return { description: "Regnskurar", icon: "🌧️" };
  if (code <= 89) return { description: "Snöbyar", icon: "🌨️" };
  if (code <= 99) return { description: "Åska", icon: "⛈️" };
  return { description: "Okänt", icon: "🌡️" };
}

async function fetchCityName(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=sv`,
      { headers: { "User-Agent": "AtYourPace/1.0" } }
    );
    if (!res.ok) return "";
    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      ""
    );
  } catch {
    return "";
  }
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
  );
  if (!res.ok) throw new Error("Kunde inte hämta väder");
  const data = await res.json();

  const temp = Math.round(data.current.temperature_2m);
  const code = data.current.weather_code;
  const { description, icon } = weatherFromCode(code);
  const city = await fetchCityName(lat, lon);

  return { temperature: temp, description, icon, city, code };
}

// Weather-based activity suggestions
function getActivities(code: number, temp: number): string[] {
  // Sunny & warm (>18°C)
  if (code <= 1 && temp > 18)
    return ["🏖️ Picknick i parken", "🚴 Cykla runt stan", "🍦 Äta glass ute", "📖 Läsa i solen", "🏃 Jogga utomhus"];
  // Sunny but cold
  if (code <= 1 && temp <= 18 && temp > 5)
    return ["🚶 Promenad i friska luften", "☕ Fika på en uteservering", "📸 Fota höstlöv", "🧘 Yoga i parken", "🎧 Poddpromenad"];
  // Sunny & freezing
  if (code <= 1 && temp <= 5)
    return ["⛸️ Skridskor", "🧣 Vinterpromenad", "☕ Varm choklad hemma", "🎿 Längdskidor", "📚 Mysa med en bok"];
  // Cloudy
  if (code <= 3)
    return ["🏛️ Besök ett museum", "🎲 Brädspelskväll", "🎨 Måla eller rita", "🧑‍🍳 Baka något gott", "🎬 Filmmaraton"];
  // Fog
  if (code <= 49)
    return ["🕯️ Tända ljus hemma", "🍵 Te och en bra bok", "🎵 Lyssna på vinyl", "✍️ Skriv dagbok", "🧩 Pussel"];
  // Drizzle/light rain
  if (code <= 59)
    return ["☔ Regndans!", "🎮 Spela TV-spel", "🍜 Laga soppa", "📝 Planera veckan", "🧶 Sticka eller virka"];
  // Rain
  if (code <= 69)
    return ["🛋️ Sofflördag", "🎧 Lyssna på regnet", "🎂 Baka kanelbullar", "📺 Binge-watcha en serie", "🧘 Meditera"];
  // Snow
  if (code <= 89)
    return ["⛄ Bygg en snögubbe", "🛷 Pulka!", "🍫 Varm choklad", "❄️ Snöbollskrig", "🏔️ Snöpromenad"];
  // Thunder
  if (code <= 99)
    return ["⚡ Räkna sekunder till åskan", "🕯️ Mysbelysning", "🎬 Skräckfilm (lagom!)", "🫖 Te under filten", "📓 Skriva berättelser"];
  return ["🎯 Gör dina todos!", "☕ Ta en fika", "🎵 Lyssna på musik", "📖 Läs en bok", "🧘 Stretcha lite"];
}

// Workout suggestion based on weather
function getWorkout(code: number, temp: number): { emoji: string; title: string; desc: string } {
  // Sunny & warm
  if (code <= 1 && temp > 18)
    return { emoji: "🏃", title: "Löpning ute", desc: "Perfekt väder för ett pass i det fria!" };
  // Sunny but cool
  if (code <= 1 && temp > 5)
    return { emoji: "🚴", title: "Cykling eller löpning", desc: "Skönt väder — ta på dig ett extra lager." };
  // Sunny & freezing
  if (code <= 1)
    return { emoji: "⛷️", title: "Vintersport", desc: "Kallt men klart — skidor eller skridskor!" };
  // Cloudy
  if (code <= 3 && temp > 10)
    return { emoji: "🚶", title: "Powerwalking", desc: "Molnigt men lugnt — rask promenad gör susen." };
  if (code <= 3)
    return { emoji: "🏋️", title: "Gym eller hemmaträning", desc: "Grått ute — pumpa järn inomhus istället!" };
  // Fog
  if (code <= 49)
    return { emoji: "🧘", title: "Yoga eller stretching", desc: "Lugn dag — dimmigt ute, zen inuti." };
  // Drizzle / light rain
  if (code <= 59)
    return { emoji: "💪", title: "HIIT hemma", desc: "Lite regn stoppar inte dig — kör ett snabbt hemmapass!" };
  // Rain
  if (code <= 69)
    return { emoji: "🏊", title: "Simhall", desc: "Blött ute ändå — varför inte simma?" };
  // Snow
  if (code <= 89)
    return { emoji: "⛷️", title: "Skidor eller pulka", desc: "Snö = gratis vintersport! Kom ut och rör dig." };
  // Thunder
  if (code <= 99)
    return { emoji: "🏠", title: "Träna hemma", desc: "Stanna inne — bodyweight-pass i vardagsrummet." };
  return { emoji: "🏋️", title: "Valfri träning", desc: "Alla dagar är träningsdagar!" };
}

type LocationConsent = "granted" | "denied" | "pending";

export default function Weather() {
  const [consent, setConsent] = useState<LocationConsent>("pending");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("weather-consent");
    if (saved === "granted") {
      setConsent("granted");
    } else if (saved === "denied") {
      setConsent("denied");
    }
  }, []);

  const loadWeather = useCallback(() => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          setWeather(data);
        } catch {
          setError("Kunde inte hämta väder.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Platsbehörighet nekades.");
        setConsent("denied");
        localStorage.setItem("weather-consent", "denied");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  // Auto-fetch when consent is granted
  useEffect(() => {
    if (consent === "granted" && !weather && !loading) {
      loadWeather();
    }
  }, [consent, weather, loading, loadWeather]);

  function handleAllow() {
    localStorage.setItem("weather-consent", "granted");
    setConsent("granted");
  }

  function handleDeny() {
    localStorage.setItem("weather-consent", "denied");
    setConsent("denied");
  }

  function handleReset() {
    localStorage.removeItem("weather-consent");
    setConsent("pending");
    setWeather(null);
    setError(null);
  }

  // Pending — ask for consent
  if (consent === "pending") {
    return (
      <div className={styles.consent}>
        <p className={styles.consentText}>
          Vill du visa väder baserat på din plats?
        </p>
        <div className={styles.consentButtons}>
          <button className={styles.allowBtn} onClick={handleAllow}>
            Tillåt plats
          </button>
          <button className={styles.denyBtn} onClick={handleDeny}>
            Nej tack
          </button>
        </div>
      </div>
    );
  }

  // Denied
  if (consent === "denied") {
    return (
      <div className={styles.denied}>
        <span className={styles.deniedText}>Väder avstängt</span>
        <button className={styles.resetBtn} onClick={handleReset}>
          Aktivera
        </button>
      </div>
    );
  }

  // Loading
  if (loading || !weather) {
    return (
      <div className={styles.loading}>
        <span className={styles.spinner}>⏳</span>
        <span>Hämtar väder...</span>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className={styles.denied}>
        <span className={styles.deniedText}>{error}</span>
        <button className={styles.resetBtn} onClick={loadWeather}>
          Försök igen
        </button>
      </div>
    );
  }

  // Weather data
  const activities = getActivities(weather.code, weather.temperature);
  const workout = getWorkout(weather.code, weather.temperature);

  return (
    <div>
      <div className={styles.weatherRow}>
        <span className={styles.weatherIcon}>{weather.icon}</span>
        <div className={styles.weatherInfo}>
          <span className={styles.weatherTemp}>{weather.temperature}°C</span>
          <span className={styles.weatherDesc}>
            {weather.description}
            {weather.city ? ` — ${weather.city}` : ""}
          </span>
        </div>
      </div>
      <div className={styles.activities}>
        <span className={styles.activitiesTitle}>Perfekt väder för...</span>
        <ul className={styles.activityList}>
          {activities.map((a) => (
            <li key={a} className={styles.activityItem}>{a}</li>
          ))}
        </ul>
      </div>
      <div className={styles.workout}>
        <span className={styles.workoutEmoji}>{workout.emoji}</span>
        <div className={styles.workoutInfo}>
          <span className={styles.workoutTitle}>Dagens träning: {workout.title}</span>
          <span className={styles.workoutDesc}>{workout.desc}</span>
        </div>
      </div>
    </div>
  );
}
