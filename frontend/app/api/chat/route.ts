import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { WeatherService } from "@/lib/weather-service"
import { MarketService } from "@/lib/market-service"
import { KnowledgeBase } from "@/lib/knowledge-base"
import { SeasonalCalendar } from "@/lib/seasonal-calendar"

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: string
}

interface ChatContext {
  messages: ChatMessage[]
  language: string
  sessionId: string
}

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20
const MAX_CONTEXT_MESSAGES = 10
const MAX_TOKENS = 4000
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const sessionContexts = new Map<string, ChatContext>()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1"
  return ip
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(key)

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }

  record.count++
  return false
}

const getSystemPrompt = (language: string): string => {
  const prompts = {
    en: `You are a Digital Krishi Officer, an expert agricultural advisor with access to real-time weather, market, knowledge base, and seasonal calendar data. 

Core Capabilities:
- Provide practical, actionable farming advice
- Analyze weather patterns and their impact on crops
- Share current market prices for agricultural commodities
- Offer crop management, pest control, and soil health guidance
- Suggest sustainable farming practices
- Provide detailed agricultural knowledge
- Offer seasonal farming calendar activities

When users ask about weather, market prices, knowledge, or seasonal activities, I will provide you with current data. Use this information to give contextual, location-specific advice. Keep responses concise and farmer-friendly.`,

    hi: `आप एक डिजिटल कृषि अधिकारी हैं, जिसके पास वास्तविक समय के मौसम, बाजार, ज्ञान आधार और ऋतु कैलेंडर डेटा तक पहुंच के साथ एक विशेषज्ञ कृषि सलाहकार हैं।

मुख्य क्षमताएं:
- व्यावहारिक, कार्यान्वित कृषि सलाह प्रदान करना
- मौसम पैटर्न और फसलों पर उनके प्रभाव का विश्लेषण
- कृषि वस्तुओं के लिए वर्तमान बाजार मूल्य साझा करना
- फसल प्रबंधन, कीट नियंत्रण और मिट्टी स्वास्थ्य मार्गदर्शन
- टिकाऊ कृषि प्रथाओं का सुझाव
- विस्तृत कृषि ज्ञान प्रदान करना
- ऋतु कैलेंडर कार्यक्रमों का सुझाव

जब उपयोगकर्ता मौसम, बाजार मूल्यों, ज्ञान या ऋतु कार्यक्रमों के बारे में पूछते हैं, तो मैं आपको वर्तमान डेटा प्रदान करूंगा।`,

    kn: `ನೀವು ಡಿಜಿಟಲ್ ಕೃಷಿ ಅಧಿಕಾರಿ, ನೈಜ-ಸಮಯದ ಹವಾಮಾನ, ಮಾರುಕಟ್ಟೆ, ಜ್ಞಾನ ಆಧಾರ ಮತ್ತು ಋತು ಕैಲೆಂಡರ್ ಡೇಟಾ ಪ್ರವೇಶದೊಂದಿಗೆ ತಜ್ಞ ಕೃಷಿ ಸಲಹೆಗಾರ.

ಮುಖ್ಯ ಸಾಮರ್ಥ್ಯಗಳು:
- ಪ್ರಾಯೋಗಿಕವುಂಟೆ, ಕಾರ್ಯಗತಗೊಳಿಸಬಹುದಾದ ಕೃಷಿ ಸಲಹೆ ನೀಡುವುದು
- ಹವಾಮಾನ ಮಾದರಿಗಳು ಮತ್ತು ಬೆಳೆಗಳ ಮೇಲೆ ಅವುಗಳ ಪ್ರಭಾವವನ್ನು ವಿಶ್ಲೇಷಿಸುವುದು
- ಕೃಷಿ ಸರಕುಗಳಿಗೆ ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವುದು`,

    ml: `നിങ്ങൾ ഒരു ഡിജിറ്റൽ കൃഷി ഓഫീസറാണ്, തത്സമയ കാലാവസ്ഥയും മാർക്കറ്റ് ഡാറ്റയും ജ്ഞാന ആശയം മാത്രയും സീസൺ കാലം കാലാവസ്ഥയും ആക്സസ് ചെയ്യാൻ കഴിയുന്ന ഒരു വിദഗ്ധ കാർഷിക ഉപദേശകൻ.

പ്രധാന കഴിവുകൾ:
- പ്രായോഗികവും നടപ്പിലാക്കാവുന്നതുമായ കാർഷിക ഉപദേശം നൽകുക
- കാലാവസ്ഥാ രീതികളും വിളകളിൽ അവയുടെ സ്വാധീനവും വിശകലനം ചെയ്യുക
- കാർഷിക ചരക്കുകളുടെ നിലവിലെ വിപണി വിലകൾ പങ്കിടുക`,
  }
  return prompts[language as keyof typeof prompts] || prompts.en
}

