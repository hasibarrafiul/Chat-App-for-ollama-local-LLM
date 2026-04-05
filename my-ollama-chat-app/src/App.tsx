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
      content: "Hello! I'm your ShetaGPT. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(OLLAMA_MODEL || 'llama3');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const trimmedInput = inputValue.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || OLLAMA_MODEL,
          messages: [
            {
              role: 'user',
              content: trimmedInput,
            },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message?.content || 'No response from Ollama',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your ShetaGPT. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        boxSizing: 'border-box',
        padding: '8px',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
      },
    },

    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap',
          flexShrink: 0,
        },
      },
      React.createElement(
        'h1',
        {
          style: {
            fontSize: '20px',
            margin: '0',
          },
        },
        'ShetaGPT'
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          },
        },
        React.createElement('input', {
          type: 'text',
          value: model,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setModel(e.target.value),
          placeholder: 'Model name',
          style: {
            minWidth: '110px',
            padding: '6px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          },
        }),
        React.createElement(
          'button',
          {
            onClick: clearChat,
            style: {
              padding: '6px 10px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
            },
          },
          'Clear'
        )
      )
    ),

    React.createElement(
      'div',
      {
        style: {
          flexGrow: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '10px',
          marginBottom: '8px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
      },
      messages.map((message) =>
        React.createElement(
          'div',
          {
            key: message.id,
            style: {
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '8px',
            },
          },
          React.createElement(
            'div',
            {
              style: {
                maxWidth: '85%',
                backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                padding: '12px',
                borderRadius: '10px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                wordBreak: 'break-word',
              },
            },
            React.createElement(
              'div',
              {
                style: {
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.45,
                },
              },
              message.content
            )
          )
        )
      ),

      isLoading &&
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 4px',
            },
          },
          React.createElement('span', null, 'Thinking...'),
          React.createElement('div', {
            style: {
              width: '18px',
              height: '18px',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            },
          })
        ),

      React.createElement('div', {
        ref: messagesEndRef,
        style: { height: '1px' },
      })
    ),

    React.createElement(
      'form',
      {
        onSubmit: handleSubmit,
        style: {
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
          alignItems: 'flex-end',
        },
      },
      React.createElement('textarea', {
        placeholder: 'Type your message here...',
        value: inputValue,
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value),
        rows: 2,
        disabled: isLoading,
        style: {
          flexGrow: 1,
          minHeight: '44px',
          maxHeight: '120px',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: '14px',
          boxSizing: 'border-box',
        },
      }),
      React.createElement(
        'button',
        {
          type: 'submit',
          disabled: isLoading || !inputValue.trim(),
          style: {
            padding: '10px 16px',
            backgroundColor: isLoading || !inputValue.trim() ? '#9ec5fe' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
            minHeight: '44px',
          },
        },
        'Send'
      )
    ),

    React.createElement('style', null, `
      * {
        box-sizing: border-box;
      }

      html, body, #root {
        height: 100%;
        margin: 0;
      }

      body {
        overflow: hidden;
        font-family: Arial, sans-serif;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 600px) {
        textarea {
          font-size: 16px;
        }
      }
    `)
  );
};

export default App;