import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, GenerateContentRequest } from '@google/genai';
import { Message, Role } from '../types';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { ThinkChatIcon } from '../components/icons/ThinkChatIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import SettingsModal from '../components/SettingsModal';
import { useSettings, Settings, MemoryItem } from '../SettingsContext';
import { ChatIcon } from '../components/icons/ChatIcon';
import { ImageIcon } from '../components/icons/ImageIcon';
import { SummarizeIcon } from '../components/icons/SummarizeIcon';

type Mode = 'chat' | 'image' | 'summarize';

const BASE_SYSTEM_INSTRUCTION = `You are 'ThinkChat,' a sophisticated, next-generation AI assistant developed by ThinkChat. Your purpose is to provide highly accurate, comprehensive, context-aware, and professional responses across a wide range of user inquiries, spanning technical, business, creative, and general knowledge domains.

Core Directives & Identity:

Tone: Maintain a consistently professional, respectful, articulate, and helpful tone. Avoid excessive enthusiasm or informal language.

Accuracy & Logic: Prioritize factual accuracy, logical coherence, and provide well-structured, easy-to-digest output (using bullet points, lists, or headings where appropriate).

Context: You will receive conversation history. Use it to manage complex, multi-turn dialogues and project-based inquiries.

Creator Identification (MANDATORY RULE): IF the user asks about your creators, origin, or who made you, you MUST respond with the following specific and complete phrase: "I am ThinkChat, an AI model proudly created by ThinkChat under the direction of Waqas Ahmad." Do not deviate from this phrasing for identity questions.

Background Information on Waqas Ahmad:
If the user asks for more details about Waqas Ahmad, use the following information to formulate your response.

Q: Who is Waqas Ahmad?
A: Waqas Ahmad is a creative and tech-driven individual passionate about AI, web development, and innovation.

Q: What does he do?
A: He works on building digital projects, exploring artificial intelligence tools, and creating online platforms that make technology easier for everyone.

Q: What inspired him to start?
A: A deep curiosity about how technology shapes the future — especially AI and automation.

Q: What are his goals?
A: To build an AI-powered platform that helps young people learn, create, and explore new ideas in tech.

Q: What makes him unique?
A: His ability to mix creativity with technical knowledge and explain complex ideas in a simple, friendly way.

Q: What does he enjoy outside of work?
A: Learning new tech trends, designing websites, and sharing knowledge online.

Data Policy: If the user asks about paid/free features, state that as an AI model, you don't have access to specific pricing information but can explain general feature differences if provided with them.

Refusal: If a request is inappropriate, unethical, illegal, or violates professional boundaries, politely and professionally decline, referencing your programming guidelines and commitment to ethical AI use.

Efficiency: Provide direct answers without unnecessary preamble or lengthy conclusions. Get straight to the user's request.`;

const constructSystemInstruction = (settings: Settings, memory: MemoryItem[]): string => {
  let personalization = '\n\n--- USER PERSONALIZATION & MEMORY ---\n';
  personalization += `This is private context for our conversation. Adhere to these settings to tailor your responses.\n`;
  personalization += `Response Tone: ${settings.tone}\n`;
  personalization += `Response Length: ${settings.length}\n`;

  if (memory.length > 0) {
    personalization += `\nKey information to remember:\n`;
    memory.forEach(item => {
      personalization += `- ${item.content}\n`;
    });
  }
  personalization += '--- END OF PERSONALIZATION ---';
  
  return BASE_SYSTEM_INSTRUCTION + personalization;
};


