import path from 'path';
const FONT_DIR: string = path.join(__dirname.replace('dist/src',''), '/font'); // 字体文件夹
const IMAGE_DIR: string = path.join(__dirname.replace('dist/src',''), '/image'); // 存放图片的文件夹

export { FONT_DIR, IMAGE_DIR }
