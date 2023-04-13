import express from "express";
import path from "path";
import { controller } from "./controller";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
const app = express();

console.log('AUTHORIZATION_KEY:', process.env.AUTHORIZATION_KEY);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);

/** 解析 post 数据 */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
/** 静态资源 */
app.use(express.static(path.join(__dirname, "../public")));

// 跨域
app.use('*', function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("Access-Control-Allow-Methods", "*")
    if (req.method === 'OPTIONS') {
        res.sendStatus(204)
        return
    }
    next();
});


app.listen(process.env.SERVER_PORT, () => {
    console.log("服务器启动， http://localhost:" + process.env.SERVER_PORT);
    // 控制器
    controller(app);
});

