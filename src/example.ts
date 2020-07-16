import { getREData } from "./utils";
// 测试函数
async function main() {
  const text = await getREData("http://www.cnr.cn/newspaper/", [
    '/..(.*?)".*2020-7-14 新闻和报纸摘要全文/',
  ]);
  console.log(text);
  // await generateImg("image/front.jpg","img/test.jpg","img/听妈妈的话.jpg","听妈妈的话",getDay(),text )
}

main();
