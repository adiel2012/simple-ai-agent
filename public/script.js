class LLMAgent {
    constructor() {
        this.socket = io();
        this.chatOutput = document.getElementById('chat-output');
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.providerSelect = document.getElementById('provider-select');
        this.clearBtn = document.getElementById('clear-btn');
        this.functionsList = document.getElementById('functions-list');
        this.statusIndicator = document.getElementById('status');
        
        this.initializeEventListeners();
        this.loadFunctions();
        this.setupSocketEvents();
    }

    initializeEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        this.clearBtn.addEventListener('click', () => this.clearChat());
        
        // Focus on input when page loads
        this.chatInput.focus();
    }

    setupSocketEvents() {
        this.socket.on('connect', () => {
            this.updateStatus('connected');
            this.addSystemMessage('Connected to server');
        });

        this.socket.on('disconnect', () => {
            this.updateStatus('disconnected');
            this.addSystemMessage('Disconnected from server');
        });

        this.socket.on('chat_response', (data) => {
            this.handleChatResponse(data);
        });

        this.socket.on('chat_error', (data) => {
            this.addErrorMessage(`Error: ${data.error}`);
        });
    }

    async loadFunctions() {
        try {
            const response = await fetch('/api/functions');
            const functions = await response.json();
            this.displayFunctions(functions);
        } catch (error) {
            console.error('Error loading functions:', error);
        }
    }

    displayFunctions(functions) {
        this.functionsList.innerHTML = '';
        functions.forEach(func => {
            const funcDiv = document.createElement('div');
            funcDiv.className = 'function-item';
            funcDiv.innerHTML = `
                <span class="function-name">${func.name}</span>
                <div class="function-description">${func.description}</div>
            `;
            this.functionsList.appendChild(funcDiv);
        });
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        this.addUserMessage(message);
        this.chatInput.value = '';
        this.addTypingIndicator();

        this.socket.emit('chat_message', {
            message: message,
            provider: this.providerSelect.value
        });
    }

    handleChatResponse(data) {
        this.removeTypingIndicator();
        
        if (data.functionCall) {
            this.addFunctionCallMessage(data.functionCall);
            this.addFunctionResultMessage(data.functionResult);
        }
        
        if (data.response) {
            this.addAssistantMessage(data.response);
        }
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `<strong>You:</strong> ${this.escapeHtml(message)}`;
        this.chatOutput.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addAssistantMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        messageDiv.innerHTML = `<strong>Assistant:</strong> ${this.escapeHtml(message)}`;
        this.chatOutput.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addSystemMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.innerHTML = `<strong>System:</strong> ${this.escapeHtml(message)}`;
        this.chatOutput.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addErrorMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message error';
        messageDiv.innerHTML = `<strong>Error:</strong> ${this.escapeHtml(message)}`;
        this.chatOutput.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addFunctionCallMessage(functionCall) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'function-call';
        messageDiv.innerHTML = `
            <strong>Function Call:</strong> ${this.escapeHtml(functionCall.name)}<br>
            <strong>Parameters:</strong> ${this.escapeHtml(JSON.stringify(functionCall.parameters, null, 2))}
        `;
        this.chatOutput.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addFunctionResultMessage(result) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'function-result';
        messageDiv.innerHTML = `
            <strong>Function Result:</strong><br>
            <pre>${this.escapeHtml(JSON.stringify(result, null, 2))}</pre>
        `;
        this.chatOutput.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message system typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = '<strong>Assistant is typing...</strong>';
        this.chatOutput.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    updateStatus(status) {
        this.statusIndicator.textContent = status === 'connected' ? 'Connected' : 'Disconnected';
        this.statusIndicator.className = `status-indicator ${status}`;
    }

    clearChat() {
        this.chatOutput.innerHTML = '';
        this.addSystemMessage('Chat cleared');
    }

    scrollToBottom() {
        this.chatOutput.scrollTop = this.chatOutput.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LLMAgent();
});