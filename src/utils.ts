import fs from "fs";
import axios from "axios";
import gm from "gm";
import { FONT_DIR, IMAGE_DIR } from "./config";
import { JSONPath } from "jsonpath-plus";
import cheerio from "cheerio";
import { log } from "wechaty";
import puppeteer from "puppeteer";
const im = gm.subClass({ imageMagick: true });

/**
 * 用户自定义的解析函数
 */
export interface getWordsFunc {
  (): Promise<string>;
}

/**
 * 枚举支持的内置解析函数类型
 */
export enum Theme {
  JSON,
  HTML,
  RE,
}

/**
 * 根据jsonpath路径爬取json内容
 * @param data 网站内容
 * @param params jsonpath路径的列表
 */
export function getJsonData(data: string, params: string[]): string[] {
  const result: string[] = [];
  params.forEach((key) => {
    const ret = JSONPath({ json: data, path: key });
    if (ret.length) {
      result.push(ret.join("\n")); // 返回列表则换行
    }
  });
  return result;
}

/**
 * 根据url和css选择器爬取html内容
 * @param data 网站内容
 * @param params css选择器的列表
 */
export function getHTMLData(data: string, params: string[]): string[] {
  const result: string[] = [];
  const $ = cheerio.load(data);
  params.forEach((key) => {
    const ret: string[] = [];
    $(key).each(function (_i, el) {
      if ($(el).text()) {
        ret.push($(el).text().trim());
      }
    });
    if (ret.length) {
      result.push(ret.join("\n"));
    }
  });
  return result;
}

/**
 * 根据正则表达式选取html内容
 * @param data
 * @param params 正则表达式的列表
 */
export function getREData(data: string, params: string[]): string[] {
  const result: string[] = [];
  params.forEach((key) => {
    const pattern = new RegExp(key, "g");
    const results = [...data.matchAll(pattern)];
    if (results.length) {
      results.forEach((ret) => {
        result.push(ret.length > 1 ? ret.slice(1).join("\n") : ret[0]); // 有group则提取group
      });
    }
  });
  return result;
}

/**
 *
 * @param type 选择器的类型，一共有三种：jsonpath选择器，css选择器以及正则表达式
 * @param url 内容来源的网址
 * @param selectors 选择器字符串的列表
 */
export async function getWords(
  type: number,
  url: string,
  selectors: string[]
): Promise<string> {
  let words: string[] = [];
  try {
    const response: any = await axios.get(url);
    if (response.status === 200) {
      switch (type) {
        case Theme.JSON:
          words = getJsonData(response.data, selectors);
          break;
        case Theme.HTML:
          words = getHTMLData(response.data, selectors);
          break;
        case Theme.RE:
          words = getREData(response.data, selectors);
          break;
      }
    }
  } catch (error) {
    log.error(error);
  }
  if (!words.length) {
    log.error("Please make sure your config is correct");
  }
  return words.length >= 2 ? words.join("\n") : words[0];
}

/**
 * 下载文件到本地
 * @param url 文件的链接地址
 * @param localPath 本地保存地址
 */

export async function downloadFile(url: string, localPath: string) {
  if (!fs.existsSync(localPath)) {
    // 文件存在
    try {
      const response = await axios({
        method: "GET",
        responseType: "stream",
        url,
      });
      const writer = fs.createWriteStream(localPath);
      response.data.pipe(writer);
      return new Promise((resolve: any, reject: any) => {
        writer.on("finish", resolve("success"));
        writer.on("error", (err) => {
          reject(err);
        });
      }).catch(log.error);
    } catch (error) {
      log.error(error);
    }
  }
}

/**
 * 生成一对互补随机颜色
 */
function generateColors(): [string, string] {
  const colors: [string, string] = ["", ""];
  const colorMap: string[] = [
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
  colors[1] =
    "#" +
    (
      "000000" +
      (0xffffff ^ parseInt(colors[0].replace("#", "0x"))).toString(16)
    ).slice(-6);
  return colors;
}

/**
 * 将图片文件转换为base64字符串
 * @param path 本地图片路径
 */
export function img2base64(path: string): string {
  const buff = fs.readFileSync(path);
  return buff.toString("base64");
}

/**
 * 将在线图片文件转换为base64字符串
 * @param url 图片地址
 */
export async function onlineImg2ase64(url: string): Promise<string> {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data, "binary").toString("base64");
}

