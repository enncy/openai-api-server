import { Application } from "express";
import { OpenAIStream, } from "./openai";


export function controller(app: Application) {

    app.get('/', (req, res) => {
        res.send('hello world!')
    })

    app.post("/chat", async (req, res) => {

        const sendMessage = (content: string) => res.write(JSON.stringify({ done: false, error: false, content }) + "\n");
        const sendError = (content: string) => res.write(JSON.stringify({ done: false, error: true, content }) + "\n");
        const end = () => res.end(JSON.stringify({ done: true, error: false, content: '[DONE]' }));

        try {
            // 控制一下请求权限，防止IP漏了之后被盗用
            if (req.headers?.authorization === process.env.AUTHORIZATION_KEY) {
                await OpenAIStream({
                    // 设置模型
                    model: req.body.model || "gpt-3.5-turbo",
                    // 设置对话内容（上下文）
                    messages: req.body.messages || [],
                    max_tokens: 4096,
                    stream: true,
                }, ({ done, error, content }) => {
                    if (done) {
                        end()
                    } else {
                        console.log({ done, error, content })
                        if (error) {
                            sendError(content)
                        } else {
                            sendMessage(content)
                        }
                    }
                })
            } else {
                sendError('权限不足')
                end()
            }


        } catch (err) {
            sendError(String(err))
            end()
        }
    });
}

export function json(data?: any, message?: string) {
    return {
        code: !!data === true ? 1 : 0,
        data,
        message,
    };
}
