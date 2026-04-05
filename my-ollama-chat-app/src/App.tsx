import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_API_URL;
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL;

const App = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your ShetaGPT. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('llama3');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send to Ollama API
      const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'user',
            content: inputValue,
          },
        ],
        stream: false,
      }),
    });

const data = await response.json()
      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message?.content || 'No response from Ollama',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your Ollama assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  };

  return React.createElement('div', {
    style: { 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      padding: '16px',
      backgroundColor: '#f5f5f5'
    }
  }, 
    React.createElement('div', {
      style: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px' 
      }
    },
      React.createElement('h1', { 
        style: { 
          fontSize: '24px',
          margin: '0'
        }
      }, 'Ollama Chat'),
      React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: '8px' }
      },
        React.createElement('input', {
          type: 'text',
          value: model,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setModel(e.target.value),
          placeholder: 'Model name',
          style: { minWidth: '120px', padding: '4px' }
        }),
        React.createElement('button', {
          onClick: clearChat,
          style: { padding: '4px 8px', border: 'none', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', borderRadius: '4px' }
        }, 'Clear')
      )
    ),
    React.createElement('div', {
      style: { 
        flexGrow: 1, 
        overflow: 'auto', 
        padding: '16px', 
        marginBottom: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '4px'
      }
    },
      messages.map((message) => 
        React.createElement('div', {
          key: message.id,
          style: { 
            display: 'flex',
            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '8px'
          }
        },
          React.createElement('div', {
            style: { 
              maxWidth: '80%',
              backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f5f5f5',
              padding: '12px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
          },
            React.createElement('div', {
              style: { 
                whiteSpace: 'pre-wrap'
              }
            }, message.content)
          )
        )
      ),
      isLoading && 
        React.createElement('div', {
          style: { display: 'flex', alignItems: 'center', gap: '8px' }
        },
          React.createElement('span', null, 'Thinking...'),
          React.createElement('div', {
            style: { 
              width: '20px',
              height: '20px',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }
          })
        ),
      React.createElement('div', { 
        ref: messagesEndRef,
        style: { height: '1px' } 
      })
    ),
    React.createElement('form', {
      onSubmit: handleSubmit,
      style: { display: 'flex', gap: '8px' }
    },
      React.createElement('textarea', {
        placeholder: "Type your message here...",
        value: inputValue,
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value),
        rows: 2,
        disabled: isLoading,
        style: { 
          flexGrow: 1, 
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }
      }),
      React.createElement('button', {
        type: 'submit',
        disabled: isLoading || !inputValue.trim(),
        style: { 
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }
      }, 'Send')
    )
  );
};

export default App;