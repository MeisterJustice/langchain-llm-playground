import * as dotenv from "dotenv";
dotenv.config();

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const run = async () => {
  // Define the tools for the agent to use
  const agentTools = [new TavilySearchResults({ maxResults: 3 })];
  const agentModel = new ChatOpenAI({ temperature: 0, model: "gpt-4o" });

  // Initialize memory to persist state between graph runs
  const agentCheckpointer = new MemorySaver();
  const agent = createReactAgent({
    llm: agentModel,
    tools: agentTools,
    checkpointSaver: agentCheckpointer,
  });

  // Now it's time to use!
  const agentFinalState = await agent.invoke(
    {
      messages: [
        new HumanMessage("describe the current weather in Lagos, Nigeria"),
      ],
    },
    { configurable: { thread_id: "42" } }
  );

  console.log(
    agentFinalState.messages[agentFinalState.messages.length - 1].content
  );

  const agentNextState = await agent.invoke(
    { messages: [new HumanMessage("what about Abuja")] },
    { configurable: { thread_id: "42" } }
  );

  console.log(
    agentNextState.messages[agentNextState.messages.length - 1].content
  );
};

run();
