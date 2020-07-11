import fs from "fs";
import axios from "axios";
const randomColor = require("randomcolor");
const gm = require("gm").subClass({ imageMagick: true });

// 根据url和参数制定爬取内容
export async function getJsonData(url: string, params: string[]) {
  let result: string[] = [];
  let response: any = await axios.get(url);
  if (response.status === 200) {
    params.forEach((key) => {
      let data = response.data;
      if (key in data) {
        if (data[key] instanceof Array) {
          data[key] = data[key][0]; // 返回第一个匹配的
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
    return new Promise((resolve: any) => {
      resolve("success");
    });
  } else {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });
    let writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);
    return new Promise((resolve: any, reject: any) => {
      writer.on("finish", resolve("success"));
      writer.on("error", reject);
    });
  }
}

// 生成互补随机颜色
function generateColors(): [string, string] {
  let colors: [string, string] = ["", ""];
  colors[0] = randomColor({ hue: "random", luminosity: "random" });
  console.log(" color is ", colors[0]);
  colors[1] =
    "#" +
    (
      "000000" +
      (0xffffff ^ parseInt(colors[0].replace("#", "0x"))).toString(16)
    ).slice(-6);
  return colors;
}

// 将图片文件转换为base64字符串
export function img2base64(path: string): string {
  let buff = fs.readFileSync(path);
  return buff.toString("base64");
}

// 根据头像、用户名、爬取的文字生成图片，保存到指定位置
export async function generateImg(
  //   oriPath: string,
  savePath: string,
  avatarPath: string,
  userName: string
) {
  let colors: [string, string] = generateColors();
  gm("img/front.png")
    .background(colors[0]) // 背景颜色
    .mosaic() // 合成图层
    .draw(`image over 500,800 200,200 "${avatarPath}" `)
    .fontSize(68) // 字体大小
    .font("font/经典隶变简.ttf") // 字体
    .fill(colors[1]) // 字体颜色
    .drawText(0, 400, userName, "Center") // 添加用户名
    .quality(100) // 质量最高
    .write(savePath, (err: any) => {
      if (err) {
        Promise.reject(err);
      } else {
        Promise.resolve();
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
