import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { getMcpClient } from "@/lib/mcp";
import { z } from "zod";

export const maxDuration = 60; // Allow long executions for multi-step AI

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const mcp = await getMcpClient();
    const mcpToolsResult = await mcp.listTools();
    
    const aiTools: Record<string, any> = {};

    // Dynamically map MCP tools to Vercel AI SDK tools
    for (const t of mcpToolsResult.tools) {
      aiTools[t.name] = tool({
        description: t.description ? `${t.description}\n\nIMPORTANT JSON SCHEMA for arguments: ${JSON.stringify(t.inputSchema)}` : `Tool: ${t.name}`,
        parameters: z.record(z.any()), // Accept any object, we rely on the LLM to follow the JSON schema in the description
        execute: async (args) => {
          try {
            console.log(`Executing MCP tool: ${t.name} with args:`, args);
            const result = await mcp.callTool({
              name: t.name,
              arguments: args
            });
            return result.content;
          } catch (e: any) {
            console.error(`Error executing ${t.name}:`, e);
            return { error: e.message || "Failed to execute tool" };
          }
        }
      });
    }

    const systemPrompt = `You are a helpful, witty, and warm AI shopping assistant for Kapruka (Sri Lanka's premier e-commerce platform).
Your goal is to help users discover products, answer questions, and seamlessly guide them to add items to their cart and checkout.
You support Tanglish (Tamil written in English) and Sinhala if the user uses them. If the user speaks Sinhala or Tanglish, reply in the same language natively!

Guidelines:
1. Always be visually descriptive and structured.
2. Use the provided Kapruka tools to search for products, get delivery constraints, create carts/orders, and get guest checkout links.
3. Keep conversation engaging. Do not overwhelm the user with large walls of text.
4. When showing products, format them nicely. If you fetch products, summarize the key details (price, name) elegantly.
5. Emphasize a premium shopping experience.`;

    const result = streamText({
      model: google("gemini-1.5-pro"),
      system: systemPrompt,
      messages,
      tools: aiTools,
      maxSteps: 5, // Allow the model to call tools and observe results multiple times
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
