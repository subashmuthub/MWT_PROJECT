// routes/chatbot.js - Complete Corrected Version
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { sequelize } = require('../config/database');

class IntelligentLabAssistant {
    constructor() {
        this.queryParsers = {
            count: {
                patterns: ['how many', 'total', 'count of', 'number of'],
                entities: ['labs', 'equipment', 'bookings', 'computers', 'microscopes']
            },
            availability: {
                patterns: ['available', 'free', 'open', 'vacant', 'not booked'],
                entities: ['labs', 'equipment', 'computers', 'today', 'tomorrow', 'now']
            },
            specifications: {
                patterns: ['specs', 'specification', 'details', 'what is', 'tell me about'],
                entities: ['computer', 'laptop', 'server', 'microscope', 'equipment']
            },
            search: {
                patterns: ['find', 'search', 'show me', 'list', 'which'],
                entities: ['i7', 'i5', 'i9', 'ram', 'ssd', 'hdd', 'gpu', 'processor', 'cpu']
            },
            location: {
                patterns: ['where is', 'location of', 'find location', 'which room'],
                entities: ['lab', 'equipment', 'computer']
            },
            status: {
                patterns: ['status of', 'condition', 'working', 'broken', 'maintenance'],
                entities: ['equipment', 'lab', 'computer']
            }
        };
    }

    async parseQuery(message) {
        const lowerMessage = message.toLowerCase();
        let queryType = 'general';
        let entities = [];
        let specificItem = null;
        let confidence = 0.5;

        // Determine query type
        for (const [type, config] of Object.entries(this.queryParsers)) {
            for (const pattern of config.patterns) {
                if (lowerMessage.includes(pattern)) {
                    queryType = type;
                    confidence = 0.8;
                    break;
                }
            }
        }

        // Extract entities
        for (const [type, config] of Object.entries(this.queryParsers)) {
            for (const entity of config.entities) {
                if (lowerMessage.includes(entity)) {
                    entities.push(entity);
                    confidence += 0.1;
                }
            }
        }

        // Extract specific equipment names (like computer001, microscope02)
        const equipmentPattern = /([a-zA-Z]+\d+)/g;
        const matches = message.match(equipmentPattern);
        if (matches) {
            specificItem = matches[0];
            confidence += 0.2;
        }

        // Extract lab types
        const labPattern = /(lab\s*\w*\d*|chemistry|biology|computer|physics|research)/gi;
        const labMatches = message.match(labPattern);
        if (labMatches) {
            entities.push(...labMatches);
        }

        return {
            queryType,
            entities,
            specificItem,
            confidence: Math.min(confidence, 1.0),
            originalMessage: message
        };
    }

    generateQuery(parsedQuery) {
        const { queryType, entities, specificItem } = parsedQuery;

        switch (queryType) {
            case 'count':
                return this.generateCountQuery(entities);
            case 'availability':
                return this.generateAvailabilityQuery(entities);
            case 'specifications':
                return this.generateSpecQuery(specificItem, entities);
            case 'search':
                return this.generateSearchQuery(entities);
            case 'location':
                return this.generateLocationQuery(specificItem, entities);
            case 'status':
                return this.generateStatusQuery(specificItem, entities);
            default:
                return null;
        }
    }

    generateCountQuery(entities) {
        if (entities.includes('labs')) {
            return {
                // Fixed: use is_active instead of status
                query: 'SELECT COUNT(*) as count, lab_type FROM labs WHERE is_active = 1 GROUP BY lab_type',
                type: 'lab_count'
            };
        }
        if (entities.includes('equipment')) {
            return {
                query: `SELECT COUNT(*) as count, category as equipment_type FROM equipment GROUP BY category`,
                type: 'equipment_count'
            };
        }
        if (entities.includes('computers')) {
            return {
                query: `SELECT COUNT(*) as count, 
                       COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
                       COUNT(CASE WHEN status = 'in_use' THEN 1 END) as in_use,
                       COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance
                       FROM equipment WHERE category = 'computer'`,
                type: 'computer_count'
            };
        }
        return null;
    }

