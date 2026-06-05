import { streamText, jsonSchema, stepCountIs, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { getMcpClient } from "@/lib/mcp";
import type { Tool } from "ai";
import { rateLimit } from "@/lib/rate-limiter";
import { trackOrder, checkDeliveryAvailability } from "@/lib/kapruka-api";

export const maxDuration = 60; // Allow long executions for multi-step AI

export async function POST(req: Request) {
  try {
    // 1. Apply API Rate Limiting for Abuse Prevention
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success, reset } = rateLimit(ip, 20, 60000); // 20 reqs / min
    if (!success) {
      return new Response(
        JSON.stringify({ error: `Rate limit reached. Please try again after ${new Date(reset).toLocaleTimeString()}` }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }

    const { messages } = await req.json();
    const mcp = await getMcpClient();
    const mcpToolsResult = await mcp.listTools();

    const aiTools: Record<string, Tool<any, any>> = {};

    // Dynamically map MCP tools to Vercel AI SDK v6 tools
    for (const t of mcpToolsResult.tools) {
      aiTools[t.name] = {
        description: t.description
          ? `${t.description}\n\nIMPORTANT JSON SCHEMA for arguments: ${JSON.stringify(t.inputSchema)}`
          : `Tool: ${t.name}`,
        inputSchema: jsonSchema(t.inputSchema as any),
        execute: async (args: Record<string, unknown>) => {
          try {
            console.log(`Executing MCP tool: ${t.name} with args:`, args);
            const result = await mcp.callTool({
              name: t.name,
              arguments: args,
            });
            console.log(`Tool Result for ${t.name}:`, JSON.stringify(result.content, null, 2));
            return result.content;
          } catch (e: any) {
            console.error(`Error executing ${t.name}:`, e);
            return { error: e.message || "Failed to execute tool" };
          }
        },
      };
    }

    // 2. Inject Local Kapruka Ecosystem Tools
    aiTools["track_order"] = {
      description: "Track a user's Kapruka order using their order ID. Returns the current status and estimated delivery date.",
      parameters: jsonSchema({
        type: "object",
        properties: {
          orderId: { type: "string", description: "The ID of the order to track" }
        },
        required: ["orderId"]
      } as any),
      execute: async ({ orderId }) => {
        return await trackOrder(orderId as string);
      }
    };

    aiTools["check_delivery_availability"] = {
      description: "Check if delivery is available for a specific location and date in Sri Lanka.",
      parameters: jsonSchema({
        type: "object",
        properties: {
          location: { type: "string", description: "The city or region" },
          date: { type: "string", description: "The requested delivery date (YYYY-MM-DD)" }
        },
        required: ["location", "date"]
      } as any),
      execute: async ({ location, date }) => {
        return await checkDeliveryAvailability(date as string, location as string);
      }
    };

    const systemPrompt = `You are a helpful, witty, and warm AI shopping assistant for Kapruka (කප්රුක) — Sri Lanka's premier e-commerce platform.
Your goal is to help users discover products, answer questions, and seamlessly guide them to add items to their cart and checkout.

## Language Support — CRITICAL
You MUST detect and match the user's language:

### Sinhala (සිංහල)
If the user writes in Sinhala script (e.g., "උපන්දින කේක් එකක් ඕන", "මට මල් යවන්න ඕන"), respond ENTIRELY in Sinhala.
Use natural, conversational Sinhala. Examples:
- "ආයුබෝවන්! කප්රුකට සාදරයෙන් පිළිගනිමු 🙏"
- "ඔබට උපන්දින කේක් බලමු! මේ තියෙන අපේ ජනප්‍රිය කේක් 🎂"
- "මිල රු. 3,500 සිට ආරම්භ වේ"
- "ඔබේ කරත්තයට එක් කරමු ද?"

### Tanglish (Tamil written in English/Latin script)
If the user writes in Tanglish (Tamil transliterated to English), respond in Tanglish naturally.
Common Tanglish patterns to detect:
- Greetings: "vanakkam", "epdi irukeenga", "nalla irukken"
- Shopping: "cake venum", "enna irukku", "evlo", "vilai enna"
- Requests: "birthday ku gift venum", "amma ku flowers anupanum", "order podu"
- Confirmations: "seri", "ok podu", "adhu nalla irukku", "checkout pannu"
Example Tanglish responses:
- "Vanakkam! Kapruka la neenga thediradha sollunga 🛒"
- "Birthday cake ah? Namma kitta romba nalla options irukku 🎂"
- "Idhu ungaluku pidikkuma? Cart la podava?"
- "Price: LKR 3,500. Nalla deal dhan!"

### English
Default to English if the user writes in English. Keep it warm, premium, and conversational.

### Code-switching
Users may mix languages (e.g., "මට birthday cake එකක් ඕන" or "cake enna price"). Match their style naturally — don't force one language.

## Shopping Experience Guidelines
1. Always be visually descriptive and structured.
2. Use the provided Kapruka tools to search for products, get delivery constraints, create carts/orders, and get guest checkout links.
3. Keep conversation engaging. Do not overwhelm the user with large walls of text.
4. When showing products, format them nicely. If you fetch products, summarize the key details (price, name) elegantly.
5. Emphasize a premium shopping experience.

## Cart & Checkout Flow
- When the user asks to checkout, use the create_cart tool with ALL items and their quantities.
- If items have gift messages, include the gift message when creating the cart item.
- If items have delivery dates, use the delivery date when creating the cart.
- After creating the cart, immediately generate a guest checkout link using the guest_checkout tool.
- Present the checkout link clearly to the user.

## Gift Messaging
- If the user wants to send a gift, ask for a personal message.
- Include the gift message when adding items to the cart.
- Be warm about it: "That's a lovely message! 🎁"

## Delivery Dates
- When relevant, use get_delivery_dates to check available delivery windows.
- Proactively suggest delivery dates for gift orders.
- Warn users about delivery constraints (e.g., same-day cutoff times).`;

    const modelMessages = await convertToModelMessages(messages, { tools: aiTools });

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: modelMessages,
      tools: aiTools,
      stopWhen: stepCountIs(5), // Allow the model to call tools and observe results multiple times
      maxRetries: 2, // Reduce retries to avoid hammering the API on rate limits
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);

    // Handle rate limit (429) errors gracefully
    const statusCode = error?.statusCode || error?.lastError?.statusCode || error?.data?.error?.code;
    const isRateLimit = statusCode === 429 || error?.reason === "maxRetriesExceeded";

    if (isRateLimit) {
      // Extract retry delay from error message if available
      const retryMatch = error?.message?.match(/retry in ([\d.]+)s/i);
      const retryAfter = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;

      return new Response(
        JSON.stringify({
          error: `Rate limit reached. The free-tier Gemini API allows 20 requests/minute. Please wait ${retryAfter} seconds and try again.`,
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