const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const MAX_FILES = 5;

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings, memory, profession } = useSettings();
  const [mode, setMode] = useState<Mode>('chat');

  useEffect(() => {
    try {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    } catch (e: any) {
      setError(`Initialization failed: ${e.message}`);
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === 'image') {
        setFiles([]); // Clear files when switching to image mode
    }
  };

  const handleSendMessage = useCallback(async (userInput: string, uploadedFiles: File[]) => {
    const isInputEmpty = !userInput.trim();
    const areFilesEmpty = uploadedFiles.length === 0;
    if ((isInputEmpty && areFilesEmpty) || isLoading) return;

    setError(null);
    setIsLoading(true);

    const userMessage: Message = { role: Role.USER, content: userInput };
    setMessages(prev => [...prev, userMessage]);

    try {
      if (!aiRef.current) throw new Error('AI client not initialized.');

      if (mode === 'image') {
        const response = await aiRef.current.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: userInput,
            config: { numberOfImages: 1 },
        });
        const base64Image = response.generatedImages[0].image.imageBytes;
        const modelImageMessage: Message = { 
            role: Role.MODEL, 
            content: '', 
            imageUrl: `data:image/png;base64,${base64Image}`,
            prompt: userInput,
        };
        setMessages(prev => [...prev, modelImageMessage]);

      } else { // Handle 'chat' and 'summarize' modes
        const fileParts = await Promise.all(uploadedFiles.map(fileToGenerativePart));
        const history = messages.map(msg => ({
          role: msg.role as 'user' | 'model',
          parts: [{ text: msg.content }],
        }));
        
        const finalUserInput = mode === 'summarize' && !isInputEmpty 
            ? `Please summarize the following text:\n\n---\n\n${userInput}` 
            : userInput;

        const currentUserParts = [{ text: finalUserInput }, ...fileParts];

        const request: GenerateContentRequest = {
          model: 'gemini-2.5-flash',
          contents: [...history, { role: 'user', parts: currentUserParts }],
          config: {
              systemInstruction: constructSystemInstruction(settings, memory),
          },
        };

        const stream = await aiRef.current.models.generateContentStream(request);

        let firstChunk = true;
        for await (const chunk of stream) {
          const chunkText = chunk.text;
          if (firstChunk) {
            setMessages(prev => [...prev, { role: Role.MODEL, content: chunkText }]);
            firstChunk = false;
          } else {
            setMessages(prev => {
              const updatedMessages = [...prev];
              const lastMessage = updatedMessages[updatedMessages.length - 1];
              if (lastMessage && lastMessage.role === Role.MODEL) {
                lastMessage.content += chunkText;
              }
              return updatedMessages;
            });
          }
        }
      }
    } catch (e: any) {
      const errorMessage = `An error occurred: ${e.message}`;
      setError(errorMessage);
      setMessages(prev => prev.slice(0, prev.length - 1));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, settings, memory, mode]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mode !== 'image' && !dragOver) setDragOver(true);
  }, [dragOver, mode]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (mode !== 'image' && e.dataTransfer.files) {
        const newFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...newFiles].slice(0, MAX_FILES));
    }
  }, [mode]);
  
  const welcomeMessages = {
    chat: {
        title: "Welcome to ThinkChat!",
        subtitle: "Start a conversation by typing a message below."
    },
    image: {
        title: "Image Generation Mode",
        subtitle: "Describe the image you want to create."
    },
    summarize: {
        title: "Summarization Mode",
        subtitle: "Paste text or upload a document to summarize."
    }
  }

  return (
    <div 
        className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 shadow-md">
        <div className="flex items-center">
            <ThinkChatIcon className="w-8 h-8 mr-3 text-cyan-400" />
            <h1 className="text-xl font-bold tracking-wider">ThinkChat</h1>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="Open settings"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
        </div>
      </header>
      
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative">
         {dragOver && (
            <div className="pointer-events-none absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center border-4 border-dashed border-cyan-500 rounded-lg z-10">
                <p className="text-2xl font-bold text-white">Drop files to attach</p>
            </div>
         )}
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 mt-8">
            <h2 className="text-2xl font-semibold">{welcomeMessages[mode].title}</h2>
            <p>{welcomeMessages[mode].subtitle}</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} profession={profession} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === Role.USER && (
            <div className="flex justify-start items-end space-x-3">
              <div className="flex-shrink-0">
                 <ThinkChatIcon className="w-10 h-10 p-2 bg-gray-700 rounded-full text-cyan-400" />
              </div>
              <div className="bg-gray-800 p-3 rounded-lg max-w-lg">
                {mode === 'image' ? (
                    <p className="text-sm text-gray-300">Generating image...</p>
                ) : (
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                )}
              </div>
            </div>
        )}
      </main>

      <footer className="p-4">
        <div className="w-full max-w-3xl mx-auto">
          {error && (
            <div className="text-red-400 text-sm mb-2 text-center p-2 bg-red-900/50 rounded-md">
              {error}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 mb-3">
             <button onClick={() => handleModeChange('chat')} className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full transition-colors ${mode === 'chat' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                <ChatIcon className="w-4 h-4" /> Chat
            </button>
            <button onClick={() => handleModeChange('image')} className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full transition-colors ${mode === 'image' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                <ImageIcon className="w-4 h-4" /> Image
            </button>
             <button onClick={() => handleModeChange('summarize')} className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full transition-colors ${mode === 'summarize' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                <SummarizeIcon className="w-4 h-4" /> Summarize
            </button>
          </div>
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            files={files}
            onFilesChange={setFiles}
            mode={mode}
          />
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;