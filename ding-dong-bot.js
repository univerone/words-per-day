/**
 * Wechaty - WeChat Bot SDK for Personal Account, Powered by TypeScript, Docker, and 💖
 *  - https://github.com/chatie/wechaty
 */
const {
  log,
  Wechaty,
}           = require('wechaty')

const { FileBox }  = require('file-box')
const qrTerm = require('qrcode-terminal')

async function onMessage (msg) {
  log.info('StarterBot', msg.toString())
  if (msg.text === '打卡') {
    log.info('hello')
  }
}

const bot = new Wechaty({
  name: 'ding-dong-bot',
  /**
   * Specify a puppet for a specific protocol (Web/Pad/Mac/Windows, etc).
   *
   * You can use the following providers:
   *  - wechaty-puppet-hostie
   *  - wechaty-puppet-puppeteer
   *  - wechaty-puppet-padplus
   *  - wechaty-puppet-macpro
   *  - etc.
   *
   * Learn more about Wechaty Puppet Providers at:
   *  https://github.com/wechaty/wechaty-puppet/wiki/Directory
   */
  // puppet: 'wechaty-puppet-wechat4u',
  // Set as above, or set using environment variable WECHATY_PUPPET
})

bot
  .on('login', (user) => log.info('Bot', `${user.name()} logined`))
  .on('logout', (user) => log.info('Bot', `${user.name()} logouted`))
  .on('error', (e) => log.info('Bot', 'error: %s', e))
  .on('scan', (qrcode, status) => {
    qrTerm.generate(qrcode)
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