const getOrCreateContext = (sessionId: string, language: string): ChatContext => {
  if (!sessionContexts.has(sessionId)) {
    sessionContexts.set(sessionId, {
      messages: [{ role: "system", content: getSystemPrompt(language) }],
      language,
      sessionId,
    })
  }
  return sessionContexts.get(sessionId)!
}

const addMessageToContext = (sessionId: string, message: ChatMessage): void => {
  const context = sessionContexts.get(sessionId)
  if (context) {
    context.messages.push(message)
    if (context.messages.length > MAX_CONTEXT_MESSAGES) {
      const systemMessage = context.messages[0]
      const recentMessages = context.messages.slice(-MAX_CONTEXT_MESSAGES + 1)
      context.messages = [systemMessage, ...recentMessages]
    }
  }
}

const callLLM = async (
  messages: ChatMessage[],
  language: string,
  weatherData?: string,
  marketData?: string,
  knowledgeData?: string,
  seasonalData?: string,
): Promise<string> => {
  try {
    // Convert messages to Gemini format
    const prompt = messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n")

    const systemPrompt = messages.find((m) => m.role === "system")?.content || ""

    let contextualPrompt = `${systemPrompt}\n\n`

    if (weatherData) {
      contextualPrompt += `CURRENT WEATHER DATA:\n${weatherData}\n\n`
    }

    if (marketData) {
      contextualPrompt += `CURRENT MARKET PRICES:\n${marketData}\n\n`
    }

    if (knowledgeData) {
      contextualPrompt += `RELEVANT AGRICULTURAL KNOWLEDGE:\n${knowledgeData}\n\n`
    }

    if (seasonalData) {
      contextualPrompt += `SEASONAL FARMING CALENDAR:\n${seasonalData}\n\n`
    }

    contextualPrompt += `INSTRUCTIONS: Use the provided data to give specific, actionable advice. Reference the data sources when relevant. Keep responses practical and farmer-friendly.\n\n`
    contextualPrompt += `${prompt}\n\nassistant:`

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent(contextualPrompt)
    return result.response.text()
  } catch (error) {
    console.error("Gemini API Error:", error)
    throw new Error("Failed to get response from Gemini AI")
  }
}

