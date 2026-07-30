# 手绘知识拼贴：生图提示词模板

仅在已锁定“手绘知识拼贴”时读取。此模板只生成中心锚点、手绘卫星和底层构图；配套本地素材必须在后续 HTML/SVG 合成中保持为独立贴图，不要交给 `image_gen` 重绘。每个生成层单独生成，不要让模型伪造多张来源图片。

```text
Generate one standalone 16:9 horizontal Chinese knowledge-collage illustration.

Shared visual DNA:
Pure white background. Minimal 2D hand-drawn information-card style: clean fine dark outlines, simple flat shapes, and large intentional white space. Use only 2-3 concentrated colors: {主色} as one large clean flat fill on the central anchor, {辅色} on at most one important satellite or one person, and {风险色} only on warnings/questions/breaks. Keep total colored area around 15%-30% of the canvas; do not color every object. Make every satellite a simple icon, question mark, warning sign, short label, or lightly drawn adult figure—never a detailed mini-scene. No gradients, shadows, hatching, 3D volume, perspective rendering, intricate machinery, product render, paper texture, realistic UI, commercial vector gloss, card grid, dense PPT infographic, course-slide layout, neon, rainbow palette, cute mascot poster, or children's illustration.

Mode lock:
This is a hand-drawn knowledge collage, NOT a workflow diagram and NOT a 小鸽钉 illustration. Do not add a pigeon or recurring mascot unless explicitly listed below.

Central thesis:
{中心命题：一句话}

Central anchor:
{画面中心的大符号 / 数字 / 怪物件 / 概念词；它为何能表达命题}

Semantic satellites:
{卫星1：内容原子及其画法} / {卫星2：内容原子及其画法} / {卫星3：内容原子及其画法} / {可选卫星4-7}

Composition:
Place one simple, flat central anchor near the visual center at about 20%-32% of the canvas. Scatter 3-6 small unequal satellites around it with a lot of white space. Make only one or two satellites more prominent. Use 0-1 thin hand-drawn arrow only where a real relationship needs indicating. Do not arrange elements as an equal radial chart, neat grid, or step-by-step flow. Keep the whole composition sparse rather than filling every corner.

Reserved local-material areas:
{为 material-plan.json 中的照片、史料页、图表或 SVG 保留哪些干净白区；没有则写 none。不要在这些区域伪造素材内容}

Characters and objects:
{0-2 成人感简笔人物、极简图标或小物件；没有就写 none。每个必须对应一个内容原子，不得有复杂细节。}

Chinese handwritten labels:
{短标签1} / {短标签2} / {短标签3} / {可选短标签4-6}

Color semantics:
Use {主色} as the one dominant flat fill on the central anchor. Use {辅色} on no more than one person or key satellite. Use {风险色} only for risks, warnings, questions, or crucial results. Black/dark gray is for fine line art, text, and question marks. Do not use a fourth color unless an explicit semantic signal requires it; colors must be concentrated, not equal decoration.

Constraints:
One image serves one central thesis. Preserve generous white space and the specified blank areas for real local-material stickers. Make the center visible within one second and the satellites readable on a second glance. Keep labels short; reserve blank label areas rather than attempting long or exact Chinese text. Do not invent photographs, historical portraits, document pages, screenshots, charts, logos, watermarks, or source text that will be added deterministically later. Do not add a title in the top-left corner. Do not copy prior examples, people, or compositions. It must feel sparse, flat, and editorial—not like a rich product sketch or a complex infographic.
```
