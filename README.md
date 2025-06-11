# Joke Generator

An AI-powered joke generator that creates jokes in the style of famous comedians. The application uses OpenAI's GPT-4 to generate and analyze jokes, providing feedback and suggestions for improvement.

## Features

- Generate jokes on any topic
- Choose from different comedian styles
- Get detailed analysis of generated jokes
- Modify jokes based on feedback
- Real-time joke generation and analysis

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd joke-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
joke-generator/
├── public/
│   ├── index.html    # Frontend interface
│   └── main.js       # Frontend JavaScript
├── server.js         # Backend server
├── package.json      # Project dependencies
├── .env             # Environment variables
└── README.md        # This file
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/joke` - Generate a new joke
  - Query parameters:
    - `topic` (required): The topic for the joke
    - `voice` (optional): Comedian style
- `POST /api/modify-joke` - Modify an existing joke
  - Body parameters:
    - `joke` (required): The joke to modify
    - `feedback` (required): Feedback for modification
    - `voice` (required): Comedian style
- `POST /api/analyze-joke` - Analyze a joke
  - Body parameters:
    - `joke` (required): The joke to analyze
    - `voice` (required): Comedian style

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 