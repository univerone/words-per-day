import { Wechaty, log, Message } from 'wechaty'
import { generate } from 'qrcode-terminal'
import { WordsPerDay, WordsPerDayConfig } from './index'
import { Theme } from './utils'
const bot = new Wechaty({
  name: 'WordsPerDay-bot',
})

const config: WordsPerDayConfig = {
  rooms: ['不打卡就给钱'],
  sendTime : '13:02',
  trigger: '打卡',
  type: Theme.English,
}

bot.use(WordsPerDay(config))

async function onMessage (msg: Message) {
  log.info('StarterBot', msg.toString())
  if (msg.text() === '打卡') {
    log.info('hello')
  }
}
bot
  // .on('login', (user) => log.info('Bot', `${user.name()} logined`))
  .on('logout', (user) => log.info('Bot', `${user.name()} logouted`))
  .on('error', (e) => log.info('Bot', 'error: %s', e))
  .on('scan', (qrcode, status) => {
    generate(qrcode)
    // eslint-disable-next-line no-console
    console.log(`${qrcode}\n[${status}] Scan QR Code in above url to login: `)
  })
  .on('message', onMessage)

bot.start()
  .catch(async e => {
    console.error('Bot start() fail:', e)
    await bot.stop()
    process.exit(-1)
  })
