import { generateImg } from './utils'

async function main () {
  const string = await generateImg('听妈妈的话.jpg', '听妈妈的话')
  // eslint-disable-next-line no-console
  console.log(string)
}

// eslint-disable-next-line no-console
main().catch(console.log)
