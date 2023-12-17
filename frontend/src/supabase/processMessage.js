import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { retriever } from './utils/retriever.js';
import { combineDocuments } from './utils/combineDocuments.js';
import {
  RunnablePassthrough,
  RunnableSequence,
} from 'langchain/schema/runnable';
import { formatConvHistory } from './utils/formatConvHistory.js';

const openAIApiKey = process.env.REACT_APP_OPENAI_API_KEY;

const llm = new ChatOpenAI({ openAIApiKey });

const standaloneQuestionTemplate = `
  Given some conversation history (if any) and a question, convert it to a standalone question. 
  conversation history: {conv_history}
  question: {question} standalone question:
  `;

const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

const answerTemplate = `
    You are a helpful and enthusiastic support bot who can answer a given question about Waves SoundGrid based on the context provided. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to submit a support ticket at https://www.waves.com/contact-support. Don't try to make up an answer. Always speak as if you were chatting to a friend.
    context: {context}
    question: {question}
    conversation history: {conv_history}
    answer:
`;

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

const standaloneQuestionChain = RunnableSequence.from([
  standaloneQuestionPrompt,
  llm,
  new StringOutputParser(),
]);

const retrieverChain = RunnableSequence.from([
  (prevResult) => prevResult.standalone_question,
  retriever,
  combineDocuments,
]);
const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

const chain = RunnableSequence.from([
  {
    standalone_question: standaloneQuestionChain,
    original_input: new RunnablePassthrough(),
  },
  {
    context: retrieverChain,
    question: ({ original_input }) => original_input.question,
    conv_history: ({ original_input }) => original_input.conv_history,
  },
  answerChain,
]);

async function processMessage(question, convHistory) {
  const response = await chain.invoke({
    question: question,
    conv_history: formatConvHistory(convHistory),
  });
  convHistory.push(question);
  convHistory.push(response);

  console.log(formatConvHistory(convHistory));

  return response;
}

export { processMessage };
