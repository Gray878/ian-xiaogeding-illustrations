# 小鸽钉单核叙事：生图提示词模板

仅在已锁定“小鸽钉单核叙事”时读取。先执行 `character-consistency.md`：实际打开并把默认基准图 `assets/examples/18-xiaogeding-colorful-pipeline-repair.png` 作为图像输入附加到每一次小鸽钉生成或编辑调用；文本中写路径不算附加。此模板只生成要叠加在页面中的手绘角色、锚点或底层构图；配套本地素材必须在后续 HTML/SVG 合成中保持为独立贴图，不要交给 `image_gen` 重绘。每个生成层单独生成，根据正文内容替换变量。

```text
Generate one standalone 16:9 horizontal Chinese article illustration.

Visual DNA:
Pure white background. Minimal flat 2D hand-drawn information-card style: clean fine dark outlines, simple shapes, and very large white space. Use only 2-3 concentrated colors: {主色} as one clear flat fill on the main object or 小鸽钉, {辅色} on one secondary object/tool, and {风险色} only for a warning or break. Keep total colored area around 15%-30% of the canvas; do not color every object. Use no gradients, shadows, hatching, 3D volume, perspective rendering, intricate machinery, product render, paper texture, neon, rainbow palette, complex background, commercial vector gloss, PPT infographic look, cute mascot poster, children's illustration, or realistic UI.

Recurring IP character required:
Use the attached canonical image as an identity-only reference for the same recurring 小鸽钉 character. Preserve its single continuous upright head-body silhouette, approximately 1.25-1.55 body height-to-width ratio, fixed pale misty-blue #AFC7DC flat body, tiny dark dot eye or eyes appropriate to view, small flat orange triangular beak, two thin black legs, short simple wings, calm deadpan expression, and the same small mustard-yellow #F4BF3A rectangular crossbody satchel with a thin black strap. Change only pose, direction, wing action, held tool, and interaction with the scene. Do not create a separate round head, squat blob, elongated bean body, purple or dark-blue body, gray pouch, tool cup replacing the satchel, human arms, fingers, feather detail, clothes, or a new character design. 小鸽钉 must perform the core conceptual action: delivering information, carrying concepts, connecting nodes, or repairing breakpoints. Do not make it a pet, mascot, cute decoration, realistic bird, complex character illustration, or children's cartoon. Do not copy the reference image's ladder, socket, plug, papers, arrow, or composition.

Theme:
{正文配图主题}

Structure type:
{结构类型：Workflow / 系统局部 / 前后对比 / 角色状态 / 概念隐喻 / 方法分层 / 地图路线 / 小漫画分镜}

Core idea:
{这张图要表达的核心意思}

Composition:
{具体画面：小鸽钉在哪里、正在做什么、主要物件是什么、信息如何流动}

Reserved local-material areas:
{为 material-plan.json 中的照片、史料页、图表或 SVG 保留哪些干净白区；没有则写 none。不要在这些区域伪造素材内容}

Suggested elements:
{元素1} / {元素2} / {元素3} / {元素4}

Chinese handwritten labels:
{标注词1} / {标注词2} / {标注词3} / {标注词4} / {可选标注词5}

Color use:
Use {主色} as a single clean flat fill on the main metaphor object or 小鸽钉. Use {辅色} on only one secondary object or tool. Use {风险色} only for a failure, warning, key question, or result. Black/dark gray stays as a fine outline and text color. Preserve white space and leave support objects mostly unfilled; do not turn the scene into a large colored machine.

Constraints:
One image explains only one core structure. Generate 小鸽钉 as an independent transparent character layer when possible; otherwise use a clean white background that permits deterministic cutout. Keep the generated main action and its few support objects around 25%-45% of the canvas, while preserving the specified blank areas for real local-material stickers. Use at most 4 short handwritten Chinese labels. Do not invent photographs, historical portraits, document pages, screenshots, charts, logos, or source text that will be added deterministically later. Do not write a title in the top-left corner. Do not write the structure type on the image. Do not make it a formal diagram, course slide, dense explainer, complex product sketch, or mechanical rendering. Do not copy prior examples or reuse known case compositions unless explicitly requested; preserve the canonical character identity while inventing a fresh visual metaphor for this specific article. It should be clear but not instructional, sparse but not empty, interesting but not childish.
```

## 图像编辑提示

去掉左上角标题：

```text
Edit the provided image. Remove only the handwritten title "{要删除的文字}" and its underline from the top-left corner. Fill that area with the same clean white background, matching the surrounding blank paper. Preserve everything else exactly: characters, labels, paths, line style, composition, aspect ratio, and image quality. Do not add any new text or objects.
```

增强怪诞感：

```text
Regenerate this illustration with the same core meaning and simple layout, but make 小鸽钉 more central to the conceptual action. 小鸽钉 should be doing the strange work that explains the idea, such as delivering information, carrying concepts, connecting nodes, or repairing breakpoints, not standing beside the diagram. Keep it clean, sparse, hand-drawn, deadpan, and not cute.
```
