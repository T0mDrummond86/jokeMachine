import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const comedianVoices = {
  'jerry-seinfeld': "Observational, about everyday life, with a light, witty tone.",
  'jimmy-carr': "Dark, quick, and clever one-liners with a twist.",
  'mitch-hedberg': "Surreal, deadpan one-liners with wordplay.",
  'eddie-izzard': "Surreal, stream-of-consciousness, historical references, and playful.",
  'steven-wright': "Philosophical, dry, and absurd one-liners.",
  'ricky-gervais': "Sarcastic, irreverent, and challenges social norms.",
  'dave-chappelle': "Edgy, insightful, and often about race or society.",
  'george-carlin': "Satirical, critical of language, politics, and society.",
  'bill-burr': "Ranting, self-deprecating, and brutally honest.",
  'chris-rock': "High-energy, sharp social commentary, and punchy delivery."
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { joke, feedback, voice } = req.body;
  if (!joke || !feedback || !voice || !comedianVoices[voice]) {
    res.status(400).json({ error: 'Missing or invalid joke, feedback, or voice' });
    return;
  }
  try {
    const prompt = `You are a professional comedian. Here is a joke in the style: ${comedianVoices[voice]}

Joke: "${joke}"

Feedback: "${feedback}"

Modify the joke to address the feedback, keeping the comedian's style. Respond with only the improved joke.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: prompt }
      ],
      max_tokens: 80,
      temperature: 0.8
    });
    const modifiedJoke = completion.choices[0]?.message?.content?.trim() || 'No modified joke generated.';
    res.status(200).json({ joke: modifiedJoke });
  } catch (error) {
    console.error('Modify Joke API error:', error);
    res.status(500).json({ error: 'Failed to modify joke', details: error.message });
  }
} 