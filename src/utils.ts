import fs from "fs";
import axios from "axios";
const randomColor = require("randomcolor");
const gm = require("gm").subClass({ imageMagick: true });

//回调函数接口
interface ICallback {
	( path: string ) : any;
}

// 根据url和参数制定爬取内容
async function getJsonData(url: string, params: string[]) {
  let result: string[] = [];
  let response: any = await axios.get(url);
  if (response.status == 200) {
    params.forEach((key) => {
      let data = response.data;
      if (key in data) {
        if (data[key] instanceof Array) {
          data[key] = data[key][0]; //返回第一个匹配的
        }
        result.push(data[key]);
      }
    });
  }
  return result;
}

// 下载文件到本地
export async function downloadFile(url: string, localPath: string) {
  if (fs.existsSync(localPath)) {
    console.log("file existed: ", localPath);
  } else {
  const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
  });
  let writer = fs.createWriteStream(localPath)
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
  }).catch(error => console.log('caught', error));
}
}



//生成互补随机颜色
function generateColors(): [string, string] {
  let colors: [string, string] = ["", ""];
  colors[0] = randomColor({hue: 'random',luminosity: 'random'});
  console.log(" color is ", colors[0]);
  colors[1] =
    "#" +
    (
      "000000" +
      (0xffffff ^ parseInt(colors[0].replace("#", "0x"))).toString(16)
    ).slice(-6);
  return colors;
}

//根据头像、用户名、爬取的文字生成图片，保存到指定位置
export async function generateImg(
  //   oriPath: string,
  savePath: string,
  avatarPath: string,
  userName: string,
  callback: ICallback
) {
  let colors: [string, string] = generateColors();
  gm("img/front.png")
    .background(colors[0]) //背景颜色
    .mosaic() // 合成图层
    .draw(`image over 800,150 100,100 "${avatarPath}" `)
    .fontSize(68) //字体大小
    .font("font/经典隶变简.ttf") //字体
    .fill(colors[1]) // 字体颜色
    .drawText(0, 400, userName, "Center") //添加用户名
    .quality(100) //质量最高
    .write(savePath, async function (err: any) {
      if (!err) {
        console.log("finished");
        callback(savePath);
      } else {
        console.log("failed");
        callback('');
      }
    });
}

// 获取当前日期
export function getDay() {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();

  return `${y}${m}${d}`;
}

getJsonData("https://apiv3.shanbay.com/weapps/dailyquote/quote/", [
  "poster_img_urls",
  "share_img_urls",
]).then((v: string[]) => {
  downloadFile(v[0], "img/test2.png");
});
