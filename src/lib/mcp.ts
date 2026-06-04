import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Global cache to avoid reconnecting on every hot reload in dev
let mcpClient: Client | null = null;

export async function getMcpClient() {
  if (mcpClient) return mcpClient;

  console.log("Initializing MCP Client...");
  
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "mcp-remote", "https://mcp.kapruka.com/mcp"]
  });

  mcpClient = new Client({
    name: "kapruka-agent",
    version: "1.0.0"
  });

  await mcpClient.connect(transport);
  console.log("MCP Client connected successfully.");
  return mcpClient;
}
