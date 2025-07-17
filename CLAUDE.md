# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start the server**: `npm start`
- **Development with auto-reload**: `npm run dev`
- **Install dependencies**: `npm install`

## Project Overview

This is a Node.js web application that provides a terminal-style interface for interacting with multiple LLM providers (Claude, OpenAI, Ollama) with function calling capabilities. The application uses WebSockets for real-time communication and includes a function registry system for extending LLM capabilities.

## Architecture

### Core Components

1. **server.js**: Main Express server with Socket.IO integration
   - Handles WebSocket connections for real-time chat
   - Orchestrates message flow between LLM service and function registry
   - Provides API endpoints for functions and providers

2. **services/llmService.js**: LLM provider abstraction layer
   - Supports Claude (Anthropic), OpenAI, and Ollama APIs
   - Handles function calling protocol for each provider
   - Manages provider-specific request/response formatting

3. **services/functionRegistry.js**: Function management system
   - Maintains registry of available functions for LLMs
   - Executes function calls with parameter validation
   - Includes built-in functions: time, weather, calculate, read_file, list_files, system_info, calculate_factorial

4. **public/**: Frontend web interface
   - Terminal-style chat interface with green aesthetics
   - Provider selection dropdown
   - Function call visualization

### Message Flow

1. User sends message via WebSocket
2. LLM service processes message and determines if function call is needed
3. If function call requested, function registry executes it
4. LLM service processes function result and generates final response
5. Response sent back to client with function call details

### Environment Configuration

Required environment variables:
- `CLAUDE_API_KEY`: For Anthropic Claude API
- `OPENAI_API_KEY`: For OpenAI API
- `OLLAMA_BASE_URL`: For local Ollama installation (default: http://localhost:11434)
- `PORT`: Server port (default: 3000)
- `DEFAULT_LLM_PROVIDER`: Default provider (default: claude)

### Adding New Functions

To add a new function to the registry, edit `services/functionRegistry.js:127` and use the `registerFunction` method with:
- `name`: Function identifier
- `description`: What the function does
- `parameters`: Object defining parameter schema
- `required`: Array of required parameter names
- `execute`: Function implementation

### Function Calling Support

- **Claude**: Uses Anthropic's tools API with proper schema formatting
- **OpenAI**: Uses OpenAI's function calling with tools array
- **Ollama**: Basic pattern matching for "FUNCTION_CALL:" syntax (simplified)

### Security Considerations

- File operations are limited to current directory and subdirectories
- Mathematical expressions use basic eval (consider proper math parser for production)
- No authentication implemented (add for production use)
- API keys stored in environment variables only