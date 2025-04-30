import { BufferMemory } from "langchain/memory";
import { ChatOpenAI } from "@langchain/openai";
import { OpenApiToolkit } from "langchain/agents";
import { JsonSpec } from "langchain/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Indicate this is an Edge Function
export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const userMessage: string = body.messages?.slice(-1)[0]?.content || "";

  // Initialize LLM and memory
  const model = new ChatOpenAI({ 
    openAIApiKey: process.env.OPENAI_API_KEY, 
    modelName: process.env.OPENAI_MODEL, 
    temperature: 0.3,
    streaming: true 
  });
  const memory = new BufferMemory({ memoryKey: "chat_history" });

  // Load or define OpenAPI spec (embedded or from URL)
  // For example, import a local JSON file or URL:
  // const apiSpec = await fetch("https://api.example.com/openapi.json").then(r => r.json());
  const apiSpec = {/* JSON OpenAPI spec here */};
  const toolkit = new OpenApiToolkit(new JsonSpec(apiSpec), model, {
    Authorization: `Bearer ${process.env.API_KEY || ""}`
  });
  const tools = toolkit.getTools();

  // Create a conversational agent with the OpenAPI tools
  const agentExecutor = createReactAgent({ llm: model, tools });

  // (Optional) Load conversation history from persistence (e.g. KV or Redis) and prepend to messages
  // e.g. const history = JSON.parse(await KV.get(`history:${userId}`) || "[]");
  // Build message array: history + new user message
  const messages = [
    // ...historyMessages...
    ["user", userMessage],
  ];

  // Stream agent execution
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const events = await agentExecutor.stream({ messages }, { streamMode: "values" });

  for await (const event of events) {
    const lastMsg = event.messages[event.messages.length - 1];
    // If the agent calls a tool, track it (for analytics/Markov usage)
    if (lastMsg.tool_calls?.length) {
      console.log("Tool called:", lastMsg.tool_calls);
      // e.g. increment counts in a store
    }
    // Write partial content as it arrives
    if (lastMsg.content) {
      await writer.write(encoder.encode(lastMsg.content));
    }
  }
  writer.close();
  // Return streaming response (text/plain). CopilotKit will display tokens progressively.
  return new Response(stream.readable, { status: 200, headers: { "Content-Type": "text/plain" } });
}
