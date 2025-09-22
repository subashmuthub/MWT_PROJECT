// routes/chatbot.js - Completely Free Chatbot
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Comprehensive knowledge base
const labKnowledgeBase = {
    // Greetings
    greetings: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'start'],
        responses: [
            "Hello! 👋 I'm your Lab Assistant. I can help you with lab bookings, equipment info, and answer questions about our lab system. What would you like to know?",
            "Hi there! 🔬 I'm here to help with anything lab-related. How can I assist you today?",
            "Welcome! I can help you navigate the lab management system. What do you need help with?"
        ]
    },

    // Lab Booking
    booking: {
        patterns: ['book', 'booking', 'reserve', 'schedule', 'appointment'],
        responses: [
            "To book a lab:\n1️⃣ Go to 'Bookings' section\n2️⃣ Select your desired lab\n3️⃣ Choose date and time\n4️⃣ Confirm booking\n\nYou can also use the Calendar view to see availability!",
            "Lab booking is easy! Navigate to Calendar → Select Lab → Choose Time → Confirm. Need help with a specific step?",
            "I can guide you through booking! Which lab are you interested in? Computer Lab, Chemistry Lab, or another type?"
        ]
    },

    // Lab Availability
    availability: {
        patterns: ['available', 'free', 'when', 'time', 'open'],
        responses: [
            "To check lab availability:\n📅 Go to Calendar section\n🔍 Select the date you need\n👀 Green slots = Available\n🔴 Red slots = Booked",
            "Lab availability changes in real-time! Check the Calendar section for the most up-to-date schedule.",
            "Which specific lab and date are you checking? The Calendar view shows all available time slots."
        ]
    },

    // Equipment
    equipment: {
        patterns: ['equipment', 'tools', 'devices', 'machines', 'computer', 'microscope'],
        responses: [
            "Our labs have different equipment:\n🖥️ Computer Labs: PCs, Software, Printers\n🧪 Chemistry Labs: Fume hoods, Analytical instruments\n🔬 Biology Labs: Microscopes, Incubators\n\nCheck the Equipment section for detailed lists!",
            "Equipment varies by lab type. Visit the Equipment section to see what's available in each lab. What specific equipment do you need?",
            "Looking for specific equipment? Each lab has detailed equipment lists in the Equipment section. What are you working on?"
        ]
    },

    // Safety
    safety: {
        patterns: ['safety', 'rules', 'protocol', 'ppe', 'emergency'],
        responses: [
            "Safety First! 🛡️\n• Always wear required PPE\n• Follow lab-specific protocols\n• Report incidents immediately\n• Complete safety training\n• Know emergency procedures",
            "Lab safety is crucial! Check each lab's specific safety guidelines before use. Have you completed the required safety training?",
            "Safety protocols vary by lab type. Chemistry labs require different PPE than computer labs. Which lab are you using?"
        ]
    },

    // Cancellation
    cancellation: {
        patterns: ['cancel', 'delete', 'remove', 'change'],
        responses: [
            "To cancel a booking:\n1️⃣ Go to 'My Bookings'\n2️⃣ Find your booking\n3️⃣ Click 'Cancel'\n4️⃣ Confirm cancellation\n\n⚠️ Please cancel at least 2 hours before your scheduled time!",
            "Need to cancel? Go to My Bookings → Find your reservation → Cancel. Remember the 2-hour cancellation policy!",
            "Cancellations should be made at least 2 hours in advance. Check 'My Bookings' to manage your reservations."
        ]
    },

    // Lab Types
    lab_types: {
        patterns: ['computer lab', 'chemistry lab', 'biology lab', 'physics lab', 'research lab'],
        responses: [
            "We have several lab types:\n🖥️ Computer Labs - Programming, Software development\n🧪 Chemistry Labs - Chemical experiments, Analysis\n🔬 Biology Labs - Life sciences, Microscopy\n⚡ Physics Labs - Experiments, Measurements\n🔬 Research Labs - Advanced projects",
            "Each lab type serves different purposes. Which field are you working in? I can provide specific information about that lab type.",
            "Our labs are equipped for different disciplines. What subject area do you need the lab for?"
        ]
    },

    // Training
    training: {
        patterns: ['training', 'course', 'learn', 'how to use'],
        responses: [
            "Lab training is important! 📚\n• Check Training section for available courses\n• Complete required safety training\n• Equipment-specific training available\n• Online and in-person options",
            "Need training? Visit the Training section to see available courses and schedules. Safety training is mandatory for most labs!",
            "Training courses are available for different equipment and lab types. What specific training do you need?"
        ]
    },

    // Contact/Support
    support: {
        patterns: ['help', 'support', 'contact', 'problem', 'issue', 'trouble'],
        responses: [
            "Need more help? 🆘\n📧 Email: support@labmanagement.com\n📞 Phone: (555) 123-4567\n🕒 Hours: Mon-Fri 8AM-6PM\n💬 You can also ask me more questions!",
            "I'm here to help! If you need human assistance, contact our support team. What specific issue are you facing?",
            "Having trouble? Try describing your problem in more detail, or contact our support team for personalized help."
        ]
    },

    // Policies
    policies: {
        patterns: ['policy', 'rule', 'regulation', 'allowed', 'permitted'],
        responses: [
            "Lab Policies:\n• Max 2-hour booking sessions\n• Cancel 2+ hours in advance\n• Complete required training\n• Follow safety protocols\n• No food/drinks in labs\n• Report any issues immediately",
            "Our policies ensure fair access and safety for everyone. Which specific policy do you want to know about?",
            "Lab policies are in place for everyone's safety and fair access. Check the Policies section for complete details."
        ]
    }
};

