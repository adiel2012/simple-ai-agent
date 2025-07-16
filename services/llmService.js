const axios = require('axios');

class LLMService {
  constructor() {
    this.providers = {
      claude: {
        available: !!process.env.CLAUDE_API_KEY,
        baseURL: 'https://api.anthropic.com/v1/messages',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      },
      openai: {
        available: !!process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      },
      ollama: {
        available: !!process.env.OLLAMA_BASE_URL,
        baseURL: `${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/chat`,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    };
  }

  getAvailableProviders() {
    return Object.keys(this.providers).filter(provider => this.providers[provider].available);
  }

  async processMessage(message, provider = process.env.DEFAULT_LLM_PROVIDER || 'claude') {
    if (!this.providers[provider]?.available) {
      throw new Error(`Provider ${provider} is not available or not configured`);
    }

    const functionRegistry = require('./functionRegistry');
    const registry = new functionRegistry();
    const availableFunctions = registry.getAvailableFunctions();

    switch (provider) {
      case 'claude':
        return this.callClaude(message, availableFunctions);
      case 'openai':
        return this.callOpenAI(message, availableFunctions);
      case 'ollama':
        return this.callOllama(message, availableFunctions);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async callClaude(message, availableFunctions) {
    const tools = availableFunctions.map(func => ({
      name: func.name,
      description: func.description,
      input_schema: {
        type: "object",
        properties: func.parameters || {},
        required: func.required || []
      }
    }));

    const payload = {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }],
      tools: tools
    };

    try {
      const response = await axios.post(this.providers.claude.baseURL, payload, {
        headers: this.providers.claude.headers
      });

      const content = response.data.content[0];
      
      if (content.type === 'tool_use') {
        return {
          functionCall: {
            name: content.name,
            parameters: content.input
          }
        };
      }

      return { content: content.text };
    } catch (error) {
      throw new Error(`Claude API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async callOpenAI(message, availableFunctions) {
    const tools = availableFunctions.map(func => ({
      type: "function",
      function: {
        name: func.name,
        description: func.description,
        parameters: {
          type: "object",
          properties: func.parameters || {},
          required: func.required || []
        }
      }
    }));

    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      tools: tools,
      tool_choice: 'auto'
    };

    try {
      const response = await axios.post(this.providers.openai.baseURL, payload, {
        headers: this.providers.openai.headers
      });

      const message_response = response.data.choices[0].message;
      
      if (message_response.tool_calls && message_response.tool_calls.length > 0) {
        const toolCall = message_response.tool_calls[0];
        return {
          functionCall: {
            name: toolCall.function.name,
            parameters: JSON.parse(toolCall.function.arguments)
          }
        };
      }

      return { content: message_response.content };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async callOllama(message, availableFunctions) {
    const payload = {
      model: 'llama2',
      messages: [{ role: 'user', content: message }],
      stream: false
    };

    try {
      const response = await axios.post(this.providers.ollama.baseURL, payload, {
        headers: this.providers.ollama.headers
      });

      // Basic function detection for Ollama (simplified)
      const content = response.data.message.content;
      const functionPattern = /FUNCTION_CALL:\s*(\w+)\s*\((.*?)\)/;
      const match = content.match(functionPattern);
      
      if (match) {
        const functionName = match[1];
        const params = match[2] ? JSON.parse(`{${match[2]}}`) : {};
        
        return {
          functionCall: {
            name: functionName,
            parameters: params
          }
        };
      }

      return { content: content };
    } catch (error) {
      throw new Error(`Ollama API error: ${error.response?.data?.error || error.message}`);
    }
  }

  async processWithFunctionResult(originalMessage, functionCall, functionResult, provider) {
    const contextMessage = `Original message: ${originalMessage}
Function called: ${functionCall.name}
Function parameters: ${JSON.stringify(functionCall.parameters)}
Function result: ${JSON.stringify(functionResult)}

Please provide a response based on the function result.`;

    const response = await this.processMessage(contextMessage, provider);
    return response.content;
  }
}

module.exports = LLMService;