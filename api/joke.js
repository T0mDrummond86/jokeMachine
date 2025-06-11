import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const comedianVoices = {
  'jerry-seinfeld': {
    prompt: "in the style of Jerry Seinfeld. Observational, about everyday life, with a light, witty tone.",
    examples: ["What's the deal with airline food? I mean, what's the deal?", "I saw a store that said 'Open 24 Hours' and it wasn't."]
  },
  'jimmy-carr': {
    prompt: "in the style of Jimmy Carr. Dark, quick, and clever one-liners with a twist.",
    examples: ["I saw a sign that said 'Drink Canada Dry' and I thought, 'Well, that's a tall order.'"]
  },
  'mitch-hedberg': {
    prompt: "in the style of Mitch Hedberg. Surreal, deadpan one-liners with wordplay.",
    examples: ["I used to do drugs. I still do, but I used to, too.", "I'm against picketing, but I don't know how to show it."]
  },
  'eddie-izzard': {
    prompt: "in the style of Eddie Izzard. Surreal, stream-of-consciousness, historical references, and playful.",
    examples: ["Cake or death? That's a pretty easy question."]
  },
  'steven-wright': {
    prompt: "in the style of Steven Wright. Philosophical, dry, and absurd one-liners.",
    examples: ["I intend to live forever. So far, so good."]
  },
  'ricky-gervais': {
    prompt: "in the style of Ricky Gervais. Sarcastic, irreverent, and challenges social norms.",
    examples: ["I'm not saying I'm Batman, I'm just saying no one has ever seen me and Batman in the same room together."]
  },
  'dave-chappelle': {
    prompt: "in the style of Dave Chappelle. Edgy, insightful, and often about race or society.",
    examples: ["The hardest thing to do is to be true to yourself, especially when everybody is watching."]
  },
  'george-carlin': {
    prompt: "in the style of George Carlin. Satirical, critical of language, politics, and society.",
    examples: ["Why do they lock gas station bathrooms? Are they afraid someone will clean them?"]
  },
  'bill-burr': {
    prompt: "in the style of Bill Burr. Ranting, self-deprecating, and brutally honest.",
    examples: ["I'm not easy to live with. My wife is a saint."]
  },
  'chris-rock': {
    prompt: "in the style of Chris Rock. High-energy, sharp social commentary, and punchy delivery.",
    examples: ["You know the world is going crazy when the best rapper is a white guy, the best golfer is a black guy, and the tallest guy in the NBA is Chinese."]
  }
};

export default async function handler(req, res) {
  try {
    const method = req.method;
    let topic, voice;
    if (method === 'GET') {
      topic = req.query.topic;
      voice = req.query.voice;
    } else if (method === 'POST') {
      topic = req.body.topic;
      voice = req.body.voice;
    } else {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    if (!topic) {
      res.status(400).json({ error: 'Missing topic' });
      return;
    }
    if (!voice || !comedianVoices[voice]) {
      res.status(400).json({ error: 'Invalid or missing comedian voice' });
      return;
    }

    const { prompt, examples } = comedianVoices[voice];
    const systemPrompt = `You are a professional comedian. Write a joke about ${topic} ${prompt}\nHere are some examples of this comedian's style: ${examples.join(' | ')}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Write a joke about ${topic} in this style.` }
      ],
      max_tokens: 80,
      temperature: 0.8
    });

    const joke = completion.choices[0]?.message?.content?.trim() || 'No joke generated.';
    res.status(200).json({ joke });
  } catch (error) {
    console.error('Joke API error:', error);
    res.status(500).json({ error: 'Failed to generate joke', details: error.message });
  }
} 