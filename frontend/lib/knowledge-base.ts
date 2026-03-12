interface KnowledgeItem {
  id: string
  title: string
  content: string
  category:
    | "crop-management"
    | "pest-control"
    | "soil-health"
    | "weather-patterns"
    | "government-schemes"
    | "seasonal-calendar"
  tags: string[]
  language: string
}

interface KnowledgeResponse {
  success: boolean
  data?: KnowledgeItem[]
  error?: string
}

export class KnowledgeBase {
  private static knowledgeData: KnowledgeItem[] = [
    // Crop Management
    {
      id: "rice-cultivation-en",
      title: "Rice Cultivation Best Practices",
      content: `Rice cultivation requires proper water management, soil preparation, and timing. Key practices include:
      
1. Land Preparation: Plow the field 2-3 times and level properly
2. Seed Selection: Use certified seeds, treat with fungicide
3. Transplanting: 21-day old seedlings, 20x15 cm spacing
4. Water Management: Maintain 2-5 cm water level during vegetative stage
5. Fertilizer: Apply NPK as per soil test recommendations
6. Pest Management: Monitor for stem borer, leaf folder, and brown plant hopper
7. Harvesting: When 80% of grains turn golden yellow

Best planting time: Kharif (June-July), Rabi (November-December)`,
      category: "crop-management",
      tags: ["rice", "cultivation", "water-management", "transplanting"],
      language: "en",
    },
    {
      id: "rice-cultivation-hi",
      title: "चावल की खेती की सर्वोत्तम प्रथाएं",
      content: `चावल की खेती के लिए उचित जल प्रबंधन, मिट्टी की तैयारी और समय की आवश्यकता होती है। मुख्य प्रथाएं:

1. भूमि की तैयारी: खेत को 2-3 बार जोतें और समतल करें
2. बीज चयन: प्रमाणित बीज का उपयोग करें, फफूंदनाशी से उपचार करें
3. रोपाई: 21 दिन पुराने पौधे, 20x15 सेमी की दूरी
4. जल प्रबंधन: वानस्पतिक अवस्था में 2-5 सेमी पानी का स्तर बनाए रखें
5. उर्वरक: मिट्टी परीक्षण के अनुसार NPK डालें
6. कीट प्रबंधन: तना छेदक, पत्ती लपेटक और भूरे फुदके की निगरानी करें
7. कटाई: जब 80% दाने सुनहरे पीले हो जाएं

सर्वोत्तम बुआई समय: खरीफ (जून-जुलाई), रबी (नवंबर-दिसंबर)`,
      category: "crop-management",
      tags: ["चावल", "खेती", "जल-प्रबंधन", "रोपाई"],
      language: "hi",
    },
    {
      id: "wheat-cultivation-en",
      title: "Wheat Cultivation Guidelines",
      content: `Wheat is a major rabi crop requiring cool weather for growth and warm weather for ripening.

1. Soil Requirements: Well-drained loamy soil with pH 6.0-7.5
2. Seed Rate: 100-125 kg/ha for irrigated, 75-100 kg/ha for rainfed
3. Sowing Time: Mid-November to mid-December
4. Sowing Method: Line sowing with 20-23 cm row spacing
5. Irrigation: 4-6 irrigations - crown root, tillering, jointing, flowering, milk, and dough stages
6. Fertilizer: 120 kg N, 60 kg P2O5, 40 kg K2O per hectare
7. Weed Control: Use herbicides or manual weeding at 30-35 days
8. Harvesting: When moisture content is 20-25%

Common varieties: HD-2967, PBW-343, DBW-88`,
      category: "crop-management",
      tags: ["wheat", "rabi", "irrigation", "fertilizer"],
      language: "en",
    },
    // Pest Control
    {
      id: "aphid-control-en",
      title: "Aphid Control in Crops",
      content: `Aphids are small, soft-bodied insects that suck plant sap and can transmit viral diseases.

Identification:
- Small (1-4mm), pear-shaped insects
- Green, black, red, or white colored
- Found on undersides of leaves and growing tips
- Produce sticky honeydew

Control Measures:
1. Biological Control: Encourage ladybugs, lacewings, and parasitic wasps
2. Cultural Control: Remove weeds, use reflective mulches
3. Organic Sprays: Neem oil, insecticidal soap, garlic spray
4. Chemical Control: Imidacloprid, Thiamethoxam (if severe infestation)

Prevention:
- Regular monitoring
- Avoid over-fertilization with nitrogen
- Maintain proper plant spacing for air circulation`,
      category: "pest-control",
      tags: ["aphid", "pest-control", "biological-control", "neem"],
      language: "en",
    },
    // Soil Health
    {
      id: "soil-testing-en",
      title: "Soil Testing and Health Management",
      content: `Regular soil testing is crucial for maintaining soil fertility and crop productivity.

Key Soil Parameters:
1. pH Level: Optimal range 6.0-7.5 for most crops
2. Organic Matter: Should be 2-3% minimum
3. NPK Levels: Nitrogen, Phosphorus, Potassium availability
4. Micronutrients: Zinc, Iron, Manganese, Boron levels
5. Electrical Conductivity: Indicates salinity levels

Soil Health Improvement:
1. Organic Matter Addition: Compost, farmyard manure, green manure
2. Crop Rotation: Legumes to fix nitrogen
3. Cover Crops: Prevent erosion, add organic matter
4. Reduced Tillage: Preserve soil structure
5. Balanced Fertilization: Based on soil test results

Testing Frequency: Every 2-3 years or before major cropping seasons`,
      category: "soil-health",
      tags: ["soil-testing", "pH", "organic-matter", "fertilization"],
      language: "en",
    },
    // Government Schemes
    {
      id: "pm-kisan-en",
      title: "PM-KISAN Scheme Benefits",
      content: `Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) provides income support to farmer families.

Eligibility:
- All landholding farmer families
- Cultivable land holding in their names
- Both small and marginal farmers covered

Benefits:
- ₹6,000 per year in three equal installments
- ₹2,000 every four months
- Direct transfer to bank accounts

Required Documents:
1. Aadhaar Card
2. Bank Account Details
3. Land Records (Khata/Khatauni)
4. Mobile Number

Application Process:
1. Visit pmkisan.gov.in
2. Click on "New Farmer Registration"
3. Fill required details
4. Upload documents
5. Submit application

Status Check: Use Aadhaar number or mobile number on PM-KISAN portal`,
      category: "government-schemes",
      tags: ["pm-kisan", "subsidy", "income-support", "registration"],
      language: "en",
    },
    {
      id: "kisan-credit-card-hi",
      title: "किसान क्रेडिट कार्ड योजना",
      content: `किसान क्रेडिट कार्ड (KCC) किसानों को कृषि और संबंधित गतिविधियों के लिए ऋण प्रदान करता है।

पात्रता:
- सभी किसान (व्यक्तिगत/संयुक्त)
- काश्तकार किसान
- स्वयं सहायता समूह के सदस्य
- किरायेदार किसान

लाभ:
- फसल ऋण की सुविधा
- 3 लाख तक बिना गारंटी
- कम ब्याज दर (7% तक)
- लचीली चुकौती शर्तें
- बीमा कवरेज

आवश्यक दस्तावेज:
1. आधार कार्ड
2. पैन कार्ड
3. भूमि के कागजात
4. बैंक खाता विवरण
5. पासपोर्ट साइज फोटो

आवेदन प्रक्रिया: नजदीकी बैंक शाखा में संपर्क करें`,
      category: "government-schemes",
      tags: ["kcc", "ऋण", "किसान", "बैंक"],
      language: "hi",
    },
  ]

