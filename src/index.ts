import {
  Theme,
  generateImg,
  getDay,
  downloadFile,
  date2cron,
  getWordsFunc,
  getWords,
  getREData,
  onlineImg2ase64,
  img2base64,
} from './utils'
/* eslint-disable no-case-declarations */
import { Wechaty, WechatyPlugin, Message, log, FileBox, Room } from 'wechaty'
import schedule from 'node-schedule'
import fs from 'fs'
/**
 * 定义ConfigObject类型
 */
export interface WordsPerDayConfigObject {
    /**
   * 每日一句的名称
   * Default: 每日一句
   */
  name: string;
  /**
   * 每日一句的解析函数
   * Default: async () => getJsonData(
   * 'https://apiv3.shanbay.com/weapps/dailyquote/quote/',
   * ['content', 'translation']
   * );
   */
  source: getWordsFunc;
  /**
   * 应用的群聊的名称列表
   * Default: []
   */
  rooms: string[];
  /**
   * 触发发送的关键词
   * Default: '打卡'
   */
  trigger: string;
  /**
   * 是否生成打卡图片
   * Default: true
   */
  makeImg: boolean;
  /**
   * 在群里定时发送的时间, 示例格式为 "8:20"
   * Default: None
   */
  sendTime: string;
    /**
   * 保存临时图片的文件夹
   * Default: .
   */
  imgFolder: string;
}

/**
 * 定义config类型，任何值可以缺失
 */
export type WordsPerDayConfig =
  | Partial<WordsPerDayConfigObject>
  | WordsPerDayConfigObject;

/**
 * 默认的config
 */
const DEFAULT_CONFIG: WordsPerDayConfigObject = {
  imgFolder: '.',
  makeImg: true,
  name: '每日一句',
  rooms: [],
  sendTime: '',
  source: async () =>  await getWords(Theme.JSON,
    'https://apiv3.shanbay.com/weapps/dailyquote/quote/',
    ['content', 'translation']
  ),
  trigger: '打卡',
}

/**
 * 每日一句插件主类
 * @param config 每日一句插件的配置
 */
export function WordsPerDay (config?: WordsPerDayConfig): WechatyPlugin {
  log.verbose(
    'WechatyPluginContrib',
    'WordsPerDay(%s)',
    typeof config === 'undefined' ? '' : JSON.stringify(config)
  )
  // 补全配置
  const conf: WordsPerDayConfigObject = {
    ...DEFAULT_CONFIG,
    ...config,
  }
  return function DingDongPlugin (wechaty: Wechaty) {
    log.verbose(
      'WechatyPluginContrib',
      'DingDong installing on %s ...',
      wechaty
    )

    /**
     * 根据关键词触发每日信息
     */
    wechaty.on('message', async (message) => {
      log.info(message.toString())
      const contact: any = message.from()
      if (message.type() !== Message.Type.Text) {
        log.info('not Text')
        return
      }

      const room = message.room()
      if (room) {
        const topic = await room.topic()
        if (conf.rooms.includes(topic)) {
          // 消息在指定的群里面
          if (await message.mentionSelf()) { // 机器人被at
            const text = await message.mentionText()
            if (text === conf.trigger) {
              let words: string = await conf.source()
              const imgUrls: string[] = getREData(words, ['(http.+(png|jpeg)?)'])
              words = words.replace(/\n(http.+(png|jpeg)?)/g, '')
              await room.say(`当前时间为${getDay()}\n${conf.name}为\n${words}`)
              imgUrls.forEach(async (imgUrl) => {
                await room.say(
                  FileBox.fromBase64(
                    await onlineImg2ase64(imgUrl.replace('\n', '')), 'image.png')
                )
              })
              // 消息内容为触发词
              if (conf.makeImg) {
                const name: string = contact.payload.name
                const avatarPath: string = `${conf.imgFolder}/${name}.jpg`
                await downloadFile(contact.payload.avatar, avatarPath)
                await generateImg(avatarPath, name)
                const imgFile = FileBox.fromBase64(img2base64(avatarPath), 'image.png')
                await room.say(imgFile)
                try {
                  fs.unlinkSync(avatarPath)
                } catch (error) {
                  log.info(error)
                }
              }
            }
          }
        }
      }
    })

    /**
     * 定时发送信息
     */
    wechaty.on('login', (user) => {
      log.info('Bot', `${user.name()} logined`)
      if (conf.sendTime.length > 0) {
        log.info(`${conf.sendTime}`)
        schedule.scheduleJob(date2cron(conf.sendTime), async () => {
          const rooms = conf.rooms.map(async (name) =>
            wechaty.Room.find({
              topic: name,
            })
          )
          const words: string = await conf.source()
          // 获取每日一句
          for (const room of rooms) {
            if (room instanceof Room) {
              try {
                await room.say(
                  `当前时间为${getDay()}\n今日信息为\n${words}`
                )
              } catch (e) {
                log.info(e.message)
              }
            }
          }
        })
      }
    })
  }
}