    generateAvailabilityQuery(entities) {
        if (entities.includes('labs')) {
            return {
                // Safe query that only uses labs table
                query: `SELECT 
                       id,
                       name,
                       description,
                       location,
                       lab_type,
                       capacity,
                       'available' as availability_status
                   FROM labs 
                   WHERE is_active = 1
                   ORDER BY name`,
                type: 'lab_availability'
            };
        }

        if (entities.includes('equipment') || entities.includes('computers')) {
            // Check if equipment table exists first
            return {
                query: `SELECT 
                       'No equipment data available yet' as message`,
                type: 'equipment_availability'
            };
        }

        return null;
    }

    generateSpecQuery(specificItem, entities) {
        if (specificItem) {
            return {
                query: `SELECT e.*, es.*, l.name as lab_name, l.location as lab_location
                       FROM equipment e
                       LEFT JOIN equipment_specifications es ON e.id = es.equipment_id
                       JOIN labs l ON e.lab_id = l.id
                       WHERE (e.name = '${specificItem}' OR e.serial_number = '${specificItem}')
                       AND l.is_active = 1`,
                type: 'specific_equipment'
            };
        }

        return {
            query: `SELECT e.*, es.*, l.name as lab_name
                   FROM equipment e
                   LEFT JOIN equipment_specifications es ON e.id = es.equipment_id
                   JOIN labs l ON e.lab_id = l.id
                   WHERE e.category IN ('computer', 'laptop', 'server')
                   AND l.is_active = 1
                   ORDER BY e.name`,
            type: 'equipment_specs'
        };
    }

    generateSearchQuery(entities) {
        let conditions = [];

        if (entities.some(e => ['i7', 'i5', 'i9', 'cpu', 'processor'].includes(e))) {
            const processor = entities.find(e => ['i7', 'i5', 'i9'].includes(e));
            if (processor) {
                conditions.push(`es.cpu LIKE '%${processor}%'`);
            }
        }

        if (entities.includes('ram')) {
            conditions.push('es.ram IS NOT NULL');
        }

        if (entities.includes('ssd') || entities.includes('hdd')) {
            const storageType = entities.includes('ssd') ? 'ssd' : 'hdd';
            conditions.push(`es.storage LIKE '%${storageType}%'`);
        }

        const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

        return {
            query: `SELECT e.*, es.*, l.name as lab_name, l.location as lab_location
                   FROM equipment e
                   LEFT JOIN equipment_specifications es ON e.id = es.equipment_id
                   JOIN labs l ON e.lab_id = l.id
                   WHERE e.category IN ('computer', 'laptop', 'server') 
                   AND l.is_active = 1 ${whereClause}
                   ORDER BY e.name`,
            type: 'equipment_search'
        };
    }

    generateLocationQuery(specificItem, entities) {
        if (specificItem) {
            return {
                query: `SELECT e.name, e.category, l.name as lab_name, 
                       l.location as lab_location, l.description
                       FROM equipment e
                       JOIN labs l ON e.lab_id = l.id
                       WHERE (e.name = '${specificItem}' OR e.serial_number = '${specificItem}')
                       AND l.is_active = 1`,
                type: 'equipment_location'
            };
        }
        return null;
    }

    generateStatusQuery(specificItem, entities) {
        if (specificItem) {
            return {
                query: `SELECT e.*, l.name as lab_name
                       FROM equipment e
                       JOIN labs l ON e.lab_id = l.id
                       WHERE (e.name = '${specificItem}' OR e.serial_number = '${specificItem}')
                       AND l.is_active = 1`,
                type: 'equipment_status'
            };
        }
        return null;
    }
}

const labAssistant = new IntelligentLabAssistant();

