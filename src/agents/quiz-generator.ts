
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { llm } from "../lib/groq-client";
import { quizGeneratorTool } from "../tools/quiz-generator";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const tools = [quizGeneratorTool, new TavilySearchResults({ maxResults: 1 })];

const agent = await createReactAgent({
  llm,
  tools,
  prompt: "" // You can add a prompt here if needed
});

export const quizGeneratorAgent = new AgentExecutor({
  agent,
  tools,
  verbose: true,
});
