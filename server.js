console.log('=== STARTING SERVER ===');
console.log('Testing basic console output');

const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

// Create a write stream for logging
const logStream = fs.createWriteStream('server.log', { flags: 'a' });

// Simple logging function
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    logStream.write(logMessage);
    process.stderr.write(logMessage);
}

// Define comedian styles
const comedianVoices = {
    'jimmy-carr': {
        name: 'Jimmy Carr',
        style: 'Dark humor with clever wordplay and deadpan delivery',
        examples: [
            "I saw a sign that said 'Drink Canada Dry' and I thought, 'Well, that's a tall order...'",
            "I'm not saying I'm Batman, I'm just saying no one has ever seen me and Batman in the same room together."
        ],
        prompt: "Create a dark, clever joke with a deadpan delivery and a surprising twist."
    },
    'jerry-seinfeld': {
        name: 'Jerry Seinfeld',
        style: 'Observational humor about everyday life',
        examples: [
            "What's the deal with airline food? I mean, what's the deal?",
            "You know how they say 'It's always in the last place you look'? Of course it is. Why would you keep looking after you found it?"
        ],
        prompt: "Create an observational joke about everyday life, focusing on the little absurdities we all experience."
    },
    'ricky-gervais': {
        name: 'Ricky Gervais',
        style: 'Edgy, self-deprecating humor that challenges social norms',
        examples: [
            "I'm not saying I'm Batman, I'm just saying no one has ever seen me and Batman in the same room together.",
            "I used to think I was indecisive, but now I'm not so sure."
        ],
        prompt: "Create a joke that challenges social norms with a touch of self-deprecation and clever wordplay."
    },
    'dave-chappelle': {
        name: 'Dave Chappelle',
        style: 'Sharp social commentary with unexpected twists',
        examples: [
            "I'm not saying I'm Batman, I'm just saying no one has ever seen me and Batman in the same room together.",
            "I used to think I was indecisive, but now I'm not so sure."
        ],
        prompt: "Create a joke with sharp social commentary and an unexpected twist that makes people think."
    },
    'mitch-hedberg': {
        name: 'Mitch Hedberg',
        style: 'Surreal one-liners with clever wordplay',
        examples: [
            "I used to do drugs. I still do, but I used to, too.",
            "I'm against picketing, but I don't know how to show it."
        ],
        prompt: "Create a surreal one-liner with clever wordplay and an unexpected connection."
    }
};

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;
console.log('Express app created');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
console.log('=== Server Started ===');
console.log(`Server running at http://localhost:${PORT}`);
console.log('OpenAI API key configured:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

// Logging middleware - log EVERY request
app.use((req, res, next) => {
    console.log('Request received:', req.method, req.url);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'ok' });
});

// Get available comedians
app.get('/api/comedians', (req, res) => {
    console.log('Comedians list requested');
    const comedians = Object.entries(comedianVoices).map(([id, data]) => ({
        id,
        name: data.name,
        style: data.style
    }));
    res.json(comedians);
});

// Joke generation endpoint
app.get('/api/joke', async (req, res) => {
    console.log('Joke request received:', req.query);
    
    try {
        const { topic, voice } = req.query;
        
        if (!topic) {
            console.log('Error: No topic provided');
            return res.status(400).json({ error: 'Topic is required' });
        }

        if (!voice || !comedianVoices[voice]) {
            console.log('Error: Invalid or missing voice');
            return res.status(400).json({ error: 'Valid voice is required' });
        }

        const comedian = comedianVoices[voice];
        
        // Create the prompt
        const prompt = `Create a joke about ${topic} in the style of ${comedian.name}. ${comedian.prompt} Here are some examples of ${comedian.name}'s style: ${comedian.examples.join(' ')}`;
        console.log('Sending to OpenAI:', prompt);

        // Call OpenAI API
        console.log('Making API call...');
        const startTime = Date.now();
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: `You are ${comedian.name}. Create jokes in your unique style: ${comedian.style}`
                },
                { role: "user", content: prompt }
            ],
            max_tokens: 150,
            temperature: 0.7
        });

        const endTime = Date.now();
        console.log('API call completed in', endTime - startTime, 'ms');
        console.log('Response:', completion.choices[0].message.content);
        
        // Send the joke back to the client
        res.json({ 
            joke: completion.choices[0].message.content,
            comedian: comedian.name
        });
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            error: 'Failed to generate joke',
            details: error.message
        });
    }
});

