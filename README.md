# LLM Function Agent

A Node.js web application that provides a command prompt interface to interact with various LLM providers (Claude, OpenAI, Ollama) and execute local functions.

## Features

- **Multi-LLM Support**: Connect to Claude, OpenAI, and Ollama
- **Function Calling**: LLMs can call predefined local functions
- **Real-time Communication**: WebSocket-based chat interface
- **Terminal-style UI**: Command prompt interface with green terminal aesthetics
- **Extensible Functions**: Easy to add new local functions

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file:
   ```
   CLAUDE_API_KEY=your_claude_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   OLLAMA_BASE_URL=http://localhost:11434
   PORT=3000
   DEFAULT_LLM_PROVIDER=claude
   ```

3. **Start the application**:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and go to `http://localhost:3000`

## Available Functions

The application comes with several built-in functions that LLMs can call:

- `get_current_time`: Get current date and time
- `get_weather`: Get weather information for a city (mock data)
- `calculate`: Perform basic mathematical calculations
- `read_file`: Read contents of a file
- `list_files`: List files in a directory
- `system_info`: Get system information

## Adding New Functions

To add a new function, edit `services/functionRegistry.js` and use the `registerFunction` method:

```javascript
this.registerFunction({
  name: 'your_function_name',
  description: 'Description of what your function does',
  parameters: {
    param1: { type: 'string', description: 'Parameter description' }
  },
  required: ['param1'],
  execute: (params) => {
    // Your function implementation
    return { result: 'your result' };
  }
});
```

## LLM Provider Configuration

### Claude API
- Requires `CLAUDE_API_KEY` environment variable
- Uses Claude 3 Sonnet model

### OpenAI API
- Requires `OPENAI_API_KEY` environment variable
- Uses GPT-3.5-turbo model

### Ollama
- Requires local Ollama installation
- Set `OLLAMA_BASE_URL` to your Ollama server (default: http://localhost:11434)
- Uses llama2 model (can be changed in `services/llmService.js`)

## Project Structure

```
nodejs-agent/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── services/
│   ├── llmService.js     # LLM API integrations
│   └── functionRegistry.js  # Function management
└── public/
    ├── index.html        # Frontend HTML
    ├── styles.css        # Terminal-style CSS
    └── script.js         # Frontend JavaScript
```

## Usage

1. Select your preferred LLM provider from the dropdown
2. Type your message in the command prompt
3. The LLM will respond and can call functions when needed
4. Function calls and results are displayed in the chat
5. Use the "Clear" button to reset the chat

## Security Notes

- All sensitive API keys are stored in environment variables
- File operations are limited to the current directory and subdirectories
- Mathematical expressions use basic eval (consider using a proper math parser for production)
- No authentication is implemented (add as needed for production use)