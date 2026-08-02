# HyperFrames 视频交接规范

仅在用户要求视频、字幕动画、SRT 驱动动画、边讲边画或 MP4 时读取。使用已安装的 `hyperframes` skill 编写合成，使用 `hyperframes-cli` skill 初始化、校验和渲染。不要复制 HyperFrames 的工程说明到本 skill，也不要把它当作可选步骤。

## 当前范围

- 生成无音频的视频；不要调用 TTS，不要生成旁白或背景音乐。
- 若用户提供音频，只保留其文件和时间轴信息，除非用户明确要求加入或处理音频。
- 用户后续要求音频时，再扩展音频、旁白和字幕对齐流程。

## 输入和时间基准

| 输入 | 时间基准 | 处理 |
| --- | --- | --- |
| `.srt` 或含时间码的 `.txt` | 原始 SRT | 逐 cue 保留时间；不得按字数改写时间。 |
| 文章或无时间码脚本 | 生成的视觉时间表 | 先压缩为 `SCRIPT.md`，再创建 `captions.srt` 草案和 `timeline.json`；它们是本次无音频视频的时间基准。 |

对每个 cue 记录 `index`、`start`、`end`、`text`、`sceneId`。字幕只能在自身 `start` 到 `end` 出现。将相邻 cue 合并到同一场景是允许的，但不得改变字幕时序。

## 交接产物

在 `video-projects/<slug>/` 中创建并维护下列文件：

```text
DESIGN.md
SCRIPT.md                 # 用户原始 SRT 时可只保留摘要和场景说明
captions.srt
timeline.json
material-plan.json
ATTRIBUTION.md
reveal-plan.json
QA.md                     # 逐对象最终态与覆盖率检查
index.html
materials/
compositions/
  01-topic.png
```

`DESIGN.md` 必须从本 skill 的 `style-dna.md`、`color-system.md` 和每个场景已锁定的模式生成，并至少固定：纯白背景、细黑微抖轮廓、可见的低饱和彩色平涂、充足留白、冷静怪诞、禁止黑白线稿加零星点缀、密集 PPT/商业插画/儿童卡通/图像模型生成的假 UI。经过素材审计的真实文档、图表和 SVG 应作为局部贴图保留。仅在小鸽钉单核叙事场景中固定带主色平涂的小鸽钉；知识拼贴场景默认不出现它。

`timeline.json` 是时间主表。每个场景至少包含：

```json
{
  "sceneId": "scene-01",
  "start": 0.0,
  "end": 8.4,
  "cueIndexes": [1, 2],
  "mode": "xiaogeding-narrative",
  "image": "01-topic.png",
  "materials": ["02-person.jpg", "03-diagram.svg"],
  "captionPlacement": "bottom-low-safe-area",
  "captionBottomPx": 42,
  "captionReserveHeightPx": 160,
  "illustrationSafeZones": [
    {"objectId": "primary-subject", "bbox": [620, 220, 310, 470], "clearancePx": 24}
  ],
  "transition": "paper-wipe"
}
```

`material-plan.json` 是本地素材使用主表。先按 `material-integration.md` 发现、审计并分类素材，再记录每项素材对应的场景、贴图类型、署名要求、使用或排除决定。存在相关可发布素材但 `materials` 数组全部为空时不得进入渲染。

`reveal-plan.json` 是 B 档动画主表。每个场景拆分为 10-25 个语义局部，不允许只有一个覆盖整图的大矩形。人物、小鸽钉和核心物件必须额外标记为完整性对象。普通局部每项至少包含 `sceneId`、`id`、`kind`、`sourceAtom`、`start`、`end`、`mask`、`penPath` 和 `layer`；完整性对象还必须包含 `integrityObject`、`objectId`、`bbox`、`requiredParts`、`finalState`、`coverageThreshold` 和 `safetyMarginPx`：

```json
{
  "sceneId": "scene-01",
  "id": "primary-subject",
  "kind": "character-or-anchor",
  "sourceAtom": "核心动作或中心命题",
  "start": 2.1,
  "end": 2.9,
  "mask": "polygon-or-svg-path",
  "penPath": "follow-cable-outline",
  "layer": "black-line-art",
  "integrityObject": true,
  "objectId": "primary-subject",
  "bbox": [620, 220, 310, 470],
  "requiredParts": ["head", "torso", "left-arm", "right-arm", "legs"],
  "finalState": "fully-visible",
  "coverageThreshold": 0.995,
  "safetyMarginPx": 18
}
```

