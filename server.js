const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const LLMService = require('./services/llmService');
const FunctionRegistry = require('./services/functionRegistry');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize services
const llmService = new LLMService();
const functionRegistry = new FunctionRegistry();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('chat_message', async (data) => {
    try {
      const { message, provider } = data;
      
      // Process message through LLM
      const response = await llmService.processMessage(message, provider);
      
      // Check if LLM wants to call a function
      if (response.functionCall) {
        const functionResult = await functionRegistry.executeFunction(
          response.functionCall.name,
          response.functionCall.parameters
        );
        
        // Send function result back to LLM for final response
        const finalResponse = await llmService.processWithFunctionResult(
          message,
          response.functionCall,
          functionResult,
          provider
        );
        
        socket.emit('chat_response', {
          response: finalResponse,
          functionCall: response.functionCall,
          functionResult: functionResult
        });
      } else {
        socket.emit('chat_response', { response: response.content });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('chat_error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// API Routes
app.get('/api/functions', (req, res) => {
  res.json(functionRegistry.getAvailableFunctions());
});

app.get('/api/providers', (req, res) => {
  res.json(llmService.getAvailableProviders());
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available LLM providers: ${llmService.getAvailableProviders().join(', ')}`);
  console.log(`Available functions: ${functionRegistry.getAvailableFunctions().map(f => f.name).join(', ')}`);
});