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

The LLM Function Agent includes 7 built-in local functions that LLMs can call to interact with the system:

### 1. **get_current_time**
- **Purpose**: Returns current date and time
- **Parameters**: None
- **Returns**: ISO timestamp string
- **Example**: `{ "time": "2024-01-15T10:30:45.123Z" }`
- **Use Cases**: When LLM needs to know current time for scheduling, logging, or time-based responses

### 2. **get_weather**
- **Purpose**: Get weather information for a city (mock data)
- **Parameters**: 
  - `city` (required): City name
  - `units` (optional): "celsius" or "fahrenheit" (default: celsius)
- **Returns**: Mock weather data with temperature, condition
- **Example**: `{ "city": "New York", "temperature": 22, "units": "celsius", "condition": "sunny" }`
- **Use Cases**: Weather queries, travel planning discussions

### 3. **calculate**
- **Purpose**: Perform basic mathematical calculations
- **Parameters**: 
  - `expression` (required): Mathematical expression as string
- **Returns**: Original expression and calculated result
- **Example**: `{ "expression": "2 + 3 * 4", "result": 14 }`
- **Use Cases**: Math problems, unit conversions, financial calculations
- **Security**: Sanitized input (only allows numbers and basic operators)

### 4. **read_file**
- **Purpose**: Read contents of a file from the filesystem
- **Parameters**: 
  - `filepath` (required): Path to file to read
- **Returns**: File path and content as string
- **Example**: `{ "filepath": "./package.json", "content": "{\n  \"name\": \"llm-function-agent\"..." }`
- **Use Cases**: Code analysis, configuration review, file inspection
- **Security**: Limited to accessible file paths

### 5. **list_files**
- **Purpose**: List files and directories in a given path
- **Parameters**: 
  - `directory` (optional): Directory path (default: current directory)
- **Returns**: Directory path and array of file/folder names
- **Example**: `{ "directory": ".", "files": ["package.json", "server.js", "public/"] }`
- **Use Cases**: Project exploration, file discovery, directory navigation

### 6. **system_info**
- **Purpose**: Get system information about the Node.js environment
- **Parameters**: None
- **Returns**: Platform, architecture, Node version, uptime, memory usage
- **Example**: 
```json
{
  "platform": "linux",
  "architecture": "x64", 
  "nodeVersion": "v18.17.0",
  "uptime": 1234.56,
  "memory": { "rss": 45678912, "heapTotal": 12345678 }
}
```
- **Use Cases**: System diagnostics, performance monitoring, environment checks

### 7. **calculate_factorial**
- **Purpose**: Calculate the factorial of a number
- **Parameters**: 
  - `number` (required): Non-negative integer to calculate factorial for
- **Returns**: Original number and calculated factorial result
- **Example**: `{ "number": 5, "factorial": 120 }`
- **Use Cases**: Mathematical calculations, combinatorics, algorithm demonstrations
- **Security**: Input validation (non-negative integers only, max 170 to prevent overflow)

## How Function Calling Works

1. **LLM Decision**: When you ask a question, the LLM analyzes if it needs to call a function
2. **Function Selection**: LLM chooses appropriate function and parameters
3. **Execution**: Function runs on the server with detailed logging
4. **Result Integration**: LLM receives function result and incorporates it into response
5. **User Response**: Final answer is displayed in the chat interface

All function calls are logged to the console with execution timing and parameter details for debugging and monitoring.

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