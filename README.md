# Words-Per-Day Wechaty Plugin

![logo](docs/images/logo.png)

## 1. Basic Usage

```javascript
const { Wechaty, log} = require("wechaty");
const { WordsPerDay} = require("words-per-day");
const bot = new Wechaty();
bot
  .use(WordsPerDay(/*config*/))
  .on("login", (user) => log.info("Bot", `${user.name()} logined`))
  .on("logout", (user) => log.info("Bot", `${user.name()} logouted`))
  .on("error", (e) => log.info("Bot", "error: %s", e));
bot.start();
```

## 2. Customized Data Sources

You can implement the following function to use self-defined source of the data

```javascript
export interface getWordsFunc {
  (): Promise<string>;
}
```

You can refer to the following links if you don't know JsonPath expressions：

* <https://www.npmjs.com/package/JSONPath>
* <https://jsonpath.com/>

```javascript
async function getDailyEnglish(){
    return getWords(
        Theme.JSON,
        'https://apiv3.shanbay.com/weapps/dailyquote/quote/',
        ['content', 'translation']
    );
}

const config = {
  rooms: ["Group"],// the name of targeted group chat
  sendTime: "13:02",// Time for automatic delivery of the daily meaasge
  trigger: "Hello",// Trigger word for the delivery of the daily meaasge
  imageDir: 'image',// Local directory to store images
  imageStyle: 0, // Style of images to be sent, only support 0 and 1 for now
  name: 'DailyEnglish',// the name of the bot
  func: getDailyEnglish // the name of function which specify data sources
};
```

## 3.Screenshots

### 1. Scheduled Messages

![screenshot1](docs/images/screenshot1.png)

### 2. Reply Daily Images and Quotes

#### 2.1 Style 1

For each message, the image color changes.
![screenshot2](docs/images/screenshot2.png)

The specific style of the image is as follows, showing the user's avatar and name
![screenshot3](docs/images/screenshot3.png)

#### 2.2  Style 2

![screenshot4](docs/images/screenshot4.png)

The specific style of the image is as follows:
![screenshot5](docs/images/screenshot5.png)
