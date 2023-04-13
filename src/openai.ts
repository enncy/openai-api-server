import { CreateChatCompletionRequest } from "openai";
import fetch from 'node-fetch';

/**
 * 调用 Chatgpt 接口并流式返回结果（一个字一个字的返回）
 */
export async function OpenAIStream(payload: CreateChatCompletionRequest, callback: (data: { done: boolean, error: boolean, content: string }) => void) {

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });
    const decoder = new TextDecoder();

    for await (const chunk of res.body as any) {

        const data = decoder.decode(chunk);

        try {
            for (const line of data.split("\n").filter((i) => i.trim() !== "")) {
                const msg = line.replace("data: ", "");
                if (msg === "[DONE]") {
                    callback({
                        done: true,
                        error: false,
                        content: "[DONE]",
                    });
                    return;
                }
                const json = JSON.parse(msg);
                const text = json.choices[0].delta?.content || "";
                callback({
                    done: false,
                    error: false,
                    content: text,
                });
            }
        } catch (e) {
            try {
                callback({
                    done: false,
                    error: true,
                    content: JSON.parse(data)?.error?.message,
                });
                return;
            } catch {
                callback({
                    done: false,
                    error: true,
                    content: String(e),
                });
                return;
            }
        }
    }
}