  static searchKnowledge(query: string, language = "en", category?: string): KnowledgeResponse {
    try {
      const lowerQuery = query.toLowerCase()
      let filteredData = this.knowledgeData.filter(
        (item) => item.language === language || item.language === "en", // Fallback to English
      )

      if (category) {
        filteredData = filteredData.filter((item) => item.category === category)
      }

      // Search in title, content, and tags
      const results = filteredData.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.content.toLowerCase().includes(lowerQuery) ||
          item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
      )

      // Sort by relevance (simple scoring)
      const scoredResults = results
        .map((item) => {
          let score = 0
          if (item.title.toLowerCase().includes(lowerQuery)) score += 3
          if (item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) score += 2
          if (item.content.toLowerCase().includes(lowerQuery)) score += 1
          return { ...item, score }
        })
        .sort((a, b) => b.score - a.score)

      return { success: true, data: scoredResults.slice(0, 5) } // Return top 5 results
    } catch (error) {
      console.error("Knowledge Base Search Error:", error)
      return { success: false, error: "Failed to search knowledge base" }
    }
  }

  static getByCategory(category: string, language = "en"): KnowledgeResponse {
    try {
      const results = this.knowledgeData.filter(
        (item) => item.category === category && (item.language === language || item.language === "en"),
      )

      return { success: true, data: results }
    } catch (error) {
      console.error("Knowledge Base Category Error:", error)
      return { success: false, error: "Failed to get category data" }
    }
  }

  static formatKnowledgeForAI(items: KnowledgeItem[], language: string): string {
    if (!items || items.length === 0) return ""

    const translations = {
      en: {
        title: "Relevant Agricultural Knowledge",
        source: "Source",
      },
      hi: {
        title: "संबंधित कृषि ज्ञान",
        source: "स्रोत",
      },
      kn: {
        title: "ಸಂಬಂಧಿತ ಕೃಷಿ ಜ್ಞಾನ",
        source: "ಮೂಲ",
      },
      ml: {
        title: "പ്രസക്തമായ കാർഷിക അറിവ്",
        source: "ഉറവിടം",
      },
    }

    const t = translations[language as keyof typeof translations] || translations.en

    let formatted = `${t.title}:\n\n`

    items.forEach((item, index) => {
      formatted += `${index + 1}. ${item.title}\n`
      formatted += `${item.content}\n\n`
    })

    return formatted
  }

  static addKnowledgeItem(item: Omit<KnowledgeItem, "id">): string {
    const id = `${item.category}-${Date.now()}-${item.language}`
    const newItem: KnowledgeItem = { ...item, id }
    this.knowledgeData.push(newItem)
    return id
  }

  static getPopularTopics(language = "en"): string[] {
    const topics = {
      en: [
        "rice cultivation",
        "wheat farming",
        "pest control",
        "soil testing",
        "organic farming",
        "irrigation methods",
        "crop rotation",
        "fertilizer application",
        "government schemes",
        "kisan credit card",
        "weather patterns",
        "harvest timing",
      ],
      hi: [
        "चावल की खेती",
        "गेहूं की खेती",
        "कीट नियंत्रण",
        "मिट्टी परीक्षण",
        "जैविक खेती",
        "सिंचाई विधियां",
        "फसल चक्र",
        "उर्वरक प्रयोग",
        "सरकारी योजनाएं",
        "किसान क्रेडिट कार्ड",
        "मौसम पैटर्न",
        "फसल कटाई",
      ],
      kn: ["ಅಕ್ಕಿ ಕೃಷಿ", "ಗೋಧಿ ಕೃಷಿ", "ಕೀಟ ನಿಯಂತ್ರಣೆ", "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ", "ಸಾವಯವ ಕೃಷಿ", "ನೀರಾವರಿ ವಿಧಾನಗಳು", "ಬೆಳೆ ಸರದಿ", "ಗೊಬ್ಬರ ಬಳಕೆ"],
      ml: ["നെല്ല് കൃഷി", "ഗോതമ്പ് കൃഷി", "കീടനിയന്ത്രണം", "മണ്ണ് പരിശോധന", "ജൈവകൃഷി", "ജലസേചന രീതികൾ", "വിള ഭ്രമണം", "വളപ്രയോഗം"],
    }

    return topics[language as keyof typeof topics] || topics.en
  }
}
