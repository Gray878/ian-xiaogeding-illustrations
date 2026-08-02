# 本地素材贴图集成

## 目标

把已经收集的照片、史料页、截图、图表和 SVG 当作画面中的真实内容层，而不是只拿来启发 `image_gen`。最终页面应像一张干净的白纸手绘拼贴：素材贴在纸上，Ian 风格的线条、胶带、箭头、短标签和小鸽钉围绕它解释。

## 1. 发现配套目录

从输入文件名去掉扩展名与结尾的 `-voiceover` 得到 slug。按顺序检查：

1. 用户明确指定的素材目录。
2. 输入文件同级或上级的 `materials/<slug>/`。
3. 工作区内的 `**/materials/<slug>/`。

例如输入 `docs/srt/ai/01-what-is-artificial-intelligence-voiceover.srt` 时，应找到 `docs/scripts/ai/materials/01-what-is-artificial-intelligence/`。使用 `rg --files -uu` 搜索，不要因为素材不在 SRT 同一目录就判定它不存在。

完整读取目录内的 `SOURCES.md`，再运行：

```bash
node scripts/inventory-materials.mjs --dir <material-dir>
```

脚本是初筛，不替代人工查看图片和许可判断。

## 2. 使用资格

为每项素材设置一种状态：

- `publishable`：公有领域、CC0、自制或其他明确允许当前用途的素材。
- `publishable-with-credit`：CC BY、CC BY-SA、BSD 等允许使用但有署名、相同方式共享或许可保留要求的素材。
- `reference-only`：`SOURCES.md` 标为“仅编辑参考”“不得直接进入成片”或要求发布前另行确认授权。
- `needs-review`：许可描述存在，但无法确定当前用途。
- `blocked-undocumented`：文件未记录在 `SOURCES.md`。

只有前两类可默认贴入成片。`reference-only` 只用于核对事实，不得直接贴入、交给图像模型重绘、移除水印或做规避式裁切。`needs-review` 与 `blocked-undocumented` 在得到明确依据前不得使用。

为 `publishable-with-credit` 保留作者、来源、许可和修改说明。需要可见署名时，在视频尾部增加 2.5–4 秒来源页；同时生成 `ATTRIBUTION.md`。不得把版权义务只藏在工作文件里。

## 3. 素材计划

在布局前创建 `material-plan.json`：

```json
{
  "sourceDir": "docs/scripts/ai/materials/topic-slug",
  "sourcesFile": "SOURCES.md",
  "assets": [
    {
      "file": "02-person.jpg",
      "policy": "publishable",
      "relevance": "历史人物",
      "sceneIds": ["scene-02"],
      "treatment": "portrait-sticker",
      "bbox": [90, 160, 430, 560],
      "sweptBbox": [62, 148, 458, 572],
      "clearancePx": 24,
      "avoidObjectIds": ["primary-subject", "core-action"],
      "credit": "作者 / 来源 / 许可",
      "decision": "use",
      "reason": ""
    }
  ]
}
```

默认使用所有相关且可发布的素材。至少使用相关可发布素材的 60%；低于该比例时逐项写明清晰度、重复、许可或叙事理由。每个存在相关可发布素材的场景至少使用一项。缩略到难以辨认、只当模糊背景、只出现在来源页或可见不足 1.5 秒，不计为使用。

## 4. 页面构图

将选中素材复制到项目的 `materials/`，保留原文件名和来源记录，不使用远程热链。

使用以下贴图类型：

- `portrait-sticker`：人物照片使用局部肖像裁切，保留可识别特征；旁边用手绘日期、姓名或问题短签解释。
- `document-sticker`：论文、提案和历史网页以 `object-fit: contain` 完整呈现；需要强调时再叠加放大框，不要裁掉标题、作者和必要来源。
- `diagram-sticker`：SVG、树图和神经网络图保持清晰线条；许可允许时可把外围注释换成 Ian 配色，但不得改变数据或逻辑。
- `photo-sticker`：实物和历史场景可裁成轻微不规则纸片，用 1–2 条橙色或靛蓝胶带固定。

在 1920×1080 页面中，单项主素材通常占画面 14%–38%，同场景最多 3 项；素材总面积通常占 25%–55%。人物与小鸽钉不应争抢同一个视觉中心。底部字幕条默认距画布底部 42px，素材和批注不得覆盖字幕实际矩形。