`bbox` 使用英雄帧的 1920×1080 像素坐标，格式为 `[x, y, width, height]`，必须包住对象全部可见像素，而不是只包躯干或视觉重心。`requiredParts` 只列画面中确实存在的部分；坐姿人物可以没有 `legs`，但不能省略已经画出的头、手、动作肢体或关键道具。对象被拆成多个揭示项时，这些项必须共享 `objectId`，并由对象级记录统一声明上述完整性字段。

### 完整性对象与遮罩设计

按以下优先级实现人物、小鸽钉和核心物件，不能跳过覆盖检查：

1. 优先把完整对象制作为独立透明 PNG、内联 SVG 或独立 DOM 层；遮罩只作用于该对象层，不要反复复制整张扁平英雄帧后用粗略圆形窗口截取。
2. 独立分层不可用时，使用贴合轮廓的 SVG `path`、`polygon`、`ellipse` 或多段遮罩。人物至少覆盖头部、躯干和画面中实际存在的肢体；细长动作、翅膀、手臂、脚和随身道具单独补路径。
3. 一个大圆只能用于本身接近圆形且周围没有其他语义对象的局部。临时使用圆形遮罩时，最终半径至少覆盖 `bbox` 四角再加 `safetyMarginPx`；若扩大后会提前暴露相邻内容，必须改用多段路径或独立分层，不能接受截断。
4. `penPath` 只控制铅笔的视觉移动，不能兼任对象覆盖边界。笔尖应略领先揭示前沿，但遮罩必须独立保证对象最终完整。
5. 所有完整性对象必须在场景结束前至少 0.4 秒到达 `fully-visible` 并稳定保持；不得把最后一块头部、肢体或道具卡在转场起点。

允许在所有局部揭示结束后启用一层与静态英雄帧一致的 `resolved` 手绘终态作为完整性兜底。该层必须位于本地素材贴图和确定性文字之下，从 CSS 初始状态隐藏，并只在最后一个局部完成后切换到完整状态；它不是入场效果，禁止用整图 opacity 渐显或全屏擦除代替局部手绘。若切换时肉眼出现人物头部、肢体或大块内容突然跳出，说明前序遮罩不完整，仍须修复遮罩，不能把兜底层当作通过 QA 的理由。

对小鸽钉单核叙事，按主物件的彩色平涂 → 细黑主结构 → 本地素材贴图 → 小鸽钉的彩色主体和动作 → 关键物件 → 路径/风险色 → 批注与中文标签的顺序揭示。对知识拼贴，按中心锚点的主色色块和轮廓 → 关键本地素材贴图 → 最关键的 2–3 个辅色卫星 → 其余卫星 → 少量关系箭头 → 标签的顺序揭示。彩色块面必须随主体出现，不能等到最后才零星补色。让笔尖略领先手绘遮罩，并沿物体轮廓或阅读方向移动。素材贴图独立使用局部裁切揭示和短距离落位，不要求笔尖描摹真实照片。短 cue 优先更新字幕；长 cue 承担主要揭示；跨 cue 的揭示保持连续。

### 字幕基线与素材避让

- 1920×1080 视频的字幕条默认设置 `bottom: 42px`，允许范围为 36–48px。不得默认使用约 80px 的高位字幕；若项目已有更高位置，应下移到该范围并重新检查两行字幕、圆角背景和阴影是否完整处于画布内。
- 在 `timeline.json` 记录 `captionBottomPx` 和 `captionReserveHeightPx`。所有素材、插画、批注和确定性标签都不得进入实际字幕条占据的矩形；不要只用一条固定水平线估算多行字幕。
- 每个场景为人物、小鸽钉、核心物件和关键手绘标注登记 `illustrationSafeZones`。每个安全框由对象真实 `bbox` 向外扩 24px；细长手臂、翅膀、箭头和动作道具不能省略。
- 素材的最终边界框和入场期间的 swept bbox 均不得与任何 `illustrationSafeZones` 相交，交集面积必须为 0。调整层级使插画盖回素材不算通过，因为空间关系仍然冲突；必须移动、缩小或重排素材。
- 贴图胶带、纸边、说明签和素材自身的旋转外接框都计入素材边界。若素材必须与某个插画建立联系，只允许用位于两者之间的箭头或短连接线，不允许让素材压住人物脸部、身体、手势、核心道具或手绘文字。

## HyperFrames 执行顺序

