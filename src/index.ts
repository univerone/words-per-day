import { Wechaty, WechatyPlugin, Message, log, FileBox } from "wechaty";
import schedule from "node-schedule";
import {IMAGE_DIR} from "./config";
import {
  generateImg,
  getDay,
  downloadFile,
  img2base64,
  getJsonData,
  date2cron,
} from "./utils";

export interface WordsPerDayConfigObject {
  /**
   * The topic of daily message
   * Default: "English"
   */
  type: string;
  /**
   * the name of room to apply this plugin
   * Default: ''
   */
  roomName: string;
  /**
   * the trigger word of this plugin
   * Default: '打卡'
   */
  trigger: string;
  /**
   * the time used to send daily meaasge, format as "8:20"
   * Default: None
   */
  sendTime: string;
}

export type WordsPerDayConfig =
  | Partial<WordsPerDayConfigObject>
  | WordsPerDayConfigObject;

const DEFAULT_CONFIG: WordsPerDayConfigObject = {
  type: "English",
  roomName: "",
  trigger: "打卡",
  sendTime: "",
};

export function WordsPerDay(config?: WordsPerDayConfig): WechatyPlugin {
  log.verbose(
    "WechatyPluginContrib",
    "WordsPerDay(%s)",
    typeof config === "undefined" ? "" : JSON.stringify(config)
  );
  // 补全配置
  const normalizedConfig: WordsPerDayConfigObject = {
    ...DEFAULT_CONFIG,
    ...config,
  };
  return function DingDongPlugin(wechaty: Wechaty) {
    log.verbose(
      "WechatyPluginContrib",
      "DingDong installing on %s ...",
      wechaty
    );

    wechaty.on("message", async (message) => {
      // 监听文字消息
      log.info(message.toString());
      const contact: any = message.from();
      if (message.type() !== Message.Type.Text) {
        log.info("not Text");
        return;
      }

      const room = message.room();
      const text = room ? await message.mentionText() : message.text();

      if (text === normalizedConfig.trigger) {
        let name: string = contact.payload.name;
        let date: string = getDay(); //当前日期
        let path: string = `${IMAGE_DIR}/${normalizedConfig.type}.jpg`;

        let avatarPath: string = `${IMAGE_DIR}/${name}.jpg`;
        await downloadFile(contact.payload.avatar, avatarPath);
        switch (normalizedConfig.type) {
          case "English":
            let words: string[] = await getJsonData(
              "http://open.iciba.com/dsapi/",
              ["content", "note"]
            );
            let state: any = await generateImg(
              "image/front.png",
              path,
              avatarPath,
              name,
              date,
              words
            );
            console.log(state);
            const imgFile = FileBox.fromBase64(
              img2base64(path),
              (name = "test.png")
            );
            if (room) {
              await room.say(imgFile);
            } else {
              await contact.say(imgFile);
            }
            break;
        }
      }
    });

    wechaty.on("login", (user) => {
      log.info("Bot", `${user.name()} logined`);
      // 设置了定时的时间
      if (normalizedConfig.sendTime.length > 0) {
        log.info(`${normalizedConfig.sendTime}`);
        schedule.scheduleJob(date2cron(normalizedConfig.sendTime), async () => {
          log.info("开始定时工作啦！");
          let room = await wechaty.Room.find({
            topic: normalizedConfig.roomName,
          });
          let words: string[] = await getJsonData(
            "http://open.iciba.com/dsapi/",
            ["content", "note"]
          ); //获取每日一句
          if (room) {
            try {
              await room.say(
                `当前时间为${getDay()}\n 今日信息为  ${words.join("\n")}`
              ); // 发送消息
            } catch (e) {
              console.log(e.message);
            }
          }
        });
      }
    });
  };
}
