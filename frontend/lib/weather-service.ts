interface WeatherData {
  location: string
  temperature: number
  humidity: number
  description: string
  windSpeed: number
  pressure: number
  visibility: number
  uvIndex?: number
  rainfall?: number
  forecast?: {
    date: string
    temp_max: number
    temp_min: number
    description: string
    humidity: number
    rainfall: number
  }[]
}

interface WeatherResponse {
  success: boolean
  data?: WeatherData
  error?: string
}

export class WeatherService {
  private static readonly API_KEY = process.env.OPENWEATHER_API_KEY
  private static readonly BASE_URL = "https://api.openweathermap.org/data/2.5"

  static async getCurrentWeather(location: string): Promise<WeatherResponse> {
    if (!this.API_KEY) {
      return { success: false, error: "Weather API key not configured" }
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${this.API_KEY}&units=metric`,
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()

      const weatherData: WeatherData = {
        location: `${data.name}, ${data.sys.country}`,
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // Convert to km
        uvIndex: data.uvi,
        rainfall: data.rain?.["1h"] || 0,
      }

      return { success: true, data: weatherData }
    } catch (error) {
      console.error("Weather API Error:", error)
      return { success: false, error: "Failed to fetch weather data" }
    }
  }

  static async getForecast(location: string): Promise<WeatherResponse> {
    if (!this.API_KEY) {
      return { success: false, error: "Weather API key not configured" }
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/forecast?q=${encodeURIComponent(location)}&appid=${this.API_KEY}&units=metric&cnt=5`,
      )

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`)
      }

      const data = await response.json()

      const forecast = data.list.map((item: any) => ({
        date: new Date(item.dt * 1000).toLocaleDateString(),
        temp_max: Math.round(item.main.temp_max),
        temp_min: Math.round(item.main.temp_min),
        description: item.weather[0].description,
        humidity: item.main.humidity,
        rainfall: item.rain?.["3h"] || 0,
      }))

      const weatherData: WeatherData = {
        location: `${data.city.name}, ${data.city.country}`,
        temperature: Math.round(data.list[0].main.temp),
        humidity: data.list[0].main.humidity,
        description: data.list[0].weather[0].description,
        windSpeed: data.list[0].wind.speed,
        pressure: data.list[0].main.pressure,
        visibility: 10, // Default visibility
        forecast,
      }

      return { success: true, data: weatherData }
    } catch (error) {
      console.error("Forecast API Error:", error)
      return { success: false, error: "Failed to fetch forecast data" }
    }
  }

  static formatWeatherForAI(weather: WeatherData, language: string): string {
    const translations = {
      en: {
        current: "Current Weather",
        location: "Location",
        temperature: "Temperature",
        humidity: "Humidity",
        conditions: "Conditions",
        wind: "Wind Speed",
        pressure: "Pressure",
        visibility: "Visibility",
        rainfall: "Rainfall",
        forecast: "5-Day Forecast",
      },
      hi: {
        current: "वर्तमान मौसम",
        location: "स्थान",
        temperature: "तापमान",
        humidity: "आर्द्रता",
        conditions: "स्थितियां",
        wind: "हवा की गति",
        pressure: "दबाव",
        visibility: "दृश्यता",
        rainfall: "वर्षा",
        forecast: "5-दिन का पूर्वानुमान",
      },
      kn: {
        current: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ",
        location: "ಸ್ಥಳ",
        temperature: "ತಾಪಮಾನ",
        humidity: "ಆರ್ದ್ರತೆ",
        conditions: "ಪರಿಸ್ಥಿತಿಗಳು",
        wind: "ಗಾಳಿಯ ವೇಗ",
        pressure: "ಒತ್ತಡ",
        visibility: "ಗೋಚರತೆ",
        rainfall: "ಮಳೆ",
        forecast: "5-ದಿನಗಳ ಮುನ್ಸೂಚನೆ",
      },
      ml: {
        current: "നിലവിലെ കാലാവസ്ഥ",
        location: "സ്ഥലം",
        temperature: "താപനില",
        humidity: "ഈർപ്പം",
        conditions: "അവസ്ഥകൾ",
        wind: "കാറ്റിന്റെ വേഗത",
        pressure: "മർദ്ദം",
        visibility: "ദൃശ്യത",
        rainfall: "മഴ",
        forecast: "5-ദിവസത്തെ പ്രവചനം",
      },
    }

    const t = translations[language as keyof typeof translations] || translations.en

    let formatted = `${t.current}:\n`
    formatted += `${t.location}: ${weather.location}\n`
    formatted += `${t.temperature}: ${weather.temperature}°C\n`
    formatted += `${t.humidity}: ${weather.humidity}%\n`
    formatted += `${t.conditions}: ${weather.description}\n`
    formatted += `${t.wind}: ${weather.windSpeed} m/s\n`
    formatted += `${t.pressure}: ${weather.pressure} hPa\n`
    formatted += `${t.visibility}: ${weather.visibility} km\n`
    if (weather.rainfall) {
      formatted += `${t.rainfall}: ${weather.rainfall} mm\n`
    }

    if (weather.forecast && weather.forecast.length > 0) {
      formatted += `\n${t.forecast}:\n`
      weather.forecast.forEach((day) => {
        formatted += `${day.date}: ${day.temp_min}-${day.temp_max}°C, ${day.description}, ${t.humidity}: ${day.humidity}%\n`
      })
    }

    return formatted
  }
}
