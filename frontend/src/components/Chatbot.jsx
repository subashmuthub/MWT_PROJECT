// src/components/IntelligentChatbot.jsx - Clean Real Data Chatbot
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function IntelligentChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { user, token } = useAuth();

    const API_BASE_URL = '/api';

    // Quick questions based on real usage
    const quickQuestions = [
        "How many labs do I have?",
        "What equipment is available now?",
        "Show me all computers",
        "Find equipment with SSD",
        "List available labs",
        "Check equipment status"
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            initializeChat();
        }
    }, [isOpen]);

    const initializeChat = () => {
        const welcomeMessage = {
            id: Date.now(),
            text: `Hello ${user?.name || 'there'}! 🤖\n\nI'm your intelligent lab assistant with access to real-time data from your actual lab management system.\n\n**I can help you with:**\n🔢 **Live Counts**: "How many labs/computers do I have?"\n🔍 **Smart Search**: "Find all i7 computers", "Show SSD equipment"\n📊 **Real Status**: "Is computer001 available?"\n📍 **Locations**: "Where is [equipment name]?"\n🔧 **Specifications**: "What are the specs of [equipment]?"\n\n**Try asking about your actual equipment by name!**`,
            isBot: true,
            timestamp: new Date(),
            isWelcome: true
        };
        setMessages([welcomeMessage]);
        setSuggestions(quickQuestions.slice(0, 4));
    };

    const handleSendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim() || isTyping) return;

        const userMessage = {
            id: Date.now(),
            text: messageText.trim(),
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: messageText.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            if (result.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    text: result.data.response,
                    isBot: true,
                    timestamp: new Date(),
                    queryType: result.data.queryType,
                    entities: result.data.entities,
                    specificItem: result.data.specificItem
                };

                setMessages(prev => [...prev, botMessage]);
                setSuggestions(result.data.suggestions || []);
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error('Error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "I'm having trouble accessing the database right now. Please check your connection and try again.",
                isBot: true,
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setSuggestions([]);
        setTimeout(initializeChat, 100);
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-xl transition-all duration-300 z-50 ${isOpen
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 hover:scale-110'
                    }`}
                title={isOpen ? 'Close Real Data Assistant' : 'Open Real Data Assistant'}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                ) : (
                    <div className="relative">
                        <svg className="w-8 h-8 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">AI</span>
                        </div>
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <span className="text-xl">🧠</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Lab AI Assistant</h3>
                                    <p className="text-xs opacity-90">Real-time • Live data • Your actual system</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={clearChat}
                                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                                    title="Clear Chat"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                                    title="Close"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl shadow-sm ${message.isBot
                                        ? message.isError
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-white text-gray-800 border border-gray-200'
                                        : 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-line leading-relaxed">
                                        {message.text}
                                    </p>

                                    {/* Show query info for debugging */}
                                    {message.queryType && message.queryType !== 'general' && (
                                        <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                            Query: {message.queryType}
                                            {message.specificItem && ` | Item: ${message.specificItem}`}
                                        </div>
                                    )}

                                    <p className={`text-xs mt-2 ${message.isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500">Querying your database...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && !isTyping && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-600 mb-2 font-medium">🎯 Try asking:</p>
                            <div className="space-y-1">
                                {suggestions.slice(0, 3).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="w-full text-left text-xs bg-white hover:bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200 transition-colors"
                                        disabled={isTyping}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Questions for first time */}
                    {messages.length <= 1 && !isTyping && (
                        <div className="px-4 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-600 mb-3 font-medium">💡 Quick questions:</p>
                            <div className="space-y-2">
                                {quickQuestions.slice(0, 3).map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSendMessage(question)}
                                        className="w-full text-left text-xs bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                                        disabled={isTyping}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
                        <div className="flex space-x-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about your actual labs & equipment..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                disabled={isTyping}
                                maxLength={500}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={isTyping || !inputMessage.trim()}
                                className="px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg"
                                title="Send message"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            🔥 Your real data • 🎯 Live search • 💾 Actual equipment specs
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