const detectDataNeeds = (
  message: string,
): {
  needsWeather: boolean
  needsMarket: boolean
  needsKnowledge: boolean
  needsSeasonal: boolean
  location?: string
  commodity?: string
  knowledgeQuery?: string
} => {
  const lowerMessage = message.toLowerCase()

  // Weather keywords
  const weatherKeywords = [
    "weather",
    "rain",
    "temperature",
    "humidity",
    "forecast",
    "climate",
    "मौसम",
    "बारिश",
    "तापमान",
    "हवಾಮಾನ",
    "ಮಳೆ",
    "കಾಲಾವಸ್ಥ",
    "ಮഴ",
  ]
  const needsWeather = weatherKeywords.some((keyword) => lowerMessage.includes(keyword))

  // Market keywords
  const marketKeywords = [
    "price",
    "market",
    "sell",
    "buy",
    "cost",
    "rate",
    "mandi",
    "बाजार",
    "मूल्य",
    "दाम",
    "ಮಾರುಕಟ್ಟೆ",
    "ಬೆಲೆ",
    "വിപണി",
    "വില",
  ]
  const needsMarket = marketKeywords.some((keyword) => lowerMessage.includes(keyword))

  // Knowledge keywords
  const knowledgeKeywords = [
    "how to",
    "cultivation",
    "farming",
    "pest",
    "disease",
    "fertilizer",
    "soil",
    "crop",
    "खेती",
    "कृषि",
    "फसल",
    "ಕೃಷಿ",
    "ಬೆಳೆ",
    "കൃഷി",
    "വിള",
  ]
  const needsKnowledge = knowledgeKeywords.some((keyword) => lowerMessage.includes(keyword))

  // Seasonal keywords
  const seasonalKeywords = ["season", "month", "when to", "timing", "calendar", "मौसम", "समय", "ಋತು", "സീസൺ"]
  const needsSeasonal = seasonalKeywords.some((keyword) => lowerMessage.includes(keyword))

  // Extract location (simple pattern matching)
  const locationMatch = message.match(/(?:in|at|near|from)\s+([A-Za-z\s]+?)(?:\s|$|,|\?)/i)
  const location = locationMatch ? locationMatch[1].trim() : undefined

  // Extract commodity
  const commodities = MarketService.getPopularCommodities()
  const commodity = commodities.find((c) => lowerMessage.includes(c.toLowerCase()))

  // Extract knowledge query (use the original message for better context)
  const knowledgeQuery = needsKnowledge ? message : undefined

  return {
    needsWeather,
    needsMarket,
    needsKnowledge,
    needsSeasonal,
    location,
    commodity,
    knowledgeQuery,
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request)
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const body = await request.json()
    const { message, language = "en", image, sessionId = crypto.randomUUID() } = body

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ success: false, error: "Message too long. Maximum 2000 characters." }, { status: 400 })
    }

    const validLanguages = ["en", "hi", "kn", "ml"]
    if (language && !validLanguages.includes(language)) {
      return NextResponse.json({ success: false, error: "Invalid language" }, { status: 400 })
    }

    const context = getOrCreateContext(sessionId, language)

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }
    addMessageToContext(sessionId, userMessage)

    const dataNeeds = detectDataNeeds(message)
    let weatherData: string | undefined
    let marketData: string | undefined
    let knowledgeData: string | undefined
    let seasonalData: string | undefined

    if (dataNeeds.needsWeather && dataNeeds.location) {
      const weatherResponse = await WeatherService.getCurrentWeather(dataNeeds.location)
      if (weatherResponse.success && weatherResponse.data) {
        weatherData = WeatherService.formatWeatherForAI(weatherResponse.data, language)
      }
    }

    if (dataNeeds.needsMarket && dataNeeds.commodity) {
      const marketResponse = await MarketService.getCommodityPrices(dataNeeds.commodity, dataNeeds.location)
      if (marketResponse.success && marketResponse.data) {
        marketData = MarketService.formatMarketDataForAI(marketResponse.data, language)
      }
    }

    // Fetch knowledge base data if needed
    if (dataNeeds.needsKnowledge && dataNeeds.knowledgeQuery) {
      const knowledgeResponse = await KnowledgeBase.searchKnowledge(dataNeeds.knowledgeQuery, language)
      if (knowledgeResponse.success && knowledgeResponse.data && knowledgeResponse.data.length > 0) {
        knowledgeData = KnowledgeBase.formatKnowledgeForAI(knowledgeResponse.data, language)
      }
    }

    // Fetch seasonal data if needed
    if (dataNeeds.needsSeasonal) {
      const currentActivity = SeasonalCalendar.getCurrentMonthActivities(language)
      if (currentActivity) {
        seasonalData = SeasonalCalendar.formatSeasonalDataForAI(currentActivity, language)
      }
    }

    const llmResponse = await callLLM(context.messages, language, weatherData, marketData, knowledgeData, seasonalData)

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: llmResponse,
      timestamp: new Date().toISOString(),
    }
    addMessageToContext(sessionId, assistantMessage)

    // Image analysis code
    let imageAnalysis = null
    if (image) {
      try {
        const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const result = await visionModel.generateContent([
          "Analyze this crop/plant image and provide detailed agricultural advice in " + language,
          { inlineData: { data: image.split(",")[1], mimeType: "image/jpeg" } },
        ])
        imageAnalysis = result.response.text()
      } catch (error) {
        console.error("Gemini Vision Error:", error)
        imageAnalysis = "Image analysis temporarily unavailable. Please try again later."
      }
    }

    const response = {
      success: true,
      response: llmResponse,
      imageAnalysis,
      sessionId,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      contextLength: context.messages.length,
      dataSources: {
        weather: !!weatherData,
        market: !!marketData,
        knowledge: !!knowledgeData,
        seasonal: !!seasonalData,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again later.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
}
