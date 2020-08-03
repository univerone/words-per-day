# DailyPlugin

wechaty 每日一句插件

## 1. 安装使用

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

## 2. 参数

### 2.1 使用jsonpath选择器

jsonpath的语法可参考：

* <https://www.npmjs.com/package/JSONPath>
* <https://jsonpath.com/>

```javascript
const config = {
  rooms: ["打卡群"],// 作用每日一句的群名列表
  sendTime: "13:02",// 自动发送每日一句的时间
  trigger: "打卡",// 群内触发每日一句生成图片的关键词
  imageDir: 'image'//本地保存图片文件的路径
  name: '历史上的今天'// 每日一句数据源的名称
  type: Theme.JSON, // 每日一句数据源的类型，目前只支持Jsonpath，
  url: 'https://news.topurl.cn/api', // 每日一句数据源的网址
  selectors: ['$.data.historyList[*].event'], // 每日一句数据源的选择器列表，各个选择器的结果将使用换行符连接
};
```

![screenshot1](docs/images/screenshot1.png)

### 2.2 使用css选择器

```javascript
const config = {
  rooms: ["打卡群"],// 作用每日一句的群名列表
  sendTime: "13:02",// 自动发送每日一句的时间
  trigger: "打卡",// 群内触发每日一句生成图片的关键词
  imageDir: 'image'//本地保存图片文件的路径
  type: Theme.HTML,
  name: '每日新闻',
  url: 'https://news.topurl.cn/',
  selectors: ['.news-wrap > div.line > a']
};
```

![screenshot2](docs/images/screenshot2.png)

### 2.3 使用正则表达式

```javascript
const config = {
  rooms: ["打卡群"],// 作用每日一句的群名列表
  sendTime: "13:02",// 自动发送每日一句的时间
  trigger: "打卡",// 群内触发每日一句生成图片的关键词
  imageDir: 'image'//本地保存图片文件的路径
  type: Theme.RE,
  name: '未来三天全国天气预报',
  url: 'http://www.weather.com.cn/index/zxqxgg1/new_wlstyb.shtml',
  selectors: ['未来三天具体预报<\/p><p style="text-indent:2em;">(.*?)<\/p>']
};
```

![screenshot3](docs/images/screenshot3.png)

## 3.效果截图

### 1. 定时发送信息

见上面

### 2. 根据关键词回复打卡图片

每次生成的打卡图片颜色不同
![screenshot5](docs/images/screenshot2.png)

打卡图片的具体样式如下，显示打卡用户的头像和名字
![screenshot6](docs/images/screenshot3.png)
