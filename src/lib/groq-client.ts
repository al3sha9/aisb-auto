
import { ChatGroq } from "@langchain/groq";

export const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
});
