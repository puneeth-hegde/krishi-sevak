'use client';

import { useState, useRef, FormEvent, ChangeEvent, useEffect } from 'react';
import { sendChatMessage, uploadForDiagnosis, Message } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- INTERNATIONALIZATION (i18n) CONTENT ---
const translations = {
  English: {
    title: "KrishiSevak",
    subtitle: "Your Personal Farming Advisor",
    greeting: "Hello! I'm your Digital Agriculture Officer. How can I help you today?",
    placeholder: "Type your question here...",
    upload_aria: "Upload image",
    camera_aria: "Use camera",
    take_photo: "Take Photo",
    close_camera: "Close Camera",
    diagnosis_prompt: "Image for diagnosis",
    error_api: "Sorry, there was an error:",
    diagnosis_result: "Diagnosis Result",
    detected_disease: "Detected Disease:",
    confidence: "Confidence:",
    quick_actions: {
        pest: "Pest Problem",
        irrigation: "Irrigation",
        fertilizer: "Fertilizer",
        weather: "Weather"
    },
    thinking: "Thinking..."
  },
  Kannada: {
    title: "ಕೃಷಿಸೇವಕ",
    subtitle: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಕೃಷಿ ಸಲಹೆಗಾರ",
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಡಿಜಿಟಾಲ ಕೃಷಿ ಅಧಿಕಾರಿ. ಇಂದು ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    placeholder: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
    upload_aria: "ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    camera_aria: "ಕ್ಯಾಮೆರಾ ಬಳಸಿ",
    take_photo: "ಫೋಟೋ ತೆಗೆಯಿರಿ",
    close_camera: "ಕ್ಯಾಮೆರಾ ಮುಚ್ಚಿ",
    diagnosis_prompt: "ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ಚಿತ್ರ",
    error_api: "ಕ್ಷಮಿಸಿ, ದೋಷ ಸಂಭವಿಸಿದೆ:",
    diagnosis_result: "ರೋಗನಿರ್ಣಯದ ಫಲಿತಾಂಶ",
    detected_disease: "ಪತ್ತೆಯಾದ ರೋಗ:",
    confidence: "ವಿಶ್ವಾಸ:",
    quick_actions: {
        pest: "ಕೀಟ ಸಮಸ್ಯೆ",
        irrigation: "ನೀರಾವರಿ",
        fertilizer: "ಗೊಬ್ಬರ",
        weather: "ಹವಾಮಾನ"
    },
    thinking: "ಆಲೋಚಿಸುತ್ತಿದೆ..."
  },
  Malayalam: {
    title: "കൃഷിസേവക്",
    subtitle: "നിങ്ങളുടെ സ്വകാര്യ കാർഷിക ഉപദേശകൻ",
    greeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ഡിജിറ്റൽ കൃഷി ഓഫീസർ. ഇന്ന് ഞാൻ എങ്ങനെ സഹായിക്കും?",
    placeholder: "നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
    upload_aria: "ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
    camera_aria: "ക്യാമറ ഉപയോഗിക്കുക",
    take_photo: "ഫോട്ടോ എടുക്കുക",
    close_camera: "ക്യാമറ അടയ്ക്കുക",
    diagnosis_prompt: "രോഗനിർണയത്തിനുള്ള ചിത്രം",
    error_api: "ക്ഷമിക്കണം, ഒരു പിശക് സംഭവിച്ചു:",
    diagnosis_result: "രോഗനിർണയ ഫലം:",
    detected_disease: "കണ്ടെത്തിയ രോഗം:",
    confidence: "ആത്മവിശ്വാസം:",
    quick_actions: {
        pest: "കീടങ്ങളുടെ പ്രശ്നം",
        irrigation: "ജലസേചനം",
        fertilizer: "വളം",
        weather: "കാലാവസ്ഥ"
    },
    thinking: "ചിന്തിക്കുന്നു..."
  }
};

