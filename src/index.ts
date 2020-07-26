/* eslint-disable no-case-declarations */
import { Wechaty, WechatyPlugin, Message, log, FileBox, Room } from 'wechaty'
import schedule from 'node-schedule'
import {
  generateImg,
  getDay,
  downloadFile,
  img2base64,
  getJsonData,
  date2cron,
  Theme,
} from './utils'

/**
 * 定义ConfigObject类型
 */
export interface WordsPerDayConfigObject {
  /**
   * 每日一句的默认主题
   * Default: Theme.English
   */
  type: Theme;
  /**
   * 应用的群聊的名称列表
   * Default: []
   */
  rooms: string[];
  /**
   * 触发图片发送的关键词
   * Default: '打卡'
   */
  trigger: string;
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
  rooms: [],
  sendTime: '',
  trigger: '打卡',
  type: Theme.English,
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
  const normalizedConfig: WordsPerDayConfigObject = {
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
      const text = message.text()
      if (room) {
        const topic = await room.topic()
        if (normalizedConfig.rooms.includes(topic)) {
          // 消息在指定的群里面
          if (text === normalizedConfig.trigger) {
            // 消息内容为触发词
            let name: string = contact.payload.name
            const path: string = `${normalizedConfig.imgFolder}/${normalizedConfig.type}.jpg`
            const avatarPath: string = `${normalizedConfig.imgFolder}/${name}.jpg`
            await downloadFile(contact.payload.avatar, avatarPath)
            switch (normalizedConfig.type) {
              case Theme.English:
                const state: string = await generateImg(path, avatarPath, name)
                log.info(state) // 图片生成状态
                const imgFile = FileBox.fromBase64(
                  img2base64(path),
                  (name = 'test.png')
                )
                await room.say(imgFile)
                break
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
      if (normalizedConfig.sendTime.length > 0) {
        log.info(`${normalizedConfig.sendTime}`)
        schedule.scheduleJob(date2cron(normalizedConfig.sendTime), async () => {
          log.info('开始定时工作啦！')
          const rooms = normalizedConfig.rooms.map(async (name) =>
            wechaty.Room.find({
              topic: name,
            })
          )
          const words: string[] = await getJsonData(
            'http://open.iciba.com/dsapi/',
            ['content', 'note']
          ) // 获取每日一句
          rooms.forEach(async (room) => {
            if (room instanceof Room) {
              try {
                await room.say(
                  `当前时间为${getDay()}\n今日信息为\n${words.join('\n')}`
                )
              } catch (e) {
                log.info(e.message)
              }
            }
          })
        })
      }
    })
  }
}
