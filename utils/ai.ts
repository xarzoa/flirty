import { env } from "@/config";
import Collection from "@/mongo";
import { OctoAIClient } from "@octoai/sdk";

const client = new OctoAIClient({ apiKey: env.OCTO_KEY });

const messages = new Collection("messages");

interface Message {
  role: "user" | "assistant";
  content: string;
}


export async function createResponse(message: string, user: number) {
  const oldMessages = await messages.find({ user: user }).limit(16).sort({ _id: -1 }).project({ _id: 0 }).execute();
  let aMessages: Message[] = []
  oldMessages.map((message) => {
    aMessages.push({
      role: "user",
      content: message.message
    })
    aMessages.push({
      role: 'assistant',
      content: message.response
    })
  })
  aMessages = aMessages.reverse()
  console.log(aMessages)
  const _messages: Message[] = [
    ...aMessages,
    {
      role: "user",
      content: message
    }
  ]
  const response = await client.textGen.createChatCompletion({
    messages: [
      {
        role: "system",
        content: env.MESSAGE
      },
      ..._messages
    ],
    model: "meta-llama-3.1-8b-instruct",
    maxTokens: 512,
    temperature: 0.8,
    presencePenalty: 0,
    topP: 1,
    stop: ["<|eot_id|>"],
  }).catch(e => console.log(e))
  const res = response?.choices[0].message?.content;
  const usage = response?.usage.totalTokens
  if (res && usage) {
    await messages.create({
      user, message, response: res, tokens: usage
    });
  }
  return res || "oh, something happend, i'm hurt. please try again :(";
}