type Language = keyof typeof translations;

interface UIMessage extends Message {
    imageUrl?: string | null;
    timestamp: string;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>('English');
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const uiText = translations[language];
  
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    setMessages([{ 
        role: 'assistant', 
        content: uiText.greeting, 
        timestamp: formatTimestamp(new Date()) 
    }]);
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleOpenCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-shot.jpg", { type: "image/jpeg" });
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }
      }, 'image/jpeg');
      handleCloseCamera();
    }
  };

  const handleCloseCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setStream(null);
  };

  const clearAttachment = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    setIsLoading(true);
    const userMessageContent = input.trim() || `${uiText.diagnosis_prompt}`;
    
    const newUserMessage: UIMessage = { 
        role: 'user', 
        content: userMessageContent,
        imageUrl: previewUrl,
        timestamp: formatTimestamp(new Date())
    };

    const currentHistoryWithUI = [...messages, newUserMessage];
    setMessages(currentHistoryWithUI);
    setInput('');
    setPreviewUrl(null); 
    const fileToSend = selectedFile;
    setSelectedFile(null); 

    try {
      let botResponse: UIMessage;
      if (fileToSend) {
        const data = await uploadForDiagnosis(fileToSend, language);
        const formattedAdvisory = `**${uiText.diagnosis_result}**\n\n- **${uiText.detected_disease}** ${data.detected_disease}\n- **${uiText.confidence}** ${Math.round(data.confidence * 100)}%\n\n---\n\n${data.advisory}`;
        botResponse = { role: 'assistant', content: formattedAdvisory, timestamp: formatTimestamp(new Date()) };
      } else {
        const apiHistory = currentHistoryWithUI.map(({ role, content }) => ({ role, content }));
        const data = await sendChatMessage(apiHistory, language);
        botResponse = { role: 'assistant', content: data.reply, timestamp: formatTimestamp(new Date()) };
      }
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      const errorResponse: UIMessage = { role: 'assistant', content: `${uiText.error_api} ${errorMessage}`, timestamp: formatTimestamp(new Date()) };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      if (newUserMessage.imageUrl) {
        URL.revokeObjectURL(newUserMessage.imageUrl);
      }
    }
  };
  
  const quickActions = [
    { icon: '🐛', label: uiText.quick_actions.pest, text: 'I have a pest problem with my crops' },
    { icon: '💧', label: uiText.quick_actions.irrigation, text: 'I need advice on irrigation and watering' },
    { icon: '🌱', label: uiText.quick_actions.fertilizer, text: 'What fertilizer should I use for my crops?' },
    { icon: '☀️', label: uiText.quick_actions.weather, text: 'How will the weather affect my farming?' }
  ];

  const handleQuickActionClick = (text: string) => {
    setInput(text);
  };

  return (
    <>
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95">
          <video ref={videoRef} autoPlay playsInline className="h-auto w-full max-w-sm rounded-2xl shadow-2xl"></video>
          <div className="mt-6 flex gap-4">
            <button 
              onClick={handleTakePhoto} 
              className="rounded-full bg-green-500 px-8 py-3 text-lg font-medium text-white shadow-lg hover:bg-green-600 active:scale-95 transition-all"
            >
              {uiText.take_photo}
            </button>
            <button 
              onClick={handleCloseCamera} 
              className="rounded-full bg-gray-600 px-8 py-3 text-lg font-medium text-white shadow-lg hover:bg-gray-700 active:scale-95 transition-all"
            >
              {uiText.close_camera}
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
      
      {/* --- CORRECTED LAYOUT STRUCTURE FOR SCROLLING --- */}
      <div className="flex h-screen flex-col bg-gray-50">
        
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 max-w-3xl mx-auto">
             <div className="flex items-center space-x-3">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                 <span className="text-xl">🌱</span>
               </div>
               <div>
                 <h1 className="text-lg font-semibold text-gray-900">{uiText.title}</h1>
                 <p className="text-xs text-green-600 font-medium">{uiText.subtitle}</p>
               </div>
             </div>
             <select 
               value={language} 
               onChange={(e) => setLanguage(e.target.value as Language)} 
               className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
             >
               <option value="English">EN</option>
               <option value="Kannada">ಕನ್ನಡ</option>
               <option value="Malayalam">മലയാളം</option>
             </select>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 space-y-4 max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[75%]`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-green-50 border border-green-100 text-gray-900'
                  }`}>
                    <div className="prose prose-sm max-w-none text-base">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                      {msg.imageUrl && (
                        <img 
                          src={msg.imageUrl} 
                          alt="User upload" 
                          className="mt-3 max-w-[200px] rounded-xl shadow-sm" 
                        />
                      )}
                    </div>
                  </div>
                   <div className={`mt-1 px-2 text-xs text-gray-500 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                   </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-[75%]">
                  <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">{uiText.thinking}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </main>
        
        <footer className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
           <div className="max-w-3xl mx-auto">
             {messages.length <= 1 && !isLoading && (
               <div className="px-4 py-3 border-b border-gray-100">
                 <div className="flex flex-wrap gap-2 justify-center">
                   {quickActions.map((action, index) => (
                     <button
                       key={index}
                       onClick={() => handleQuickActionClick(action.text)}
                       className="flex items-center space-x-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 active:scale-95 transition-all"
                     >
                       <span>{action.icon}</span>
                       <span>{action.label}</span>
                     </button>
                   ))}
                 </div>
               </div>
             )}
             {previewUrl && !isLoading && (
               <div className="px-4 pt-3">
                 <div className="relative inline-block">
                   <img 
                     src={previewUrl} 
                     alt="Selected preview" 
                     className="h-16 w-16 rounded-xl object-cover shadow-sm border border-gray-200"
                   />
                   <button 
                     onClick={clearAttachment} 
                     className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                   >
                     <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
               </div>
             )}
             <form onSubmit={handleSubmit} className="p-4">
               <div className="flex items-end space-x-3">
                 <div className="flex-1 relative">
                   <textarea
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     placeholder={uiText.placeholder}
                     disabled={isLoading}
                     className="w-full resize-none rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 pr-24 text-base focus:border-green-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                     rows={1}
                     style={{ minHeight: '52px', maxHeight: '150px' }}
                     onKeyDown={(e) => { 
                       if (e.key === 'Enter' && !e.shiftKey) { 
                         e.preventDefault(); 
                         handleSubmit(e as any); 
                       } 
                     }}
                   />
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       onChange={handleFileChange} 
                       accept="image/*" 
                       className="hidden" 
                     />
                     <button 
                       type="button" 
                       onClick={() => fileInputRef.current?.click()} 
                       disabled={isLoading} 
                       aria-label="Upload image"
                       className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50 active:scale-95 transition-all"
                     >
                       <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                       </svg>
                     </button>
                     <button 
                       type="button" 
                       onClick={handleOpenCamera} 
                       disabled={isLoading} 
                       aria-label="Use camera"
                       className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50 active:scale-95 transition-all"
                     >
                       <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                     </button>
                   </div>
                 </div>
                 <button 
                   type="submit" 
                   disabled={isLoading || (!input.trim() && !selectedFile)} 
                   className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 disabled:bg-gray-300 disabled:shadow-none active:scale-95 transition-all"
                 >
                   {isLoading ? (
                     <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                   ) : (
                     <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                     </svg>
                   )}
                 </button>
               </div>
             </form>

             <div className="px-4 pb-2">
               <div className="flex items-center justify-center space-x-2 text-xs text-green-600">
                 <span className="text-sm">🌿</span>
                 <span className="font-medium">With Nature, With Technology</span>
               </div>
             </div>
           </div>
        </footer>
      </div>
    </>
  );
}