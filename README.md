# 距离观察器 | Distance Observer

> 保持距离，观察但不抓取

一个基于 Three.js 的 3D 交互体验，将内容以星空的形式呈现。每个想法、洞察都是一颗漂浮的星辰，永远在你的视野中，但保持着一定的距离。

## 核心理念

- **观察而非占有** - 内容如星辰般存在，可以观察但不必抓取
- **保持距离** - 通过 3D 空间的距离感，创造思考的空间
- **自由漂浮** - 想法在空间中自由分布，形成独特的 constellation
- **永恒当下** - 所有内容永远在视野中，但以不同的深度呈现

## 功能特性

### 🌌 3D 星空环境
- 深邃的黑色背景，营造太空般的氛围
- 800+ 背景星点，创造深度感
- 雾效果增强距离感知

### ✨ 内容星辰（Insight Stars）
- 每个 insight 都是一颗发光的星辰
- 带有文字标签的 3D 精灵
- 独特的颜色和光晕效果
- 缓慢自转和漂浮动画
- 装饰性的连接线（constellation 效果）

### 🎮 交互方式

#### 鼠标移动
- 创造视差效果（Parallax Effect）
- 相机跟随鼠标平滑移动
- 不同深度的星辰产生不同的移动速度

#### 滚轮缩放
- 改变观察距离（20-150 单位）
- 平滑的缩放动画
- 实时显示当前距离

#### 点击添加
- 点击画面任意位置添加新星辰
- 随机选择 insight 内容
- 自动在 3D 空间中随机分布

### 📊 信息显示
- 实时显示当前观察距离
- 显示星辰总数
- 半透明的控制提示

## 技术栈

- **Three.js** - 3D 渲染引擎
- **Vite** - 快速的开发服务器和构建工具
- **原生 JavaScript** - 无框架依赖，保持轻量

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:3000` 即可看到运行效果。

### 构建生产版本

```bash
npm run build
```

构建后的文件将输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 部署到 Vercel

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/distance-observer)

### 手动部署

1. **安装 Vercel CLI**

```bash
npm install -g vercel
```

2. **登录 Vercel**

```bash
vercel login
```

3. **部署项目**

在项目根目录运行：

```bash
vercel
```

首次部署时，Vercel 会询问一些配置问题：
- Project name: `distance-observer` (或自定义名称)
- Directory: `./` (保持默认)
- Build command: `npm run build` (已自动配置)
- Output directory: `dist` (已自动配置)

4. **生产环境部署**

```bash
vercel --prod
```

### 通过 Git 自动部署

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "Import Project"
4. 选择你的仓库
5. Vercel 会自动检测到 Vite 项目并使用正确的配置
6. 点击 "Deploy"

之后，每次推送到主分支都会自动触发部署。

### 环境变量（可选）

如果需要配置环境变量，在 Vercel Dashboard 的项目设置中添加：

- Project Settings → Environment Variables

### 自定义域名

在 Vercel Dashboard 中：
1. 进入项目设置
2. 选择 "Domains"
3. 添加你的自定义域名
4. 按照提示配置 DNS

## 项目结构

```
distance-observer/
├── index.html              # HTML 入口
├── style.css              # 全局样式
├── src/
│   ├── main.js           # 主程序入口
│   ├── InsightStar.js    # 星辰类（单个 insight 的 3D 表示）
│   └── insights.js       # 示例数据
├── package.json
├── vite.config.js
└── README.md
```

## 自定义内容

### 修改 Insights

编辑 `src/insights.js` 文件，添加你自己的内容：

```javascript
export const sampleInsights = [
  {
    title: '你的标题',
    content: '你的内容描述'
  },
  // 添加更多...
];
```

### 调整视觉效果

在 `src/main.js` 中可以调整：

- `observeDistance` - 初始观察距离
- `minDistance` / `maxDistance` - 缩放范围
- 背景星点数量（当前 800 个）

在 `src/InsightStar.js` 中可以调整：

- 星辰的大小和颜色
- 漂浮速度和幅度
- 旋转速度
- 文字样式

## 设计哲学

这个项目受到以下理念启发：

1. **Zettelkasten 方法** - 知识卡片的网络化组织
2. **宇宙的隐喻** - 想法如星辰般存在于思维空间
3. **正念观察** - 观察而不执着，理解而不占有
4. **空间化思维** - 通过空间距离来表达概念之间的关系

## 使用场景

- **个人知识管理** - 将笔记、想法可视化
- **创意展示** - 以独特的方式展示作品集
- **冥想工具** - 观察漂浮的文字，帮助思考
- **艺术装置** - 作为交互艺术作品展出

## 性能优化

- 自适应设备像素比（最高 2x）
- 使用 BufferGeometry 提高性能
- Shader 材质优化粒子渲染
- 雾效果减少远处物体渲染开销

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

需要支持 WebGL 的现代浏览器。

## 许可证

MIT

## 致谢

灵感来源：
- 夜空中的星辰
- 知识的网络化组织
- 观察与距离的哲学

---

**保持距离，享受观察的乐趣** ✨
