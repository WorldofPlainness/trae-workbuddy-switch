/**
 * 模型费率（目录里的 `CatalogModel.credits`）的解析与分档。
 *
 * 单独成模块而非写在组件里：这里是**纯函数**，可以脱离 React 直接跑边界值，
 * 而项目没有前端测试框架，把逻辑与渲染分开是唯一能独立验证的方式。
 */

/** 费率档位；`null`（无法解析出数值）不属于任何档，由调用方按中性处理。 */
export type RateBand = "veryCheap" | "cheap" | "baseline" | "premium";

/**
 * 从上游 `credits` 字符串里取第一个数值。
 *
 * 上游该字段是**自由文本**，实测出现过 `"x0.79"`、`"x3.31"`、`"x0.03 credits"`、
 * `"限时免费"` 等形态。这里只做「取第一个数值」的启发式 —— 注意 `"x0.03 credits"`
 * 的语义其实偏「价格」而非「倍率」，但上游没有更结构化的字段，只能近似。
 * 取不到数值时返回 `null`，调用方应保留原串并作中性展示。
 */
export function parseCreditsMultiplier(credits: string | null | undefined): number | null {
  if (!credits) return null;
  const matched = credits.match(/-?\d+(?:\.\d+)?/);
  if (!matched) return null;
  const value = Number.parseFloat(matched[0]);
  return Number.isFinite(value) ? value : null;
}

/**
 * 按倍率分档。边界左闭右开，且 **`x1.00` 归 `baseline` 而不是 `premium`** ——
 * 它是基准价，把基准价标成「溢价」是错的。
 *
 * - `< 0.1` → `veryCheap`
 * - `[0.1, 0.5)` → `cheap`
 * - `[0.5, 1]` → `baseline`
 * - `> 1` → `premium`
 */
export function rateBand(multiplier: number | null): RateBand | null {
  if (multiplier === null) return null;
  if (multiplier < 0.1) return "veryCheap";
  if (multiplier < 0.5) return "cheap";
  if (multiplier <= 1) return "baseline";
  return "premium";
}
