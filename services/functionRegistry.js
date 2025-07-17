const fs = require('fs');
const path = require('path');

class FunctionRegistry {
  constructor() {
    this.functions = new Map();
    this.loadFunctions();
  }

  loadFunctions() {
    // Example functions - you can add more or load from external files
    this.registerFunction({
      name: 'get_current_time',
      description: 'Get the current date and time',
      parameters: {},
      required: [],
      execute: () => {
        console.log('[FUNCTION] get_current_time called');
        const time = new Date().toISOString();
        console.log('[FUNCTION] get_current_time result:', time);
        return { time: time };
      }
    });

    this.registerFunction({
      name: 'get_weather',
      description: 'Get weather information for a city',
      parameters: {
        city: { type: 'string', description: 'The city name' },
        units: { type: 'string', description: 'Temperature units (celsius/fahrenheit)', default: 'celsius' }
      },
      required: ['city'],
      execute: (params) => {
        console.log('[FUNCTION] get_weather called with params:', params);
        // Mock weather data
        const weather = {
          city: params.city,
          temperature: Math.floor(Math.random() * 30) + 10,
          units: params.units || 'celsius',
          condition: ['sunny', 'cloudy', 'rainy', 'snowy'][Math.floor(Math.random() * 4)]
        };
        console.log('[FUNCTION] get_weather result:', weather);
        return weather;
      }
    });

    this.registerFunction({
      name: 'calculate',
      description: 'Perform basic mathematical calculations',
      parameters: {
        expression: { type: 'string', description: 'Mathematical expression to evaluate' }
      },
      required: ['expression'],
      execute: (params) => {
        console.log('[FUNCTION] calculate called with params:', params);
        try {
          // Simple eval for basic math (in production, use a proper math parser)
          const result = eval(params.expression.replace(/[^0-9+\-*/.() ]/g, ''));
          console.log('[FUNCTION] calculate result:', { expression: params.expression, result: result });
          return { expression: params.expression, result: result };
        } catch (error) {
          console.log('[FUNCTION] calculate error:', error.message);
          return { error: 'Invalid mathematical expression' };
        }
      }
    });

    this.registerFunction({
      name: 'read_file',
      description: 'Read contents of a file',
      parameters: {
        filepath: { type: 'string', description: 'Path to the file to read' }
      },
      required: ['filepath'],
      execute: (params) => {
        console.log('[FUNCTION] read_file called with params:', params);
        try {
          const content = fs.readFileSync(params.filepath, 'utf8');
          console.log('[FUNCTION] read_file result: Successfully read file', params.filepath, `(${content.length} characters)`);
          return { filepath: params.filepath, content: content };
        } catch (error) {
          console.log('[FUNCTION] read_file error:', error.message);
          return { error: `Cannot read file: ${error.message}` };
        }
      }
    });

    this.registerFunction({
      name: 'list_files',
      description: 'List files in a directory',
      parameters: {
        directory: { type: 'string', description: 'Directory path to list files from', default: '.' }
      },
      required: [],
      execute: (params) => {
        console.log('[FUNCTION] list_files called with params:', params);
        try {
          const dir = params.directory || '.';
          const files = fs.readdirSync(dir);
          console.log('[FUNCTION] list_files result: Found', files.length, 'files in', dir);
          return { directory: dir, files: files };
        } catch (error) {
          console.log('[FUNCTION] list_files error:', error.message);
          return { error: `Cannot list directory: ${error.message}` };
        }
      }
    });

    this.registerFunction({
      name: 'system_info',
      description: 'Get system information',
      parameters: {},
      required: [],
      execute: () => {
        console.log('[FUNCTION] system_info called');
        const info = {
          platform: process.platform,
          architecture: process.arch,
          nodeVersion: process.version,
          uptime: process.uptime(),
          memory: process.memoryUsage()
        };
        console.log('[FUNCTION] system_info result:', info);
        return info;
      }
    });

    this.registerFunction({
      name: 'calculate_factorial',
      description: 'Calculate the factorial of a number (n! = n × (n-1) × ... × 1). Use this when the user asks for factorial calculations.',
      parameters: {
        number: { type: 'integer', description: 'The number to calculate factorial for (must be non-negative integer)' }
      },
      required: ['number'],
      execute: (params) => {
        console.log('[FUNCTION] calculate_factorial called with params:', params);
        try {
          const num = parseInt(params.number);
          
          if (isNaN(num) || num < 0) {
            console.log('[FUNCTION] calculate_factorial error: Invalid input');
            return { error: 'Number must be a non-negative integer' };
          }
          
          if (num > 170) {
            console.log('[FUNCTION] calculate_factorial error: Number too large');
            return { error: 'Number too large (maximum is 170 to avoid overflow)' };
          }
          
          let factorial = 1;
          for (let i = 1; i <= num; i++) {
            factorial *= i;
          }
          
          console.log('[FUNCTION] calculate_factorial result:', { number: num, factorial: factorial });
          return { number: num, factorial: factorial };
        } catch (error) {
          console.log('[FUNCTION] calculate_factorial error:', error.message);
          return { error: 'Error calculating factorial' };
        }
      }
    });
  }

  registerFunction(functionDef) {
    this.functions.set(functionDef.name, functionDef);
  }

  getAvailableFunctions() {
    return Array.from(this.functions.values()).map(func => ({
      name: func.name,
      description: func.description,
      parameters: func.parameters,
      required: func.required
    }));
  }

  async executeFunction(functionName, parameters) {
    console.log(`[FUNCTION REGISTRY] Executing function: ${functionName}`);
    const func = this.functions.get(functionName);
    if (!func) {
      console.log(`[FUNCTION REGISTRY] Function '${functionName}' not found`);
      throw new Error(`Function '${functionName}' not found`);
    }

    try {
      const startTime = Date.now();
      const result = await func.execute(parameters);
      const duration = Date.now() - startTime;
      console.log(`[FUNCTION REGISTRY] Function '${functionName}' completed in ${duration}ms`);
      return result;
    } catch (error) {
      console.log(`[FUNCTION REGISTRY] Function '${functionName}' error:`, error.message);
      return { error: error.message };
    }
  }
}

module.exports = FunctionRegistry;