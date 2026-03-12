interface MarketPrice {
  commodity: string
  variety: string
  market: string
  state: string
  minPrice: number
  maxPrice: number
  modalPrice: number
  unit: string
  date: string
}

interface MarketResponse {
  success: boolean
  data?: MarketPrice[]
  error?: string
}

export class MarketService {
  private static readonly API_BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
  private static readonly API_KEY = process.env.DATA_GOV_API_KEY

  static async getCommodityPrices(commodity: string, state?: string): Promise<MarketResponse> {
    if (!this.API_KEY) {
      return { success: false, error: "Market API key not configured" }
    }

    try {
      let url = `${this.API_BASE}?api-key=${this.API_KEY}&format=json&limit=10`

      if (commodity) {
        url += `&filters[commodity]=${encodeURIComponent(commodity)}`
      }

      if (state) {
        url += `&filters[state]=${encodeURIComponent(state)}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Market API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.records || data.records.length === 0) {
        return { success: false, error: "No market data found for the specified commodity" }
      }

      const marketPrices: MarketPrice[] = data.records.map((record: any) => ({
        commodity: record.commodity || "Unknown",
        variety: record.variety || "Common",
        market: record.market || "Unknown Market",
        state: record.state || "Unknown State",
        minPrice: Number.parseFloat(record.min_price) || 0,
        maxPrice: Number.parseFloat(record.max_price) || 0,
        modalPrice: Number.parseFloat(record.modal_price) || 0,
        unit: "per quintal",
        date: record.arrival_date || new Date().toISOString().split("T")[0],
      }))

      return { success: true, data: marketPrices }
    } catch (error) {
      console.error("Market API Error:", error)
      return { success: false, error: "Failed to fetch market data" }
    }
  }

  static formatMarketDataForAI(prices: MarketPrice[], language: string): string {
    const translations = {
      en: {
        title: "Market Prices",
        commodity: "Commodity",
        variety: "Variety",
        market: "Market",
        state: "State",
        minPrice: "Min Price",
        maxPrice: "Max Price",
        modalPrice: "Modal Price",
        date: "Date",
        unit: "per quintal",
      },
      hi: {
        title: "बाजार मूल्य",
        commodity: "वस्तु",
        variety: "किस्म",
        market: "बाजार",
        state: "राज्य",
        minPrice: "न्यूनतम मूल्य",
        maxPrice: "अधिकतम मूल्य",
        modalPrice: "मॉडल मूल्य",
        date: "दिनांक",
        unit: "प्रति क्विंटल",
      },
      kn: {
        title: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು",
        commodity: "ಸರಕು",
        variety: "ವಿಧ",
        market: "ಮಾರುಕಟ್ಟೆ",
        state: "ರಾಜ್ಯ",
        minPrice: "ಕನಿಷ್ಠ ಬೆಲೆ",
        maxPrice: "ಗರಿಷ್ಠ ಬೆಲೆ",
        modalPrice: "ಮಾದರಿ ಬೆಲೆ",
        date: "ದಿನಾಂಕ",
        unit: "ಪ್ರತಿ ಕ್ವಿಂಟಲ್",
      },
      ml: {
        title: "മാർക്കറ്റ് വിലകൾ",
        commodity: "ചരക്ക്",
        variety: "ഇനം",
        market: "മാർക്കറ്റ്",
        state: "സംസ്ഥാനം",
        minPrice: "കുറഞ്ഞ വില",
        maxPrice: "കൂടിയ വില",
        modalPrice: "മോഡൽ വില",
        date: "തീയതി",
        unit: "ഒരു ക്വിന്റലിന്",
      },
    }

    const t = translations[language as keyof typeof translations] || translations.en

    let formatted = `${t.title}:\n\n`

    prices.forEach((price, index) => {
      formatted += `${index + 1}. ${t.commodity}: ${price.commodity}\n`
      formatted += `   ${t.variety}: ${price.variety}\n`
      formatted += `   ${t.market}: ${price.market}, ${price.state}\n`
      formatted += `   ${t.minPrice}: ₹${price.minPrice} ${t.unit}\n`
      formatted += `   ${t.maxPrice}: ₹${price.maxPrice} ${t.unit}\n`
      formatted += `   ${t.modalPrice}: ₹${price.modalPrice} ${t.unit}\n`
      formatted += `   ${t.date}: ${price.date}\n\n`
    })

    return formatted
  }

  static getPopularCommodities(): string[] {
    return [
      "Rice",
      "Wheat",
      "Maize",
      "Bajra",
      "Jowar",
      "Arhar",
      "Moong",
      "Urad",
      "Gram",
      "Masoor",
      "Groundnut",
      "Sunflower",
      "Soyabean",
      "Sesamum",
      "Cotton",
      "Sugarcane",
      "Jute",
      "Onion",
      "Potato",
      "Tomato",
      "Chilli",
      "Turmeric",
      "Coriander",
      "Cumin",
    ]
  }
}
