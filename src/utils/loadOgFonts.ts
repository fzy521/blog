import { readFile } from "node:fs/promises";

/**
 * 加载用于 OG 图生成的像素字体(缝合像素体,支持中文)。
 * satori 不支持 woff2,因此使用本地 OTF 文件。
 */
export async function loadOgFonts() {
  const data = await readFile(
    "src/assets/fonts/fusion-pixel-12px-monospaced-zh_hans.otf"
  );

  return [
    { name: "Fusion Pixel", data, weight: 400 as const, style: "normal" as const },
    { name: "Fusion Pixel", data, weight: 700 as const, style: "normal" as const },
  ];
}
