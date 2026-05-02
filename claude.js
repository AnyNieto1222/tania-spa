import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: "TU_API_KEY_AQUI",
});

const input = process.argv.slice(2).join(" ");

async function run() {
  const msg = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 200,
    messages: [
      { role: "user", content: input }
    ],
  });

  console.log(msg.content);
}

run();