// Quick actions for common tasks
const quickActions = {
    'book computer lab': "To book a Computer Lab: Go to Bookings → Select Computer Lab → Choose your time slot. Computer labs are great for programming and software work!",
    'check my bookings': "To see your bookings: Go to 'My Bookings' section or check the Calendar view. You'll see all your upcoming reservations there!",
    'cancel booking': "To cancel: My Bookings → Find booking → Click Cancel → Confirm. Remember to cancel at least 2 hours before your scheduled time!",
    'lab hours': "Lab hours vary by type:\n🖥️ Computer Labs: 24/7 (with access card)\n🧪 Chemistry Labs: 8AM-10PM\n🔬 Biology Labs: 6AM-11PM\nCheck specific lab details for exact hours!",
    'emergency': "🚨 EMERGENCY: Call Campus Security (555) 911 or 911\nFor non-emergencies: Contact lab support (555) 123-4567\nAlways prioritize safety!"
};

// Enhanced response generation
function generateResponse(message) {
    const lowerMessage = message.toLowerCase().trim();

    // Check for quick actions first
    for (const [action, response] of Object.entries(quickActions)) {
        if (lowerMessage.includes(action.toLowerCase())) {
            return response;
        }
    }

    // Check knowledge base
    for (const [category, config] of Object.entries(labKnowledgeBase)) {
        for (const pattern of config.patterns) {
            if (lowerMessage.includes(pattern)) {
                const responses = config.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }

    // Handle specific questions
    if (lowerMessage.includes('how many') || lowerMessage.includes('what time')) {
        return "For specific numbers and times, please check the relevant section in the app (Calendar, Equipment, etc.) for the most up-to-date information!";
    }

    if (lowerMessage.includes('where') || lowerMessage.includes('location')) {
        return "Lab locations are shown in the Lab Management section. Each lab has detailed location information including building and room numbers!";
    }

    if (lowerMessage.includes('who') || lowerMessage.includes('contact')) {
        return "For contacts: Check the lab details or contact our support team at support@labmanagement.com or (555) 123-4567.";
    }

    // Default responses with helpful suggestions
    const defaultResponses = [
        "I'm not sure about that specific question, but I can help with:\n• Lab bookings and scheduling\n• Equipment information\n• Safety protocols\n• General lab policies\n\nTry asking about one of these topics!",
        "Could you rephrase that? I can help with lab bookings, equipment info, safety rules, or general questions about the lab system.",
        "I didn't quite understand. Here are some things I can help with:\n📅 Booking labs\n🔧 Equipment information\n🛡️ Safety protocols\n📋 Lab policies\n\nWhat would you like to know?",
        "I'm still learning! I can definitely help with lab bookings, equipment, safety, and policies. Could you ask about one of these areas?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Chat endpoint
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user.id;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get or create conversation
        let conversation = await getOrCreateConversation(userId, sessionId);

        // Save user message
        await saveMessage(conversation.id, message, 'user');

        // Generate response
        const response = generateResponse(message);

        // Save bot response
        await saveMessage(conversation.id, response, 'bot');

        res.json({
            success: true,
            data: {
                response,
                sessionId: conversation.session_id,
                suggestions: getSuggestions(message)
            }
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: "Sorry, I'm having trouble right now. Please try again or contact support!"
        });
    }
});

// Generate contextual suggestions
function getSuggestions(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('book')) {
        return ['Check lab availability', 'View my bookings', 'Lab booking policies'];
    }

    if (lowerMessage.includes('equipment')) {
        return ['Computer lab equipment', 'Chemistry lab tools', 'Safety equipment'];
    }

    if (lowerMessage.includes('safety')) {
        return ['PPE requirements', 'Emergency procedures', 'Training courses'];
    }

    return ['How to book a lab', 'Lab availability', 'Equipment information', 'Safety protocols'];
}

// Helper functions (implement these based on your database setup)
async function getOrCreateConversation(userId, sessionId) {
    // Implementation for database operations
    const conversationId = `${userId}_${sessionId}`;
    return {
        id: conversationId,
        session_id: sessionId,
        user_id: userId
    };
}

async function saveMessage(conversationId, message, type) {
    // Implementation for saving messages to database
    console.log(`Saving ${type} message:`, message);
}

module.exports = router;