布局前先为人物、小鸽钉、核心物件和关键手绘标注建立 `illustrationSafeZones`，使用对象真实边界向外扩 24px。每项素材在 `material-plan.json` 记录包含纸边、胶带、说明签和旋转外接框的最终 `bbox`，以及覆盖完整入场路径的 `sweptBbox`、`clearancePx` 和 `avoidObjectIds`。`bbox` 与 `sweptBbox` 都不得和插画安全框相交；交集面积必须为 0。空间不足时先重排或缩小素材，再简化次要卫星；禁止让素材压住插画后用更高 `z-index` 把插画盖回来冒充避让。

贴图边缘可使用 4–8px 白色纸边和 1–2px 炭黑轮廓；可轻微旋转，但不要阴影、玻璃卡片、渐变、发光、圆角 UI 卡片或 3D 翻转。白纸、胶带、细线和短标签负责统一风格，不要把来源素材强行滤成假手绘。

## 5. HyperFrames 入场

保持素材为独立 `<img>` 或安全的内联 SVG 层。必须保持真实的肖像、文档和图表不要烘焙进 `image_gen` 生成图。

推荐组合：

- 0.45–0.9 秒落位。
- 从 12–36px 的相邻方向滑入。
- `scale: 0.96 → 1`。
- `rotation: ±1°–3° → 0°` 或保留不超过 2° 的贴纸角度。
- 使用局部 `clip-path` / SVG mask 揭开纸片，再以 `power3.out` 或 `sine.out` 收稳。
- 多项素材间隔 0.12–0.28 秒，按叙事顺序进入。

禁止只做整图 opacity 淡入、从远处飞入、弹跳、弹簧、翻牌、卡片轮播或大幅视差。贴图入场后至少稳定停留 1.5 秒；随整张白纸一起退场，不要在字幕仍解释它时提前消失。

最小结构示例：

```html
<figure class="asset-sticker" id="material-turing">
  <img src="./materials/02-alan-turing-1951.jpg" alt="Alan Turing 1951 portrait">
  <span class="tape tape-orange"></span>
  <figcaption>1950 · 可观察的行为</figcaption>
</figure>
```

```js
gsap.fromTo("#material-turing", {
  x: -28,
  y: 12,
  scale: 0.96,
  rotation: -2.4,
  clipPath: "inset(0 100% 0 0)"
}, {
  x: 0,
  y: 0,
  scale: 1,
  rotation: -0.8,
  clipPath: "inset(0 0% 0 0)",
  duration: 0.72,
  ease: "power3.out"
});
```

opacity 只能作为遮罩边缘的辅助，不得单独承担入场。

## 6. 与 image_gen 的关系

先为素材贴图留出确定位置，再按需生成缺失元素。适合生成：

- 小鸽钉的动作。
- 把多项素材串起来的中心隐喻。
- 胶带、箭头、问号、风险标记等手绘辅助。
- 没有可用素材的纯概念场景。

不适合生成：

- 已有的历史人物肖像、论文页面和截图。
- 必须保持数值、结构或文字准确的图表。
- 品牌标志、许可证文本和来源信息。

## 7. 质检

逐项检查：

- `material-plan.json` 中 `decision: use` 的素材是否真的在对应场景可辨认地出现。
- 使用数是否为零；若是且存在合格素材，直接失败。
- 使用覆盖率是否至少 60%，例外是否逐项说明。
- 文档和图表是否保持可读，裁切没有改变原意。
- 贴图是否通过短距离滑入、轻旋转和局部揭示自然落位，而不是整图淡入。
- 素材是否与手绘批注共享一个视觉命题，而不是孤立缩略图。
- 字幕条底边距是否为 36–48px，默认 42px；两行字幕及背景是否完整留在画布内。
- 在素材入场开始、50% 进度和落位后三处，素材 `bbox` / `sweptBbox` 与所有 `illustrationSafeZones` 的交集是否都为 0。
- 字幕区域、人物脸部与身体、小鸽钉、手势、核心道具、数据轴和关键文字是否没有被素材遮挡；只调整层级但仍发生空间重叠视为失败。
- `ATTRIBUTION.md` 与片尾署名是否满足 `SOURCES.md` 的要求。
