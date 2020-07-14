import fs from "fs";
import axios from "axios";
import gm from "gm";
const im = gm.subClass({ imageMagick: true });

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
  let colorMap: string[] = [
    "#7d2828",
    "#683671",
    "#584480",
    "#464678",
    "#384c70",
    "#23556f",
    "#2d6a6c",
    "#166856",
    "#20452a",
    "#645f46",
    "#7d644a",
    "#865846",
    "#76443c",
    "#6c3636",
    "#491616",
    "#123908",
    "#192053",
    "#3e318c",
    "#20554f",
    "#8a5837",
    "#516451",
  ];
  colors[0] = colorMap[Math.floor(Math.random() * colorMap.length)];
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
  oriPath: string,
  savePath: string,
  avatarPath: string,
  userName: string,
  date: string,
  words: string[]
) {
  let colors: [string, string] = generateColors();
  return new Promise((resolve: any, reject: any) => {
    im(oriPath)
      .background(colors[0]) // 背景颜色
      .mosaic() // 合成图层
      .draw(`image over 455,732 114,114 "${avatarPath}" `) // 绘制头像
      .fill("#ffffff") // 字体颜色
      .font("font/经典隶变简.ttf") // 字体    .font("font/经典隶变简.ttf") // 字体
      .fontSize(40)
      .drawText(108, 494, splitChar(words[1], 10)) // 中文
      .fontSize(28) // 字体大小
      .drawText(0, 390, userName, "Center") // 添加用户名
      .fontSize(26) // 字体大小
      .drawText(860, 155, getWeekDays()) // 星期
      .font("font/Maecenas-ExtraLight.ttf")
      .drawText(
        850,
        105,
        date.slice(0, 4) + " " + date.slice(4, 6) + "/" + date.slice(6, 8)
      ) //年份
      .fontSize(40)
      .drawText(108, 340, splitWords(words[0], 8)) // 英文
      .quality(100) // 质量最高
      .write(savePath, (err: any) => {
        if (err) {
          reject;
        } else {
          resolve("success");
        }
      });
  });
}

// 获取当前日期
export function getDay(): string {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();
  let M: string = m > 9 ? String(m) : "0" + String(m);
  let D: string = d > 9 ? String(d) : "0" + String(d);
  return `${y}${M}${D}`;
}

//获取当前星期
function getWeekDays(): string {
  let date = new Date();
  let weekMap = [
    "星期天",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  return weekMap[date.getDay()];
}

//英文自动换行,指定换行的单词个数
function splitWords(sentence: string, num: number): string {
  var pattern = new RegExp(`((?:(?:\\S+\\s){${num}})|(?:.+)(?=\\n|$))`, "g");
  var result = sentence.match(pattern);
  return result ? result.join("\n") : "";
}

//中文自动换行，指定换行的文字个数, 如果有逗号的话直接分割
function splitChar(str: string, len: number): string {
  if (str.includes("，")) {
    return str.replace("，", "，\n");
  } else {
    var ret = [];
    for (var offset = 0, strLen = str.length; offset < strLen; offset += len) {
      ret.push(str.slice(offset, len + offset));
    }
    return ret ? ret.join("\n") : "";
  }
}

// 时间字符串转换为cron格式
export function date2cron(str: string): string {
  let hour: string = str.split(":")[0];
  let minutes: string = str.split(":")[1];
  return `01 ${minutes} ${hour} * * *`;
}
