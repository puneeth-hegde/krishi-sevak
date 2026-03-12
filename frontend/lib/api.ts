// frontend/lib/api.ts

const API_BASE_URL = "http://localhost:8000";

// This interface defines the structure of a single message object
// It's exported so both files can use the exact same definition.
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export interface DiagnoseResponse {
  detected_disease: string;
  confidence: number;
  advisory: string;
}

/**
 * Sends the entire chat history to the backend for a contextual response.
 * @param history The array of all previous messages.
 * @param language The currently selected language.
 * @returns The AI's response as a ChatResponse object.
 */
export const sendChatMessage = async (history: Message[], language: string): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, language }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch. The server might be down or having an issue.' }));
    throw new Error(errorData.detail || 'An unknown error occurred.');
  }
  return response.json();
};

/**
 * Uploads an image file for disease diagnosis.
 * @param file The image file.
 * @param language The currently selected language.
 * @returns The diagnosis result as a DiagnoseResponse object.
 */
export const uploadForDiagnosis = async (file: File, language: string): Promise<DiagnoseResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const response = await fetch(`${API_BASE_URL}/diagnose`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch. The server might be down or having an issue.' }));
    throw new Error(errorData.detail || 'Failed to diagnose the image.');
  }
  return response.json();
};