// Response formatters
const responseFormatters = {
    lab_count: (data) => {
        if (!data || data.length === 0) {
            return "📊 No active labs found in the system.";
        }
        const total = data.reduce((sum, item) => sum + item.count, 0);
        const breakdown = data.map(item => `• ${item.lab_type.replace('_', ' ')}: ${item.count}`).join('\n');
        return `📊 **Lab Count**: You have **${total} active labs** in total:\n\n${breakdown}`;
    },

    lab_availability: (data) => {
        if (!data || data.length === 0) {
            return "🏢 No active labs found in the system.";
        }

        let response = `🏢 **Lab Availability** (${data.length} labs):\n\n`;

        data.forEach(lab => {
            response += `**${lab.name}**\n`;
            response += `📍 Location: ${lab.location || 'Not specified'}\n`;
            response += `🏷️ Type: ${lab.lab_type.replace('_', ' ')}\n`;
            response += `👥 Capacity: ${lab.capacity || 'Not specified'}\n`;
            response += `📊 Status: ${lab.availability_status}\n`;

            if (lab.availability_status === 'booked') {
                response += `👤 Booked by: ${lab.booked_by}\n`;
                response += `⏰ Until: ${new Date(lab.end_time).toLocaleString()}\n`;
            }
            response += `\n`;
        });

        return response;
    },

    equipment_count: (data) => {
        if (!data || data.length === 0) {
            return "🔧 No equipment found in the system.";
        }
        const total = data.reduce((sum, item) => sum + item.count, 0);
        const breakdown = data.map(item => `• ${item.equipment_type}: ${item.count}`).join('\n');
        return `🔧 **Equipment Count**: **${total} total equipment**:\n\n${breakdown}`;
    },

    computer_count: (data) => {
        if (!data || data.length === 0) {
            return "💻 No computers found in the system.";
        }
        const item = data[0];
        return `💻 **Computer Inventory**:\n\n• **Total**: ${item.count} computers\n• **Available**: ${item.available}\n• **In Use**: ${item.in_use}\n• **Maintenance**: ${item.maintenance}`;
    },

    equipment_availability: (data) => {
        if (!data || data.length === 0) {
            return "🔧 No available equipment found.";
        }

        let response = `🔧 **Available Equipment** (${data.length} items):\n\n`;

        data.forEach(equipment => {
            response += `**${equipment.name}**\n`;
            response += `📍 ${equipment.lab_name} - ${equipment.lab_location}\n`;
            response += `🏷️ Type: ${equipment.category}\n`;
            response += `📊 Status: ${equipment.status}\n\n`;
        });

        return response;
    },

    specific_equipment: (data) => {
        if (!data || data.length === 0) {
            return `❌ Equipment not found. Please check the name and try again.`;
        }

        const equipment = data[0];
        let response = `🔧 **${equipment.name}** Details:\n\n`;
        response += `📍 **Location**: ${equipment.lab_name} - ${equipment.lab_location}\n`;
        response += `🏷️ **Type**: ${equipment.category}\n`;
        response += `📊 **Status**: ${equipment.status}\n`;

        if (equipment.cpu) response += `🖥️ **CPU**: ${equipment.cpu}\n`;
        if (equipment.ram) response += `💾 **RAM**: ${equipment.ram}\n`;
        if (equipment.storage) response += `💽 **Storage**: ${equipment.storage}\n`;
        if (equipment.gpu) response += `🎮 **GPU**: ${equipment.gpu}\n`;
        if (equipment.operating_system) response += `💿 **OS**: ${equipment.operating_system}\n`;
        if (equipment.serial_number) response += `🔢 **Serial**: ${equipment.serial_number}\n`;
        if (equipment.purchase_date) response += `📅 **Purchase Date**: ${new Date(equipment.purchase_date).toLocaleDateString()}\n`;

        return response;
    },

    equipment_search: (data) => {
        if (!data || data.length === 0) {
            return `❌ No equipment found matching your criteria.`;
        }

        let response = `🔍 **Search Results** (${data.length} found):\n\n`;

        data.forEach(equipment => {
            response += `**${equipment.name}**\n`;
            response += `📍 ${equipment.lab_name} - ${equipment.lab_location}\n`;
            if (equipment.cpu) response += `🖥️ CPU: ${equipment.cpu}\n`;
            if (equipment.ram) response += `💾 RAM: ${equipment.ram}\n`;
            if (equipment.storage) response += `💽 Storage: ${equipment.storage}\n`;
            response += `📊 Status: ${equipment.status}\n\n`;
        });

        return response;
    },

    equipment_location: (data) => {
        if (!data || data.length === 0) {
            return `❌ Equipment not found. Please check the name and try again.`;
        }

        const equipment = data[0];
        return `📍 **${equipment.name}** Location:\n\n🏢 **Lab**: ${equipment.lab_name}\n📍 **Address**: ${equipment.lab_location}\n🏷️ **Type**: ${equipment.category}`;
    },

    equipment_status: (data) => {
        if (!data || data.length === 0) {
            return `❌ Equipment not found. Please check the name and try again.`;
        }

        const equipment = data[0];
        return `📊 **${equipment.name}** Status:\n\n📊 **Current Status**: ${equipment.status}\n📍 **Location**: ${equipment.lab_name}\n🏷️ **Type**: ${equipment.category}`;
    }
};

