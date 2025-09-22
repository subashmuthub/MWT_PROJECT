// src/components/Chatbot.jsx - FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [conversationContext, setConversationContext] = useState('general');
    const [messageCount, setMessageCount] = useState(0);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { user } = useAuth();

    // Time-based greeting function - MOVED TO TOP
    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 21) return 'evening';
        return 'night';
    };

    // Comprehensive Lab Management Knowledge Base
    const knowledgeBase = {
        // Greetings & General
        greetings: {
            patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'start', 'help'],
            responses: [
                `Hello ${user?.name || 'there'}! 👋 I'm your Lab Assistant. I can help you with:\n\n📅 Lab booking and scheduling\n🔧 Equipment information\n🛡️ Safety protocols\n📋 Lab policies\n📊 Usage reports\n\nWhat would you like to know?`,
                `Hi ${user?.name || 'there'}! 🔬 Welcome to the Lab Management Assistant. I'm here to help with all your lab-related questions. What can I assist you with today?`,
                `Good ${getTimeOfDay()}! I'm your Lab Assistant, ready to help with bookings, equipment, safety, and more. How can I help you?`
            ],
            suggestions: ['Book a lab', 'Check availability', 'Equipment info', 'Safety protocols']
        },

        // Lab Booking
        booking: {
            patterns: ['book', 'booking', 'reserve', 'schedule', 'appointment', 'when can i', 'available'],
            responses: [
                "To book a lab:\n\n1️⃣ **Navigate**: Go to 'Bookings' or 'Calendar' section\n2️⃣ **Select**: Choose your desired lab type\n3️⃣ **Time**: Pick date and time slot\n4️⃣ **Confirm**: Review details and confirm\n\n💡 **Pro tip**: Book 24-48 hours in advance for better availability!",
                "Lab booking made easy! 📅\n\n**Quick steps:**\n• Calendar → Select Lab → Choose Time\n• Fill booking details\n• Submit for approval\n\n**Need specific help with booking?** I can guide you through each step!",
                "**Booking Process:**\n\n🔍 **Check availability** in Calendar\n📝 **Fill booking form** with:\n   - Purpose of use\n   - Duration needed\n   - Special requirements\n✅ **Submit** and wait for confirmation\n\nWhich lab type are you looking to book?"
            ],
            suggestions: ['Check lab availability', 'Booking requirements', 'How to cancel booking', 'Lab types available']
        },

        // Lab Availability
        availability: {
            patterns: ['available', 'free', 'open', 'when', 'time slots', 'schedule'],
            responses: [
                "To check real-time availability:\n\n📅 **Calendar View**: Shows all labs and time slots\n🟢 **Green** = Available\n🔴 **Red** = Booked\n🟡 **Yellow** = Pending approval\n\n**Best availability times:**\n• Mornings: 8-10 AM\n• Afternoons: 2-4 PM\n• Avoid: 12-1 PM (lunch rush)",
                "**Lab Availability Info:**\n\n✅ **Real-time updates** in Calendar section\n📊 **Peak hours**: 10 AM - 12 PM, 2-5 PM\n🕐 **Best times**: Early morning, late afternoon\n\n**Quick check**: Which specific lab and date?",
                "**Availability Tips:**\n\n🔄 **Updates every 5 minutes**\n📱 **Mobile**: Swipe to see more time slots\n🔔 **Notifications**: Enable for slot alerts\n\nWhich lab are you interested in?"
            ],
            suggestions: ['Computer lab availability', 'Chemistry lab schedule', 'Book now', 'Set availability alert']
        },

        // Equipment Information
        equipment: {
            patterns: ['equipment', 'tools', 'devices', 'machines', 'instruments', 'computer', 'microscope', 'what equipment'],
            responses: [
                "**Equipment by Lab Type:**\n\n🖥️ **Computer Labs:**\n• High-performance PCs\n• Software: AutoCAD, MATLAB, VS Code\n• 3D Printers, Scanners\n\n🧪 **Chemistry Labs:**\n• Fume hoods, Safety showers\n• Analytical instruments\n• pH meters, Spectrophotometers\n\n🔬 **Biology Labs:**\n• Microscopes (light & electron)\n• Incubators, Centrifuges\n• PCR machines, Autoclaves",
                "**Equipment Categories:**\n\n⚡ **Electronics**: Oscilloscopes, Function generators\n🔧 **Mechanical**: Lathes, Milling machines\n🧬 **Biotech**: Cell culture equipment\n📐 **Measurement**: Precision scales, Calipers\n\n**Need specific equipment?** Tell me what you're working on!",
                "**Equipment Access:**\n\n✅ **Training required** for advanced equipment\n📋 **Check-out system** for portable tools\n🛡️ **Safety certification** needed for some items\n\nWhat specific equipment do you need?"
            ],
            suggestions: ['Computer lab equipment', 'Chemistry tools', 'Equipment training', 'How to reserve equipment']
        },

        // Safety Protocols
        safety: {
            patterns: ['safety', 'ppe', 'protection', 'emergency', 'accident', 'rules', 'protocol'],
            responses: [
                "**Lab Safety Essentials:**\n\n🛡️ **Personal Protective Equipment (PPE):**\n• Safety goggles (mandatory)\n• Lab coats/aprons\n• Closed-toe shoes\n• Gloves (nitrile recommended)\n\n🚨 **Emergency Procedures:**\n• Emergency shower locations\n• Fire extinguisher points\n• Emergency contact: (555) 911\n• Report ALL incidents immediately",
                "**Safety by Lab Type:**\n\n🧪 **Chemistry**: Fume hoods, chemical storage rules\n⚡ **Electronics**: Anti-static precautions\n🔬 **Biology**: Biosafety levels, waste disposal\n🔧 **Mechanical**: Machine guards, lockout procedures\n\n**Remember**: Safety training is MANDATORY before first use!",
                "**Key Safety Rules:**\n\n❌ **Never work alone** in hazardous areas\n✅ **Always wear appropriate PPE**\n📋 **Read MSDS** before using chemicals\n🔐 **Lock equipment** when finished\n🧹 **Clean workspace** after use\n\n**Emergency contacts posted in every lab!**"
            ],
            suggestions: ['PPE requirements', 'Emergency procedures', 'Chemical safety', 'Incident reporting']
        },

        // Cancellation & Changes
        cancellation: {
            patterns: ['cancel', 'delete', 'remove', 'change', 'modify', 'reschedule'],
            responses: [
                "**To Cancel/Modify Booking:**\n\n1️⃣ **My Bookings** → Find reservation\n2️⃣ **Actions** → Cancel/Modify\n3️⃣ **Confirm** → Submit changes\n\n⚠️ **Cancellation Policy:**\n• **2+ hours advance**: No penalty\n• **Less than 2 hours**: May affect future bookings\n• **No-show**: Booking privileges suspended",
                "**Modification Options:**\n\n🕐 **Time change**: Subject to availability\n👥 **Add/remove users**: Update participant list\n📝 **Purpose change**: Edit booking description\n\n**Need help modifying?** Tell me what you want to change!",
                "**Quick Actions:**\n\n📱 **Mobile**: Swipe left on booking to cancel\n💻 **Desktop**: Click 'Actions' menu\n📧 **Email**: Reply to confirmation email\n\n**Emergency cancellation**: Contact lab admin directly"
            ],
            suggestions: ['View my bookings', 'Cancellation policy', 'Reschedule booking', 'Contact admin']
        },

        // Training & Support
        training: {
            patterns: ['training', 'certification', 'course', 'learn', 'how to use', 'qualify'],
            responses: [
                "**Required Training:**\n\n🛡️ **General Lab Safety** (mandatory for all)\n🧪 **Chemical Handling** (chemistry labs)\n⚡ **Electrical Safety** (electronics labs)\n🔬 **Biosafety** (biology labs)\n\n**Training Schedule:**\n• Online modules: Available 24/7\n• Hands-on sessions: Tuesdays & Thursdays\n• Certification valid for 1 year",
                "**Equipment-Specific Training:**\n\n🔬 **Microscopy Certification**: 2-hour session\n🖨️ **3D Printer Training**: 1-hour session\n⚗️ **Advanced Chemistry**: 4-hour course\n🔧 **Machine Shop Safety**: Half-day workshop\n\n**Book training through the Training section**"
            ],
            suggestions: ['Schedule training', 'View certificates', 'Training requirements', 'Online courses']
        },

        // Technical Support
        support: {
            patterns: ['support', 'help', 'problem', 'issue', 'broken', 'not working', 'error'],
            responses: [
                "**Technical Support:**\n\n🔧 **Equipment Issues**:\n• Report immediately to lab staff\n• Don't attempt repairs yourself\n• Use 'Report Issue' button in app\n\n📞 **Contact Info**:\n• Lab Support: (555) 123-LABS\n• Emergency: (555) 911\n• Email: support@labmanagement.edu",
                "**Common Issues & Solutions:**\n\n💻 **Computer not starting**: Check power, report if needed\n🔬 **Equipment malfunction**: Stop use, tag as broken\n🚪 **Access card not working**: Contact security\n📱 **App problems**: Clear cache, restart\n\n**Always prioritize safety over fixing issues!**"
            ],
            suggestions: ['Report equipment issue', 'Contact information', 'Emergency procedures', 'App problems']
        }
    };

    // Quick action buttons for common tasks
    const quickActions = [
        { text: "📅 Book a lab", query: "How do I book a lab?" },
        { text: "🔍 Check availability", query: "How to check lab availability?" },
        { text: "🔧 Equipment info", query: "What equipment is available?" },
        { text: "🛡️ Safety rules", query: "Lab safety protocols" },
        { text: "📋 My bookings", query: "How to view my bookings?" },
        { text: "❌ Cancel booking", query: "How to cancel a booking?" }
    ];

    // Initialize chat with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage = {
                id: 1,
                text: `Hello ${user?.name || 'there'}! 👋 I'm your Lab Assistant.\n\nI can help you with:\n📅 Lab bookings\n🔧 Equipment info\n🛡️ Safety protocols\n📋 Policies & procedures\n\nWhat would you like to know?`,
                isBot: true,
                timestamp: new Date(),
                type: 'welcome'
            };
            setMessages([welcomeMessage]);
            setSuggestions(['Book a lab', 'Check availability', 'Equipment info', 'Safety protocols']);
        }
    }, [isOpen, messages.length, user?.name]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    // Smart response generation
    const generateResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase().trim();
        setMessageCount(prev => prev + 1);

        // Find best matching category
        let matchedCategory = null;
        let bestMatch = null;
        let highestScore = 0;

        for (const [category, config] of Object.entries(knowledgeBase)) {
            for (const pattern of config.patterns) {
                if (lowerMessage.includes(pattern)) {
                    const score = pattern.length;
                    if (score > highestScore) {
                        highestScore = score;
                        matchedCategory = category;
                        bestMatch = config;
                    }
                }
            }
        }

        if (bestMatch) {
            setConversationContext(matchedCategory);
            const responses = bestMatch.responses;
            const response = responses[Math.floor(Math.random() * responses.length)];
            return {
                text: response,
                suggestions: bestMatch.suggestions || []
            };
        }

        // Handle specific queries
        if (lowerMessage.includes('my booking') || lowerMessage.includes('my reservation')) {
            return {
                text: "To view your bookings:\n\n📱 **Mobile**: Tap 'My Bookings' in menu\n💻 **Desktop**: Click 'My Bookings' in sidebar\n📧 **Email**: Check confirmation emails\n\nYour upcoming bookings will show with dates, times, and lab details.",
                suggestions: ['Cancel a booking', 'Modify booking', 'Booking history']
            };
        }

        if (lowerMessage.includes('hours') || lowerMessage.includes('open')) {
            return {
                text: "**Lab Hours:**\n\n🖥️ **Computer Labs**: 24/7 (with access card)\n🧪 **Chemistry Labs**: 8 AM - 10 PM\n🔬 **Biology Labs**: 6 AM - 11 PM\n⚡ **Electronics Labs**: 8 AM - 8 PM\n🔧 **Mechanical Shop**: 9 AM - 5 PM\n\n**Note**: Some labs have restricted weekend hours.",
                suggestions: ['Access card info', 'Weekend hours', 'After-hours access']
            };
        }

        // Default helpful response
        const defaultResponses = [
            "I'd be happy to help! I can assist with:\n\n📅 **Lab Bookings**: Schedule, modify, cancel\n🔧 **Equipment**: Info, training, availability\n🛡️ **Safety**: Protocols, PPE, emergency procedures\n📋 **Policies**: Rules, guidelines, procedures\n\nWhat specific topic interests you?",
            "I'm here to help with your lab management needs! Try asking about:\n\n• How to book a specific lab\n• Equipment training requirements\n• Safety protocols for your project\n• Lab policies and guidelines\n\nWhat would you like to know?"
        ];

        return {
            text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
            suggestions: ['Book a lab', 'Equipment info', 'Safety protocols', 'Training courses']
        };
    };

    // Send message handler
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

        // Simulate typing delay
        const typingDelay = Math.min(messageText.length * 30 + 500, 2000);

        setTimeout(() => {
            const response = generateResponse(messageText);

            const botMessage = {
                id: Date.now() + 1,
                text: response.text,
                isBot: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setSuggestions(response.suggestions || []);
            setIsTyping(false);
        }, typingDelay);
    };

    // Keyboard handlers
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Clear chat
    const clearChat = () => {
        setMessages([]);
        setSuggestions([]);
        setConversationContext('general');
        setMessageCount(0);
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-xl transition-all duration-300 z-50 ${isOpen
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-110'
                    }`}
                title={isOpen ? 'Close Lab Assistant' : 'Open Lab Assistant'}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                ) : (
                    <div className="relative">
                        <svg className="w-7 h-7 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <span className="text-xl">🔬</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Lab Assistant</h3>
                                    <p className="text-xs opacity-90">Always here to help!</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={clearChat}
                                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                                    title="Clear Chat"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
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
                                            ? 'bg-white text-gray-800 border border-gray-200'
                                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                                    <p className={`text-xs mt-2 ${message.isBot ? 'text-gray-500' : 'text-blue-100'
                                        }`}>
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
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && !isTyping && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-600 mb-2 font-medium">💡 Quick suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.slice(0, 4).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="text-xs bg-white hover:bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 transition-colors"
                                        disabled={isTyping}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    {messages.length <= 1 && !isTyping && (
                        <div className="px-4 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-600 mb-3 font-medium">🚀 Popular actions:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSendMessage(action.query)}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-2 rounded-lg text-left transition-colors"
                                        disabled={isTyping}
                                    >
                                        {action.text}
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
                                placeholder="Ask me anything about labs..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                disabled={isTyping}
                                maxLength={500}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={isTyping || !inputMessage.trim()}
                                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg"
                                title="Send message"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            💡 Tip: Ask specific questions for better help!
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}