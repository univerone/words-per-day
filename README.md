# DailyPlugin

wechaty 每日一句插件

## 安装使用

```javascript
import { Wechaty } from "wechaty";
import { WordsPerDay, WordsPerDayConfig } from "./index";
const bot = new Wechaty();
bot
  .use(WordsPerDay(/*config*/))
  .on("login", (user) => log.info("Bot", `${user.name()} logined`))
  .on("logout", (user) => log.info("Bot", `${user.name()} logouted`))
  .on("error", (e) => log.info("Bot", "error: %s", e));
bot.start();
```

## 参数

```bash
const config: WordsPerDayConfig = {
  type: "English", // 每日一句的类型，目前只支持English
  roomName: "不打卡就给钱", // 作用每日一句的群名
  trigger: "打卡", // 触发每日一句生成图片的关键词
  sendTime : "12:40" // 自动发送每日一句的时间
};

```

## 效果截图

![screenshot1](image/screenshot1.jpg)
![screenshot2](image/screenshot2.jpg)
