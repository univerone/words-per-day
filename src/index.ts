import { Wechaty, WechatyPlugin, Message, log, FileBox } from "wechaty";
import {generateImg, getDay, downloadFile } from "./utils";

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
}

export type WordsPerDayConfig =
  | Partial<WordsPerDayConfigObject>
  | WordsPerDayConfigObject;

const DEFAULT_CONFIG: WordsPerDayConfigObject = {
  type: "English",
  roomName: "",
  trigger: "打卡",
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
      log.info(message.toString())
      const contact: any = message.from();
      if (message.type() !== Message.Type.Text) {
        log.info("not Text");
        return;
      }

      const room = message.room();
      const text = room
        ? await message.mentionText()
        : message.text()

      if (text === normalizedConfig.trigger) {
        let name: string = contact.payload.name;
        let path: string = 'img/' + normalizedConfig.type+'-'+name+'-'+getDay() +'.jpg'
        let avatarPath: string = 'img/' + name + '.jpg'
        await downloadFile(contact.payload.avatar,avatarPath).then(
          (value) => {
            console.log(value);
          }
        );
        switch(normalizedConfig.type){
          case "English":            
            generateImg(path,avatarPath,name, async(sendImg: string) => {
              if (sendImg.length > 0 ) {
                try{
                  const imgFile = FileBox.fromFile(sendImg);
                  if (room) {
                    await room.say(imgFile);
                  } else {
                    await contact.say(imgFile);
                  }
                } catch(e){
                  console.log(e);
                  // if (room) {
                  //   await room.say("sorry,出现bug啦", contact);
                  // } else {
                  //   await contact.say("sorry,出现bug啦");
                  // }
                }
              }
            }); 
            break; /* 可选的 */
        }
        
      }
    });
  };
}