1. 使用 `npx hyperframes init <slug> --non-interactive` 初始化项目；不要从零手写项目骨架。
2. 先把 `material-plan.json` 中允许使用的素材复制到项目 `materials/`，保留原文件名；再将 `DESIGN.md`、SRT、时间表和揭示计划放入项目。将 JSON 作为上游事实来源，在生成阶段编译为同步的 HTML/GSAP 场景；不要在浏览器运行时异步 `fetch` JSON 后再创建时间线。
3. 为每个场景先完成“白纸底 + 独立素材贴图 + 手绘层 + 确定性文字”的静态英雄帧布局，再添加 GSAP 动画。素材必须是可检查的 `<img>` 或安全内联 SVG 层，不得先交给 `image_gen` 烘焙。手绘层使用 SVG mask、`clip-path` 或等价局部揭示；遮罩解析器至少支持当前计划实际使用的 `path`、`polygon`、`ellipse` 或多段遮罩，不能只支持单一 `circle(...)` 却在计划中假装记录对象轮廓。不要用整图淡入或全屏擦除冒充手绘。
4. 使用 `hyperframes` 的字幕、排版、转场与时间线规范。字幕按 `captionBottomPx: 42` 放在更靠下的底部安全区，高对比、字号稳定，不能遮住主体或关键批注。
5. 只使用白纸感擦除、纸张滑入或翻页等轻量转场。每个多场景视频都要有转场，且不能在转场前把上一场景提前淡出。
6. 不添加音频元素、TTS 或背景音乐，直到用户明确提出音频需求。

## 校验和渲染

按以下顺序执行并修复问题：

```text
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect --samples 15
npx hyperframes render --output ../../renders/<slug>.mp4 --quality standard
```

对于新视频或大幅重做动画，额外运行 HyperFrames animation map，检查是否存在超过 1 秒的意外静止区、过快揭示、碰撞、画外元素和不可见元素。

抽帧确认：开头不会长时间空白；局部内容没有提前露出；笔/手贴近当前揭示区域；红蓝批注不压住字幕；字幕 cue 时间与 SRT 一致。除此之外，对每个完整性对象都必须在“最后一个对象局部完成后的下一帧”和“场景结束前一帧”各检查一次：

- 以静态英雄帧为参考，在对象 `bbox` 内计算应显示的非背景像素覆盖率，结果不得低于 `coverageThreshold`，默认 `0.995`。
- `requiredParts` 每一项都必须有可见像素；人物缺头、缺手、缺动作肢体或核心道具被截断，即使总像素比例达标也直接失败。
- 对象边界不能贴着遮罩硬切；必须保留 `safetyMarginPx`，默认 12–24px。遮罩扩大后若暴露相邻对象，改用轮廓路径或独立分层。
- `resolved` 终态切换前后不得出现可见跳变；出现跳变说明局部遮罩漏画，必须回到 `reveal-plan.json` 修复。

对每项素材还必须在入场开始、50% 进度和落位后三处抽帧：计算素材外接框与所有 `illustrationSafeZones` 的交集，三处都必须为 0；同时记录字幕条实际底边距，必须在 36–48px 内。任何一处素材覆盖插画或字幕位置回升到默认范围之外都直接失败，修复布局后重新跑检查与渲染。

将逐对象结果记录在项目 `QA.md`，至少包含 `sceneId`、`objectId`、两处采样时间、覆盖率、缺失部件和通过/失败。不能只写“已肉眼检查”。若失败，先修复 `timeline.json` 或 `reveal-plan.json`，再改合成代码并重新检查。

同时核对 `material-plan.json`：已选素材在对应场景中可辨认地出现至少 1.5 秒；贴图通过局部裁切、短距离滑入和轻旋转平滑落位；文档、肖像和图表没有被错误裁切；最终框与 swept bbox 未进入插画安全框；相关可发布素材覆盖率达到 60% 或逐项说明例外；署名与 `ATTRIBUTION.md` 一致。

## 交付

输出 `renders/<slug>.mp4`，并保留项目目录、`captions.srt`、`SCRIPT.md`、`timeline.json`、`material-plan.json`、`ATTRIBUTION.md`、`reveal-plan.json` 和逐对象覆盖结果所在的 `QA.md`。交付时说明时长、分辨率、字幕来源、场景数量、实际使用素材数量与覆盖率、贴图入场方式、B 档局部遮罩是否完成、完整性对象是否全部通过，以及 lint/validate/inspect 的结果。
