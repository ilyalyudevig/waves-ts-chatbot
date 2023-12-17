import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { createClient } from '@supabase/supabase-js';

const openAIApiKey = process.env.REACT_APP_OPENAI_API_KEY;

const embeddings = new OpenAIEmbeddings({ openAIApiKey });
const sbApiKey = process.env.REACT_APP_SUPABASE_API_KEY;
const sbUrl = process.env.REACT_APP_SUPABASE_URL;
const client = createClient(sbUrl, sbApiKey);

const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: 'documents',
  queryName: 'match_documents',
});

const retriever = vectorStore.asRetriever();

export { retriever };