// Joke modification endpoint
app.post('/api/modify-joke', async (req, res) => {
    console.log('Joke modification request received:', req.body);
    
    try {
        const { originalJoke, feedback, topic, voice } = req.body;
        
        if (!originalJoke || !feedback || !topic || !voice) {
            console.log('Error: Missing required fields');
            return res.status(400).json({ error: 'Original joke, feedback, topic, and voice are required' });
        }

        if (!comedianVoices[voice]) {
            console.log('Error: Invalid voice');
            return res.status(400).json({ error: 'Valid voice is required' });
        }

        const comedian = comedianVoices[voice];
        
        // Create the modification prompt
        const prompt = `Here's a joke about ${topic} in the style of ${comedian.name}: "${originalJoke}"
        
User feedback: "${feedback}"

Please create a new version of this joke that addresses the feedback while maintaining ${comedian.name}'s style: ${comedian.style}
Here are some examples of ${comedian.name}'s style: ${comedian.examples.join(' ')}`;

        console.log('Sending modification request to OpenAI:', prompt);

        // Call OpenAI API
        console.log('Making API call...');
        const startTime = Date.now();
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: `You are ${comedian.name}. Create jokes in your unique style: ${comedian.style}`
                },
                { role: "user", content: prompt }
            ],
            max_tokens: 150,
            temperature: 0.7
        });

        const endTime = Date.now();
        console.log('API call completed in', endTime - startTime, 'ms');
        console.log('Response:', completion.choices[0].message.content);
        
        // Send the modified joke back to the client
        res.json({ 
            joke: completion.choices[0].message.content,
            comedian: comedian.name
        });
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            error: 'Failed to modify joke',
            details: error.message
        });
    }
});

// Joke analysis endpoint
app.post('/api/analyze-joke', async (req, res) => {
    console.log('Joke analysis request received:', req.body);
    
    try {
        const { joke, voice } = req.body;
        
        if (!joke || !voice) {
            console.log('Error: Missing required fields');
            return res.status(400).json({ error: 'Joke and voice are required' });
        }

        if (!comedianVoices[voice]) {
            console.log('Error: Invalid voice');
            return res.status(400).json({ error: 'Valid voice is required' });
        }

        const comedian = comedianVoices[voice];
        
        // Create the analysis prompt
        const prompt = `Analyze this joke in the style of ${comedian.name}: "${joke}"

Please provide a detailed analysis in the following format:
1. Setup: [Identify the setup/premise of the joke]
2. Punchline: [Identify the punchline and how it works]
3. Style Elements: [List the key style elements used from ${comedian.name}'s style]
4. Strengths: [List 2-3 strengths of the joke]
5. Potential Improvements: [List 2-3 ways the joke could be improved]
6. Feedback Suggestions: [List 3-4 specific types of feedback the user could provide to modify the joke]`;

        console.log('Sending analysis request to OpenAI:', prompt);

        // Call OpenAI API
        console.log('Making API call...');
        const startTime = Date.now();
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: "You are a comedy expert who specializes in analyzing jokes and providing constructive feedback."
                },
                { role: "user", content: prompt }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const endTime = Date.now();
        console.log('API call completed in', endTime - startTime, 'ms');
        console.log('Analysis response:', completion.choices[0].message.content);
        
        // Parse the analysis into structured format
        const analysis = completion.choices[0].message.content;
        const sections = analysis.split('\n\n').reduce((acc, section) => {
            const [title, content] = section.split(': ');
            if (title && content) {
                acc[title.toLowerCase().replace(/[^a-z]/g, '')] = content;
            }
            return acc;
        }, {});
        
        // Send the analysis back to the client
        res.json({ 
            analysis: sections,
            rawAnalysis: analysis
        });
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            error: 'Failed to analyze joke',
            details: error.message
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('=== Server Started ===');
    console.log('URL:', `http://localhost:${PORT}`);
    console.log('OpenAI API Key configured:', !!process.env.OPENAI_API_KEY);
    console.log('OpenAI API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);
});
