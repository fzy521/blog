import type { ResolvedAstroPaperConfig } from "@/types/config";
import { getAssetPath } from "./withBase";

// 只 glob 图片:OG 图必然是图片文件。全量 glob 会把 public/ 下的 css 等文件
// 拉进 Vite 模块图,经 Tailwind 处理后被当成页面样式注入每个页面。
const publicFiles = import.meta.glob("/public/*.{jpg,jpeg,png,webp,gif,svg,avif}", {
  eager: false,
});

function existsInPublic(filename: string): boolean {
  return `/public/${filename}` in publicFiles;
}

/**
 * Resolves the absolute OG image path used for pages/posts.
 *
 * Security note: `site.ogImage` must be a single filename under `public/` to avoid
 * path traversal or referencing arbitrary files.
 *
 * Behavior:
 * - When `features.dynamicOgImage` is enabled, prefers `public/{site.ogImage}` when present,
 *   otherwise falls back to the generated `/og.png`.
 * - When disabled, requires `public/{site.ogImage}` to exist.
 */
export function resolveDefaultOgImagePath(
  config: ResolvedAstroPaperConfig
): string {
  const filename = config.site.ogImage;
  if (
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    throw new Error(
      `site.ogImage must be a single filename in public/ (e.g. "default-og.jpg"), got "${filename}"`
    );
  }

  if (config.features.dynamicOgImage) {
    return existsInPublic(filename)
      ? getAssetPath(filename)
      : getAssetPath("og.png");
  }

  if (!existsInPublic(filename)) {
    throw new Error(
      `AstroPaper: missing public/${filename}. Add that file, or set site.ogImage to an existing file under public/, or enable features.dynamicOgImage to fall back to /og.png.`
    );
  }

  return getAssetPath(filename);
}