/**
 * 根据头像、用户名、爬取的文字生成打卡图片，返回图片的base64字符串
 * @param avatarPath 头像图片的本地路径
 * @param userName 用户名
 */
export async function generateImg(
  avatarPath: string,
  userName: string
): Promise<string> {
  const date: string = getDay(); // 当前日期
  const words: string[] = (
    await getWords(
      Theme.JSON,
      "https://apiv3.shanbay.com/weapps/dailyquote/quote/",
      ["content", "translation"]
    )
  ).split("\n");
  const colors: [string, string] = generateColors();
  return new Promise((resolve: any, reject: any) => {
    im(`${IMAGE_DIR}/front.png`)
      .background(colors[0]) // 背景颜色
      .mosaic() // 合成图层
      .draw(`image over 455,732 114,114 "${avatarPath}" `) // 绘制头像
      .fill("#ffffff") // 字体颜色
      .font(`${FONT_DIR}/经典隶变简.ttf`) // 字体
      .fontSize(38)
      .drawText(128, 550, "\n" + splitChar(words[1], 20)) // 中文
      .fontSize(26) // 字体大小
      .drawText(0, 380, userName, "Center") // 用户名
      .fontSize(26) // 字体大小
      .drawText(863, 160, getWeekDays()) // 星期
      .font(`${FONT_DIR}/Maecenas-ExtraLight.ttf`)
      .drawText(865, 100, `${date.slice(4, 6)} / ${date.slice(6, 8)}`) // 日期
      .fontSize(38)
      .drawText(128, 420, splitWords(words[0], 8)) // 英文
      .quality(100) // 质量最高
      .write(avatarPath, function (err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
  });
}

/**
 * 生成新风格的每日一句图片
 * @param savePath 保存每日一句图片的路径
 */
export async function generatePoster(savePath: string) {
  if (!fs.existsSync(savePath)) {
    const week: string = getWeekDays();
    const date: string = getDay();
    const $ = cheerio.load(fs.readFileSync(`${FONT_DIR}/base.html`));
    const words: string[] = (
      await getWords(
        Theme.JSON,
        "https://apiv3.shanbay.com/weapps/dailyquote/quote/",
        ["content", "translation"]
      )
    ).split("\n");
    $(".year").text(week);
    $(".day").text(`${date.slice(6, 8)}`);
    $(".month").text(`${date.slice(4, 6)}`);
    $("h2.title:nth-child(1)").text(words[0]);
    $("h2.title:nth-child(2)").text(words[1]);

    const browser = await puppeteer.launch({
      defaultViewport: { width: 462, height: 540 },
    });
    const page = await browser.newPage();
    await page.setContent($.html());
    await page.screenshot({ path: savePath });
    await browser.close();
  }
}

/**
 * 获取当前日期 示例样式为20200725
 */
export function getDay(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const M: string = m > 9 ? String(m) : "0" + String(m);
  const D: string = d > 9 ? String(d) : "0" + String(d);
  return `${y}${M}${D}`;
}

/**
 * 获取当前星期
 */
function getWeekDays(): string {
  const date = new Date();
  const weekMap = [
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

/**
 * 英文自动换行,指定换行的单词个数
 * @param str 需要换行的句子
 * @param num 每行的单词个数
 */
function splitWords(str: string, num: number): string {
  const pattern = new RegExp(`((?:(?:\\S+\\s){${num}})|(?:.+)(?=\\n|$))`, "g");
  const result = str.match(pattern);
  return result ? result.join("\n") : "";
}

/**
 * 中文自动换行，指定换行的文字个数, 如果有逗号的话直接分割
 * @param str 需要换行的句子
 * @param len 每行的汉字个数
 */
function splitChar(str: string, len: number): string {
  const ret: string[] = [];
  for (let offset = 0, strLen = str.length; offset < strLen; offset += len) {
    ret.push(str.slice(offset, len + offset));
  }
  return ret ? ret.join("\n") : "";
}

/**
 * 时间字符串转换为cron格式
 * @param str 时间字符串，格式示例：
 */
export function date2cron(str: string): string {
  const hour: Number = Number(str.split(":")[0]);
  const minutes: Number = Number(str.split(":")[1]);
  return `0 ${minutes} ${hour} * * *`;
}
