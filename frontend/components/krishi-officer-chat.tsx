"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mic,
  Send,
  Camera,
  Leaf,
  Sun,
  Droplets,
  Languages,
  Sprout,
  Bug,
  Wheat,
  ChevronDown,
  AlertCircle,
  Loader2,
} from "lucide-react"

type Language = "en" | "hi" | "kn" | "ml"

const translations = {
  en: {
    title: "Digital Agriculture Officer",
    subtitle: "Your Personal Farming Advisor",
    placeholder: "Type your question here...",
    initialMessage:
      "Hello! I'm your Digital Agriculture Officer. I can help you with any crop and farming related issues.",
    quickActions: {
      pest: "Pest Problem",
      irrigation: "Irrigation",
      fertilizer: "Fertilizer",
      weather: "Weather",
    },
    quickQueries: {
      pest: "My crops have pest infestation",
      irrigation: "When and how much water should I give?",
      fertilizer: "Which fertilizer should I use and when?",
      weather: "What precautions should I take in this weather?",
    },
    footer: "With Nature, With Technology",
    imageUpload: "Crop image uploaded",
    analysisResponse:
      "Your crop image has been analyzed. It looks healthy. Water regularly and use organic fertilizer.",
  },
  hi: {
    title: "डिजिटल कृषि अधिकारी",
    subtitle: "आपका व्यक्तिगत खेती सलाहकार",
    placeholder: "अपना सवाल यहाँ लिखें...",
    initialMessage: "नमस्ते! मैं आपका डिजिटल कृषि अधिकारी हूं। आपकी फसल और खेती से जुड़ी किसी भी समस्या में मैं आपकी मदद कर सकता हूं।",
    quickActions: {
      pest: "कीट समस्या",
      irrigation: "सिंचाई",
      fertilizer: "खाद",
      weather: "मौसम",
    },
    quickQueries: {
      pest: "मेरी फसल में कीड़े लग गए हैं",
      irrigation: "कब और कितना पानी देना चाहिए?",
      fertilizer: "कौन सी खाद कब डालनी चाहिए?",
      weather: "इस मौसम में क्या सावधानी बरतें?",
    },
    footer: "प्रकृति के साथ, तकनीक के साथ",
    imageUpload: "फसल की तस्वीर भेजी गई है",
    analysisResponse:
      "आपकी फसल की तस्वीर का विश्लेषण किया गया है। यह स्वस्थ दिख रही है। नियमित पानी दें और जैविक खाद का उपयोग करें।",
  },
  kn: {
    title: "ಡಿಜಿಟಲ್ ಕೃಷಿ ಅಧಿಕಾರಿ",
    subtitle: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಕೃಷಿ ಸಲಹೆಗಾರ",
    placeholder: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
    initialMessage: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಕೃಷಿ ಅಧಿಕಾರಿ. ನಿಮ್ಮ ಬೆಳೆ ಮತ್ತು ಕೃಷಿ ಸಂಬಂಧಿತ ಯಾವುದೇ ಸಮಸ್ಯೆಗಳಲ್ಲಿ ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
    quickActions: {
      pest: "ಕೀಟ ಸಮಸ್ಯೆ",
      irrigation: "ನೀರಾವರಿ",
      fertilizer: "ಗೊಬ್ಬರ",
      weather: "ಹವಾಮಾನ",
    },
    quickQueries: {
      pest: "ನನ್ನ ಬೆಳೆಗಳಲ್ಲಿ ಕೀಟಗಳು ಬಂದಿವೆ",
      irrigation: "ಯಾವಾಗ ಮತ್ತು ಎಷ್ಟು ನೀರು ಕೊಡಬೇಕು?",
      fertilizer: "ಯಾವ ಗೊಬ್ಬರವನ್ನು ಯಾವಾಗ ಹಾಕಬೇಕು?",
      weather: "ಈ ಹವಾಮಾನದಲ್ಲಿ ಏನು ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕು?",
    },
    footer: "ಪ್ರಕೃತಿಯೊಂದಿಗೆ, ತಂತ್ರಜ್ಞಾನದೊಂದಿಗೆ",
    imageUpload: "ಬೆಳೆಯ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ",
    analysisResponse: "ನಿಮ್ಮ ಬೆಳೆಯ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ. ಇದು ಆರೋಗ್ಯಕರವಾಗಿ ಕಾಣುತ್ತದೆ. ನಿಯಮಿತವಾಗಿ ನೀರು ಕೊಡಿ ಮತ್ತು ಸಾವಯವ ಗೊಬ್ಬರ ಬಳಸಿ.",
  },
  ml: {
    title: "ഡിജിറ്റൽ കൃഷി ഓഫീസർ",
    subtitle: "നിങ്ങളുടെ വ്യക്തിഗത കൃഷി ഉപദേശകൻ",
    placeholder: "നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
    initialMessage:
      "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ഡിജിറ്റൽ കൃഷി ഓഫീസറാണ്. നിങ്ങളുടെ വിള, കൃഷി സംബന്ധമായ ഏതെങ്കിലും പ്രശ്നങ്ങളിൽ എനിക്ക് നിങ്ങളെ സഹായിക്കാൻ കഴിയും.",
    quickActions: {
      pest: "കീട പ്രശ്നം",
      irrigation: "ജലസേചനം",
      fertilizer: "വളം",
      weather: "കാലാവസ്ഥ",
    },
    quickQueries: {
      pest: "എന്റെ വിളകളിൽ കീടങ്ങൾ വന്നിട്ടുണ്ട്",
      irrigation: "എപ്പോൾ, എത്ര വെള്ളം കൊടുക്കണം?",
      fertilizer: "ഏത് വളം എപ്പോൾ ഇടണം?",
      weather: "ഈ കാലാവസ്ഥയിൽ എന്ത് മുൻകരുതലുകൾ എടുക്കണം?",
    },
    footer: "പ്രകൃതിയോടൊപ്പം, സാങ്കേതികവിദ്യയോടൊപ്പം",
    imageUpload: "വിള ചിത്രം അപ്‌ലോഡ് ചെയ്തു",
    analysisResponse:
      "നിങ്ങളുടെ വിള ചിത്രം വിശകലനം ചെയ്തു. ഇത് ആരോഗ്യകരമായി കാണപ്പെടുന്നു. പതിവായി വെള്ളം കൊടുക്കുകയും ജൈവ വളം ഉപയോഗിക്കുകയും ചെയ്യുക.",
  },
}

