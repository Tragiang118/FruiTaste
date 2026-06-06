const { groq } = require("@ai-sdk/groq");
const { generateText } = require("ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  console.log("GROQ_API_KEY present:", !!process.env.GROQ_API_KEY);
  console.log("GROQ_API_KEY length:", process.env.GROQ_API_KEY?.length);
  
  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: "Hello, who are you?",
    });
    console.log("Success! Response:", text);
  } catch (error) {
    console.error("FAIL:", error);
  }
}

main();
