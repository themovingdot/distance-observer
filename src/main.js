import * as THREE from 'three';
import { InsightStar } from './InsightStar.js';
import { sampleInsights } from './insights.js';

class DistanceObserver {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.distanceInfo = document.getElementById('distance-info');
    this.starCount = document.getElementById('star-count');

    // 鼠标位置
    this.mouse = { x: 0, y: 0 };
    this.targetCameraPos = { x: 0, y: 0 };

    // 观察距离
    this.observeDistance = 50;
    this.minDistance = 20;
    this.maxDistance = 150;

    // 星辰集合
    this.stars = [];

    this.init();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    // 场景
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);

    // 相机
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = this.observeDistance;

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1);

    // 环境光 - 微弱的星光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambientLight);

    // 添加背景星辰（装饰性的小点）
    this.addBackgroundStars();

    // 初始化一些示例星辰
    this.initializeSampleStars();
  }

  addBackgroundStars() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const sizes = [];

    // 创建800个背景星点
    for (let i = 0; i < 800; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;

      vertices.push(x, y, z);
      sizes.push(Math.random() * 1.5);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // 自定义着色器材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        varying float vAlpha;

        void main() {
          vAlpha = 0.3 + sin(position.x * 0.1 + position.y * 0.1) * 0.2;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          float distanceToCenter = length(gl_PointCoord - vec2(0.5));
          if (distanceToCenter > 0.5) discard;

          float alpha = (1.0 - distanceToCenter * 2.0) * vAlpha;
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.backgroundStars = new THREE.Points(geometry, material);
    this.scene.add(this.backgroundStars);
  }

  initializeSampleStars() {
    // 随机选择5-8个初始insights
    const count = 5 + Math.floor(Math.random() * 4);
    const shuffled = [...sampleInsights].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      this.addInsightStar(shuffled[i % shuffled.length]);
    }
  }

  addInsightStar(insight) {
    // 在球形空间中随机分布
    const radius = 30 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi) - this.observeDistance;

    const star = new InsightStar(insight, { x, y, z });
    this.stars.push(star);
    this.scene.add(star.group);

    this.updateStarCount();
  }

  setupEventListeners() {
    // 鼠标移动 - 视差效果
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // 计算目标相机位置（视差效果）
      this.targetCameraPos.x = this.mouse.x * 5;
      this.targetCameraPos.y = this.mouse.y * 5;
    });

    // 滚轮缩放 - 改变观察距离
    window.addEventListener('wheel', (e) => {
      e.preventDefault();

      const delta = e.deltaY * 0.05;
      this.observeDistance += delta;
      this.observeDistance = Math.max(this.minDistance,
                                       Math.min(this.maxDistance, this.observeDistance));

      this.updateDistanceInfo();
    }, { passive: false });

    // 点击添加新星辰
    this.canvas.addEventListener('click', (e) => {
      const randomInsight = sampleInsights[Math.floor(Math.random() * sampleInsights.length)];
      this.addInsightStar(randomInsight);
    });

    // 窗口大小调整
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 开始按钮
    const startBtn = document.getElementById('start-btn');
    const welcome = document.getElementById('welcome');

    startBtn.addEventListener('click', () => {
      welcome.classList.add('hidden');
    });
  }

  updateDistanceInfo() {
    this.distanceInfo.textContent = `观察距离: ${Math.round(this.observeDistance)}`;
  }

  updateStarCount() {
    this.starCount.textContent = `星辰数量: ${this.stars.length}`;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.0001;

    // 平滑相机移动（视差效果）
    this.camera.position.x += (this.targetCameraPos.x - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.targetCameraPos.y - this.camera.position.y) * 0.05;

    // 平滑缩放
    const targetZ = this.observeDistance;
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.1;

    // 背景星辰缓慢旋转
    if (this.backgroundStars) {
      this.backgroundStars.rotation.y = time * 0.05;
      this.backgroundStars.rotation.x = time * 0.02;
    }

    // 更新每个insight星辰
    this.stars.forEach((star, index) => {
      star.update(time, this.camera, index);
    });

    this.renderer.render(this.scene, this.camera);
  }
}

// 启动应用
new DistanceObserver();