const languageNames = {
  en: "English",
  hi: "हिंदी",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
}

interface Message {
  id: string
  type: "user" | "ai" | "error"
  content: string
  timestamp: Date
  image?: string
}

export function KrishiOfficerChat() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID())

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: translations[currentLanguage].initialMessage,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMessages([
      {
        id: "1",
        type: "ai",
        content: translations[currentLanguage].initialMessage,
        timestamp: new Date(),
      },
    ])
  }, [currentLanguage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    if (inputValue.length > 2000) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "error",
        content: "Message too long. Please keep it under 2000 characters.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsLoading(true)
    setConnectionError(false)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          language: currentLanguage,
          sessionId: sessionId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])

        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId)
        }
      } else {
        throw new Error(data.error || "Failed to get response")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setConnectionError(true)

      const errorResponses = {
        en: "I'm having trouble connecting right now. Please check your internet connection and try again.",
        hi: "अभी मुझे कनेक्ट करने में समस्या हो रही है। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।",
        kn: "ಈಗ ನನಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಲು ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೋಧಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        ml: "ഇപ്പോൾ എനിക്ക് കണക്റ്റ് ചെയ്യാൻ പ്രശ്നമുണ്ട്. ദയവായി നിങ്ങളുടെ ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
      }

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content: errorResponses[currentLanguage],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: "error",
          content: "Image too large. Please select an image smaller than 5MB.",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        return
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageMessage: Message = {
          id: Date.now().toString(),
          type: "user",
          content: translations[currentLanguage].imageUpload,
          timestamp: new Date(),
          image: e.target?.result as string,
        }
        setMessages((prev) => [...prev, imageMessage])
        setIsLoading(true)

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: "Analyze this crop image",
              language: currentLanguage,
              image: e.target?.result as string,
              sessionId: sessionId,
            }),
          })

          const data = await response.json()

          if (data.success) {
            const analysisResponse: Message = {
              id: (Date.now() + 1).toString(),
              type: "ai",
              content: data.response,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, analysisResponse])
          }
        } catch (error) {
          console.error("Failed to analyze image:", error)
          const errorResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: "error",
            content: "Failed to analyze image. Please try again.",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorResponse])
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
  }

  const quickActions = [
    {
      icon: Bug,
      text: translations[currentLanguage].quickActions.pest,
      query: translations[currentLanguage].quickQueries.pest,
    },
    {
      icon: Droplets,
      text: translations[currentLanguage].quickActions.irrigation,
      query: translations[currentLanguage].quickQueries.irrigation,
    },
    {
      icon: Wheat,
      text: translations[currentLanguage].quickActions.fertilizer,
      query: translations[currentLanguage].quickQueries.fertilizer,
    },
    {
      icon: Sun,
      text: translations[currentLanguage].quickActions.weather,
      query: translations[currentLanguage].quickQueries.weather,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto p-4 flex flex-col min-h-screen">
        {connectionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Connection issues detected. Some features may not work properly.</span>
          </div>
        )}

        <header className="mb-6">
          <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-sm">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600 rounded-2xl">
                  <Sprout className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-800">{translations[currentLanguage].title}</h1>
                  <p className="text-green-600 text-sm">{translations[currentLanguage].subtitle}</p>
                </div>
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                  <Languages className="h-4 w-4" />
                  <span className="text-sm font-medium">{languageNames[currentLanguage]}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {showLanguageDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-green-200 rounded-xl shadow-lg z-10 min-w-[140px]">
                    {Object.entries(languageNames).map(([code, name]) => (
                      <button
                        key={code}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 first:rounded-t-xl last:rounded-b-xl ${
                          currentLanguage === code ? "bg-green-50 text-green-700 font-medium" : "text-gray-700"
                        }`}
                        onClick={() => {
                          setCurrentLanguage(code as Language)
                          setShowLanguageDropdown(false)
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </header>

        <Card className="flex-1 bg-white/90 backdrop-blur-sm border-green-200 shadow-sm">
          <ScrollArea className="h-[60vh] p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                      message.type === "user"
                        ? "bg-green-600 text-white"
                        : message.type === "error"
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.image && (
                      <div className="mb-3 rounded-xl overflow-hidden">
                        <img
                          src={message.image || "/placeholder.svg"}
                          alt="Uploaded crop"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                      {message.type === "error" ? <AlertCircle className="h-3 w-3" /> : <Leaf className="h-3 w-3" />}
                      <span suppressHydrationWarning>
                        {message.timestamp.toLocaleTimeString(currentLanguage === "en" ? "en-US" : "hi-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl shadow-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </Card>

        <Card className="mt-4 bg-white/90 backdrop-blur-sm border-green-200 shadow-sm">
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto p-3 flex flex-col items-center gap-2 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                  onClick={() => setInputValue(action.query)}
                >
                  {React.createElement(action.icon, { className: "h-4 w-4" })}
                  <span className="text-xs">{action.text}</span>
                </Button>
              ))}
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={translations[currentLanguage].placeholder}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl text-base py-3"
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                  disabled={isLoading}
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">{inputValue.length}/2000</div>
              </div>

              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  title="Upload crop image"
                />

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Camera className="h-5 w-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 ${
                    isListening ? "bg-blue-50 text-blue-600" : ""
                  }`}
                  onClick={toggleVoiceInput}
                  disabled={isLoading}
                >
                  <Mic className="h-5 w-5" />
                </Button>

                <Button
                  onClick={handleSendMessage}
                  className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-6"
                  disabled={!inputValue.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <footer className="mt-4 text-center">
          <p className="text-sm text-green-600 flex items-center justify-center gap-2">
            <Leaf className="h-4 w-4" />
            {translations[currentLanguage].footer}
          </p>
        </footer>
      </div>
    </div>
  )
}
