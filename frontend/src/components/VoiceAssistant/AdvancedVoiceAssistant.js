import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdvancedVoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState('en');
  const [voice, setVoice] = useState('alloy');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [conversationMode, setConversationMode] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const { wallet } = useWallet();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      // Send welcome message
      addMessage('assistant', 'Hello! I\'m Mr. Happy, your cricket assistant. How can I help you today?');
    }
  }, [isOpen, isAuthenticated]);

  const addMessage = useCallback((sender, text, audioData = null) => {
    const message = {
      id: Date.now(),
      sender,
      text,
      audioData,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    
    // Auto-speak assistant responses
    if (sender === 'assistant' && autoSpeak && audioData) {
      playAudio(audioData);
    }
  }, [autoSpeak]);

  const playAudio = (audioData) => {
    try {
      const audio = new Audio(audioData);
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
      console.log('Audio creation failed:', e);
    }
  };

  const sendTextMessage = async (text) => {
    if (!text.trim() || !isAuthenticated) return;
    
    setIsProcessing(true);
    addMessage('user', text);
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/voice/chat`,
        {
          message: text,
          session_id: `session_${Date.now()}`
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const aiResponse = response.data.response;
      addMessage('assistant', aiResponse);
      
      // Auto-speak response if enabled
      if (autoSpeak && aiResponse) {
        speakText(aiResponse);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error.response?.data?.detail || 'Sorry, I had trouble processing your message. Please try again.';
      addMessage('assistant', errorMessage);
      toast.error('Failed to get response from Mr. Happy');
    } finally {
      setIsProcessing(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('🎤 Recording started');

    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Microphone access denied or unavailable');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      toast.success('🎤 Recording stopped, processing...');
    }
  };

  const processVoiceInput = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'voice_input.webm');
      formData.append('language', language);
      formData.append('voice', voice);

      // Use full interaction endpoint for complete voice processing
      const response = await axios.post(`${backendUrl}/api/voice/full-interaction`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const { transcript, response_text, response_audio } = response.data;

      // Add user message (transcript)
      addMessage('user', transcript);
      
      // Add assistant response with audio
      addMessage('assistant', response_text, response_audio);

    } catch (error) {
      console.error('Voice processing error:', error);
      addMessage('assistant', "I couldn't understand that. Could you please try speaking again or type your message?");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    if (isAuthenticated) {
      addMessage('assistant', 'Conversation cleared! How can I help you?');
    }
  };

  const toggleConversationMode = () => {
    setConversationMode(!conversationMode);
    if (!conversationMode) {
      toast.success('Conversation mode enabled - I\'ll keep listening!');
    } else {
      toast.success('Conversation mode disabled');
    }
  };

  const getStatusColor = () => {
    if (isRecording) return 'bg-red-500 animate-pulse';
    if (isProcessing) return 'bg-yellow-500 animate-spin';
    return 'bg-green-500';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendTextMessage(inputText);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Voice Assistant Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg transition-all duration-300 z-50 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-happy-500 to-happy-600 hover:from-happy-600 hover:to-happy-700'
        }`}
      >
        {isOpen ? (
          <svg className="w-8 h-8 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="text-3xl">🤖</div>
        )}
        
        {/* Status indicator */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor()}`}></div>
      </button>

      {/* Voice Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-40 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="text-2xl">🤖</div>
                <div>
                  <h3 className="text-white font-semibold">Mr. Happy</h3>
                  <p className="text-xs text-gray-400">Your Cricket AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                <span className="text-xs text-gray-400">
                  {isRecording ? 'Recording' : isProcessing ? 'Processing' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Settings Row */}
            <div className="flex items-center space-x-2 text-xs">
              {/* Language Toggle */}
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 text-white rounded px-2 py-1 text-xs"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>

              {/* Voice Selection */}
              <select 
                value={voice} 
                onChange={(e) => setVoice(e.target.value)}
                className="bg-gray-700 text-white rounded px-2 py-1 text-xs"
              >
                <option value="alloy">Alloy</option>
                <option value="echo">Echo</option>
                <option value="fable">Fable</option>
                <option value="onyx">Onyx</option>
                <option value="nova">Nova</option>
                <option value="shimmer">Shimmer</option>
              </select>

              {/* Auto Speak Toggle */}
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`px-2 py-1 rounded text-xs ${
                  autoSpeak ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}
              >
                🔊
              </button>

              {/* Clear button */}
              <button
                onClick={clearConversation}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs text-white"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm">
                <p>👋 Hi {user?.full_name}! I'm Mr. Happy!</p>
                <p className="mt-2">I can help you with:</p>
                <ul className="mt-1 text-xs space-y-1">
                  <li>• Checking your wallet balance ({wallet?.happy_coin_balance?.toFixed(2) || '0.00'} HC)</li>
                  <li>• Live cricket matches and odds</li>
                  <li>• Placing bets with voice commands</li>
                  <li>• Platform navigation and support</li>
                </ul>
                <p className="mt-2 text-xs">🎤 Hold the record button or type to start!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-happy-500 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="flex-1">{message.text}</p>
                    {message.audioData && (
                      <button
                        onClick={() => playAudio(message.audioData)}
                        className="ml-2 text-blue-400 hover:text-blue-300"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-200 p-3 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span>Mr. Happy is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Controls */}
          <div className="p-4 border-t border-gray-700">
            {/* Voice Controls */}
            <div className="flex items-center space-x-2 mb-3">
              <button
                onMouseDown={startVoiceRecording}
                onMouseUp={stopVoiceRecording}
                onTouchStart={startVoiceRecording}
                onTouchEnd={stopVoiceRecording}
                disabled={isProcessing}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50`}
              >
                {isRecording ? '🎤 Recording...' : '🎤 Hold to Talk'}
              </button>
              
              <button
                onClick={toggleConversationMode}
                className={`px-3 py-3 rounded-lg transition-colors ${
                  conversationMode 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                💬
              </button>
            </div>

            {/* Text Input */}
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-happy-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="px-4 py-2 bg-happy-500 text-white rounded-lg hover:bg-happy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>

            {/* Quick Actions */}
            <div className="flex space-x-2 mt-2 text-xs">
              <button
                onClick={() => sendTextMessage("What's my balance?")}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
              >
                Balance
              </button>
              <button
                onClick={() => sendTextMessage("Show live matches")}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
              >
                Matches
              </button>
              <button
                onClick={() => sendTextMessage("Help me with betting")}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
              >
                Help
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvancedVoiceAssistant;