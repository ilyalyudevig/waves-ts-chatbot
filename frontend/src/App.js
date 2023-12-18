import { useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import './App.css';

import { processMessage } from './supabase/processMessage.js';

function App() {
  const [messages, setMessages] = useState([
    {
      message: 'Hello, I am Waves AI TS agent!',
      sender: 'WavesAI',
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: 'user',
      direction: 'outgoing',
    };

    const newMessages = [...messages, newMessage]; // old messages, + new message

    // update our messages state
    setMessages(newMessages);

    // set a typing indicator
    setIsTyping(true);

    // process message to chatGPT (send it over and see the response)
    setMessages([
      ...newMessages,
      {
        message: await processMessage(message, newMessages),
        sender: 'WavesAI',
      },
    ]);
    setIsTyping(false);
  };

  return (
    <div className="App">
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="WavesAI TS agent is typing" />
                ) : null
              }
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
