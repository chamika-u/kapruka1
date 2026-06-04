const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");

async function run() {
  const transport = new SSEClientTransport(new URL("https://mcp.kapruka.com/mcp"));
  const client = new Client({ name: "test", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  const tools = await client.listTools();
  console.log("Tools available:", tools.tools.map(t => t.name));
  
  try {
    const res = await client.callTool({
      name: "kapruka_search_products",
      arguments: { q: "cakes", limit: 3 }
    });
    console.log("Tool result:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Error calling tool:", e);
  }
  process.exit(0);
}
run();
