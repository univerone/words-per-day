import { getJsonData, generateImg, getDay } from "./utils";
// 测试函数
async  function main(){
    const text = await getJsonData('http://open.iciba.com/dsapi/',
    ['content','note']);
    await generateImg("img/test.jpg","img/听妈妈的话.jpg","听妈妈的话",getDay(),text )
  }
  
  
  main() 