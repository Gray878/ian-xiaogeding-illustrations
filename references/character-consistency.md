# 小鸽钉角色一致性协议

仅在任务包含小鸽钉时读取。目标是让不同文章、不同场景和不同动作中的小鸽钉保持为同一个固定 IP，而不是让模型每次重新解释“蓝色小鸽子”。

## 基准图与优先级

默认身份基准图是 `assets/examples/18-xiaogeding-colorful-pipeline-repair.png`。它只约束小鸽钉的角色身份：轮廓比例、雾蓝主体、豆眼、短橙嘴、细腿、短翅和芥黄色斜挎包。不得复制图中的梯子、插头、纸张、箭头或构图。

参考优先级：

1. 用户明确指定的小鸽钉角色设定图。
2. 默认基准图 `assets/examples/18-xiaogeding-colorful-pipeline-repair.png`。
3. 本任务已通过 QA 的小鸽钉输出，只能作为姿态补充参考，不能替代第 1 或第 2 项。

## 强制身份锁

生成前必须实际打开基准图，并把图片文件作为每一次小鸽钉生成或编辑调用的图像输入。只在提示词中写文件路径、文件名、颜色描述，或声称“参考了示例图”，都不算使用参考图。

- 每次调用都同时传入基准图；不得只把上一张生成结果传给下一张，否则会逐场漂移。
- 提示词明确声明 `identity only`：保留同一角色，只改变姿态、朝向和正在操作的道具。
- 若生成工具不支持参考图输入，优先复用已经通过 QA 的透明角色层、确定性 SVG/DOM 角色或同一角色设定图的裁切层。不得为多场景作品分别进行纯文字整图生成。
- 若既不能传参考图，也没有可复用角色层，暂停小鸽钉生图并说明无法保证 IP 一致；不能继续生成后再把相似当作一致。

## 分层生成

多图任务或任何视频任务默认把小鸽钉生成为独立透明 PNG、透明 SVG 或可单独裁切的纯白底角色层，再与主物件、本地素材和确定性文字合成。场景可以改变动作，但不能让背景模型顺便重设计角色。

推荐顺序：

1. 锁定场景动作和视角。
2. 使用基准图生成小鸽钉姿态层。
3. 检查身份不变项，通过后再合成主物件和素材。
4. 需要修正时只编辑角色层，不重新生成整张英雄帧。

允许变化：姿态、左右朝向、翅膀动作、手持工具、与主物件的空间关系。固定不变项见 `xiaogeding-ip.md`；颜色、斜挎包、基本轮廓、脸部符号和线条风格不得随场景变化。

## 生成记录

两张及以上配图或任何视频项目必须保存 `character-reference.json`：

```json
{
  "characterId": "xiaogeding-v1",
  "canonicalReference": "assets/examples/18-xiaogeding-colorful-pipeline-repair.png",
  "referenceRole": "identity-only",
  "scenes": [
    {
      "sceneId": "scene-02",
      "output": "characters/scene-02-xiaogeding.png",
      "generationMode": "reference-image",
      "referenceImagePassed": true,
      "identitySourceVerified": true,
      "pose": "递送纸条",
      "identityQa": "pass"
    }
  ]
}
```

`referenceImagePassed` 只能根据真实工具调用填写；不能从提示词中出现了路径就推断为 `true`。`generationMode` 使用 `reference-image`、`image-edit`、`reused-layer` 或 `deterministic-svg`。前两种模式必须为 `referenceImagePassed: true`；后两种没有发生生图调用，可以为 `false`，但必须以 `identitySourceVerified: true` 证明复用层或确定性角色符合基准身份。任何小鸽钉场景缺记录、身份来源未验证或 `identityQa` 未通过，都不得进入视频渲染或批量交付。

交付前运行：

```text
node <skill-dir>/scripts/check-character-reference.mjs --project <project-dir>
```

该门禁检查时间线中的所有小鸽钉场景都有生成记录、输出层真实存在、参考图调用状态与生成方式一致，且身份 QA 已通过。

## 跨场景门禁

把基准图和所有小鸽钉角色层按统一可视高度排成 contact sheet，逐项检查：

- 是同一种连续头身轮廓，没有忽然变成独立圆头、矮胖团子或细长豆形。
- 主体保持固定浅雾蓝，不变成靛紫、深蓝、灰白或暖米杏。
- 豆眼、短橙色三角嘴、两条细腿和芥黄色斜挎包保持一致。
- 翅膀只因动作伸展，不新增手指、羽毛、服装或拟人手臂。
- 线条粗细和手绘松紧一致，没有某一场突然变成商业矢量、儿童卡通或写实鸟。

任一固定不变项失败，就只重生成或编辑对应角色层。不能用“整体风格接近”放行角色身份漂移。