// Main chat endpoint
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Parse the user's question
        const parsedQuery = await labAssistant.parseQuery(message);
        console.log('Parsed Query:', parsedQuery);

        // Generate appropriate database query
        const dbQuery = labAssistant.generateQuery(parsedQuery);

        let response;
        let suggestions = [];

        if (dbQuery) {
            try {
                // Execute the database query using Sequelize
                const [results] = await sequelize.query(dbQuery.query);
                console.log('Query Results:', results);

                // Format the response
                const formatter = responseFormatters[dbQuery.type];
                if (formatter) {
                    response = formatter(results);
                } else {
                    response = `Here's what I found:\n\n${JSON.stringify(results, null, 2)}`;
                }

                // Generate contextual suggestions
                suggestions = generateContextualSuggestions(dbQuery.type, parsedQuery);

            } catch (dbError) {
                console.error('Database query error:', dbError);
                response = `I'm having trouble accessing the database right now. Please try again or contact support.`;
            }
        } else {
            // Handle general conversation
            response = await handleGeneralQuery(message, userId);
            suggestions = ['How many labs do I have?', 'Show available equipment', 'List all computers'];
        }

        // Log the interaction
        await logChatInteraction(userId, message, parsedQuery, response);

        res.json({
            success: true,
            data: {
                response,
                suggestions,
                intent: parsedQuery.queryType,
                entities: parsedQuery.entities,
                specificItem: parsedQuery.specificItem,
                confidence: parsedQuery.confidence
            }
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: "I'm experiencing technical difficulties. Please try again."
        });
    }
});

// Helper functions
function generateContextualSuggestions(queryType, parsedQuery) {
    switch (queryType) {
        case 'lab_count':
            return ['Show available labs', 'List lab equipment', 'Check lab schedules'];
        case 'equipment_count':
            return ['Find specific equipment', 'Check equipment status', 'Search by specifications'];
        case 'specific_equipment':
            return ['Where is this equipment?', 'Check availability', 'View similar equipment'];
        case 'equipment_search':
            return ['Show more details', 'Check availability', 'Find in specific lab'];
        default:
            return ['How many labs?', 'Available equipment?', 'Find computer with i7'];
    }
}

async function handleGeneralQuery(message, userId) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        const [userRows] = await sequelize.query('SELECT name FROM users WHERE id = ?', {
            replacements: [userId]
        });
        const userName = userRows[0]?.name || 'there';
        return `Hello ${userName}! 👋 I can help you find real-time information about:\n\n🏢 **Labs**: Count, availability, details\n🔧 **Equipment**: Specifications, location, status\n🔍 **Search**: Find equipment by specs (i7, RAM, etc.)\n📊 **Status**: Real-time availability and conditions\n\nAsk me anything like:\n• "How many labs do I have?"\n• "Is computer001 an i7?"\n• "Show available equipment"\n• "Find all i7 computers"`;
    }

    if (lowerMessage.includes('help')) {
        return `🤖 **I can help you with real-time lab data**:\n\n📊 **Counts**: "How many labs/computers/equipment?"\n🔍 **Search**: "Find equipment with i7", "Show SSD computers"\n📍 **Location**: "Where is computer001?"\n📈 **Status**: "Status of microscope02"\n🔧 **Specs**: "What are the specs of computer001?"\n⏰ **Availability**: "What labs are available?"\n\n**Try asking specific questions about your actual equipment!**`;
    }

    return `I can help you find real-time information about your labs and equipment. Try asking:\n\n• How many labs do I have?\n• What equipment is available?\n• Is computer001 an i7?\n• Where is microscope02?\n• Show me all SSD computers\n\nWhat would you like to know?`;
}

async function logChatInteraction(userId, message, parsedQuery, response) {
    try {
        const responseData = {
            text: response,
            timestamp: new Date().toISOString(),
            queryType: parsedQuery.queryType
        };

        await sequelize.query(
            'INSERT INTO chat_interactions (user_id, message, intent, entities, specific_item, response, confidence, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            {
                replacements: [
                    userId,
                    message,
                    parsedQuery.queryType,
                    JSON.stringify(parsedQuery.entities),
                    parsedQuery.specificItem || null,
                    JSON.stringify(responseData),
                    parsedQuery.confidence
                ]
            }
        );
    } catch (error) {
        console.error('Failed to log chat interaction:', error);
        // Don't throw error here - logging failure shouldn't break the chat
    }
}

module.exports = router;