export function formatConvHistory(messages) {
  return messages
    .map((message) => {
      if (message.sender === 'user') {
        return `Human: ${message.message}`;
      } else if (message.sender === 'WavesAI') {
        return `AI: ${message.message}`;
      } else {
        return ''; // Handle other senders if needed
      }
    })
    .join('\n');
}
