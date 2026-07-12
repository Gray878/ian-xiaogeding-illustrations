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
reveal-plan.json
index.html
compositions/
01-topic.png
```

`DESIGN.md` 必须从本 skill 的 `style-dna.md`、`color-system.md` 和每个场景已锁定的模式生成，并至少固定：纯白背景、细黑微抖轮廓、可见的低饱和彩色平涂、充足留白、冷静怪诞、禁止黑白线稿加零星点缀、密集 PPT/商业插画/儿童卡通/真实 UI。仅在小鸽钉单核叙事场景中固定带主色平涂的小鸽钉；知识拼贴场景默认不出现它。

`timeline.json` 是时间主表。每个场景至少包含：

```json
{
  "sceneId": "scene-01",
  "start": 0.0,
  "end": 8.4,
  "cueIndexes": [1, 2],
  "mode": "xiaogeding-narrative",
  "image": "01-topic.png",
  "captionPlacement": "bottom-safe-area",
  "transition": "paper-wipe"
}
```

`reveal-plan.json` 是 B 档动画主表。每个场景拆分为 10-25 个语义局部，不允许只有一个覆盖整图的大矩形。每项至少包含：

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
  "layer": "black-line-art"
}
```

对小鸽钉单核叙事，按主物件的彩色平涂 → 细黑主结构 → 小鸽钉的彩色主体和动作 → 关键物件 → 路径/风险色 → 批注与中文标签的顺序揭示。对知识拼贴，按中心锚点的主色色块和轮廓 → 最关键的 2–3 个辅色卫星 → 其余卫星 → 少量关系箭头 → 标签的顺序揭示。彩色块面必须随主体出现，不能等到最后才零星补色。让笔尖略领先遮罩，并沿物体轮廓或阅读方向移动。短 cue 优先更新字幕；长 cue 承担主要揭示；跨 cue 的揭示保持连续。

## HyperFrames 执行顺序

1. 使用 `npx hyperframes init <slug> --non-interactive` 初始化项目；不要从零手写项目骨架。
2. 将 `DESIGN.md`、场景图片、SRT、时间表和揭示计划放入项目；场景图片遵循 HyperFrames 的项目根目录规则。将 JSON 作为上游事实来源，在生成阶段编译为同步的 HTML/GSAP 场景；不要在浏览器运行时异步 `fetch` JSON 后再创建时间线。
3. 为每个场景先完成静态英雄帧布局，再添加 GSAP 动画。使用 SVG mask、`clip-path` 或等价局部揭示；不要用整图淡入或全屏擦除冒充手绘。
4. 使用 `hyperframes` 的字幕、排版、转场与时间线规范。字幕在底部安全区，高对比、字号稳定，不能遮住主体或关键批注。
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

抽帧确认：开头不会长时间空白；局部内容没有提前露出；笔/手贴近当前揭示区域；红蓝批注不压住字幕；字幕 cue 时间与 SRT 一致。若失败，先修复 `timeline.json` 或 `reveal-plan.json`，再改合成代码并重新检查。

## 交付

输出 `renders/<slug>.mp4`，并保留项目目录、`captions.srt`、`SCRIPT.md`、`timeline.json` 和 `reveal-plan.json`。交付时说明时长、分辨率、字幕来源、场景数量、B 档局部遮罩是否完成，以及 lint/validate/inspect 的结果。
