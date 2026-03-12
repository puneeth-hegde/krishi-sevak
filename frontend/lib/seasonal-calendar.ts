interface SeasonalActivity {
  month: string
  crops: string[]
  activities: string[]
  weather: string
  precautions: string[]
}

interface SeasonalData {
  [key: string]: SeasonalActivity[]
}

export class SeasonalCalendar {
  private static seasonalData: SeasonalData = {
    en: [
      {
        month: "January",
        crops: ["Wheat", "Mustard", "Gram", "Pea", "Potato"],
        activities: [
          "Wheat irrigation at crown root stage",
          "Apply second dose of nitrogen to wheat",
          "Harvest mustard when pods turn brown",
          "Potato earthing up and irrigation",
          "Prepare land for summer crops",
        ],
        weather: "Cold and dry, occasional frost",
        precautions: ["Protect crops from frost", "Ensure proper drainage", "Monitor for aphids"],
      },
      {
        month: "February",
        crops: ["Wheat", "Barley", "Gram", "Mustard", "Sugarcane"],
        activities: [
          "Wheat irrigation at tillering stage",
          "Harvest gram when pods are mature",
          "Sugarcane planting preparation",
          "Apply fertilizer to standing crops",
          "Prepare nursery for summer vegetables",
        ],
        weather: "Cool and pleasant, increasing temperature",
        precautions: ["Watch for late blight in potato", "Control weeds in wheat", "Prepare for summer season"],
      },
      {
        month: "March",
        crops: ["Wheat", "Barley", "Sugarcane", "Summer vegetables"],
        activities: [
          "Wheat irrigation at jointing stage",
          "Harvest mustard and gram",
          "Plant sugarcane",
          "Sow summer vegetables (okra, bottle gourd)",
          "Prepare land for kharif crops",
        ],
        weather: "Warm days, cool nights",
        precautions: [
          "Monitor wheat for rust diseases",
          "Ensure adequate water supply",
          "Control termites in sugarcane",
        ],
      },
      {
        month: "April",
        crops: ["Wheat", "Sugarcane", "Summer vegetables", "Fodder crops"],
        activities: [
          "Wheat irrigation at flowering stage",
          "Harvest early wheat varieties",
          "Sugarcane irrigation and fertilization",
          "Summer vegetable care and harvesting",
          "Sow fodder crops (maize, sorghum)",
        ],
        weather: "Hot and dry, increasing temperature",
        precautions: ["Protect crops from heat stress", "Ensure regular irrigation", "Watch for pest buildup"],
      },
      {
        month: "May",
        crops: ["Sugarcane", "Summer vegetables", "Fodder crops"],
        activities: [
          "Harvest wheat completely",
          "Sugarcane earthing up and irrigation",
          "Summer vegetable harvesting",
          "Prepare nursery for kharif crops",
          "Deep plowing for kharif preparation",
        ],
        weather: "Very hot and dry",
        precautions: ["Conserve soil moisture", "Protect from heat waves", "Store harvested grain properly"],
      },
      {
        month: "June",
        crops: ["Rice", "Cotton", "Sugarcane", "Maize"],
        activities: [
          "Rice nursery preparation",
          "Cotton sowing with pre-monsoon showers",
          "Maize sowing",
          "Sugarcane irrigation and pest control",
          "Land preparation for kharif crops",
        ],
        weather: "Hot, pre-monsoon showers expected",
        precautions: ["Monitor weather for monsoon arrival", "Ensure seed availability", "Prepare drainage systems"],
      },
    ],
    hi: [
      {
        month: "जनवरी",
        crops: ["गेहूं", "सरसों", "चना", "मटर", "आलू"],
        activities: [
          "गेहूं में कल्ले निकलने के समय सिंचाई",
          "गेहूं में नाइट्रोजन की दूसरी मात्रा डालें",
          "सरसों की कटाई जब फली भूरी हो जाए",
          "आलू में मिट्टी चढ़ाना और सिंचाई",
          "गर्मी की फसलों के लिए भूमि तैयार करें",
        ],
        weather: "ठंड और शुष्क, कभी-कभी पाला",
        precautions: ["फसलों को पाले से बचाएं", "उचित जल निकासी सुनिश्चित करें", "माहू के लिए निगरानी करें"],
      },
    ],
  }

  static getCurrentMonthActivities(language = "en"): SeasonalActivity | null {
    const currentMonth = new Date().getMonth()
    const monthNames = {
      en: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      hi: ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
    }

    const data = this.seasonalData[language] || this.seasonalData["en"]
    const currentMonthName =
      monthNames[language as keyof typeof monthNames]?.[currentMonth] || monthNames["en"][currentMonth]

    return data.find((activity) => activity.month === currentMonthName) || null
  }

  static getMonthActivities(month: string, language = "en"): SeasonalActivity | null {
    const data = this.seasonalData[language] || this.seasonalData["en"]
    return data.find((activity) => activity.month.toLowerCase() === month.toLowerCase()) || null
  }

  static formatSeasonalDataForAI(activity: SeasonalActivity, language: string): string {
    const translations = {
      en: {
        title: "Seasonal Agricultural Calendar",
        month: "Month",
        crops: "Key Crops",
        activities: "Important Activities",
        weather: "Weather Conditions",
        precautions: "Precautions",
      },
      hi: {
        title: "मौसमी कृषि कैलेंडर",
        month: "महीना",
        crops: "मुख्य फसलें",
        activities: "महत्वपूर्ण गतिविधियां",
        weather: "मौसम की स्थिति",
        precautions: "सावधानियां",
      },
    }

    const t = translations[language as keyof typeof translations] || translations.en

    let formatted = `${t.title} - ${activity.month}\n\n`
    formatted += `${t.crops}: ${activity.crops.join(", ")}\n\n`
    formatted += `${t.activities}:\n${activity.activities.map((act, i) => `${i + 1}. ${act}`).join("\n")}\n\n`
    formatted += `${t.weather}: ${activity.weather}\n\n`
    formatted += `${t.precautions}:\n${activity.precautions.map((prec, i) => `${i + 1}. ${prec}`).join("\n")}\n`

    return formatted
  }
}
