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

    // 场景旋转（通过左右滚动控制）
    this.sceneRotation = 0;
    this.targetSceneRotation = 0;

    // 星辰集合
    this.stars = [];

    // Raycaster 用于检测点击
    this.raycaster = new THREE.Raycaster();
    this.mouseClick = new THREE.Vector2();

    // 特写模式
    this.focusedStar = null;
    this.isFocused = false;
    this.originalCameraPos = new THREE.Vector3();
    this.focusedCameraPos = new THREE.Vector3();

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

    // 增强滚轮控制 - 上下缩放，左右旋转
    window.addEventListener('wheel', (e) => {
      e.preventDefault();

      // 垂直滚动 - 控制观察距离（zoom）
      if (Math.abs(e.deltaY) > 0) {
        const delta = e.deltaY * 0.05;
        this.observeDistance += delta;
        this.observeDistance = Math.max(this.minDistance,
                                         Math.min(this.maxDistance, this.observeDistance));
        this.updateDistanceInfo();
      }

      // 水平滚动 - 控制场景旋转
      if (Math.abs(e.deltaX) > 0) {
        this.targetSceneRotation -= e.deltaX * 0.002;
      }
    }, { passive: false });

    // 点击交互 - 特写查看星辰或添加新星辰
    this.canvas.addEventListener('click', (e) => {
      // 计算鼠标在标准化设备坐标系中的位置
      this.mouseClick.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseClick.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // 使用raycaster检测点击
      this.raycaster.setFromCamera(this.mouseClick, this.camera);

      // 创建可交互对象数组（所有星辰的光球）
      const intersectableObjects = this.stars.map(star => star.glowSphere);
      const intersects = this.raycaster.intersectObjects(intersectableObjects);

      if (intersects.length > 0) {
        // 点击到了星辰 - 进入特写模式
        const clickedSphere = intersects[0].object;
        const clickedStar = this.stars.find(star => star.glowSphere === clickedSphere);

        if (clickedStar) {
          this.focusOnStar(clickedStar);
        }
      } else if (this.isFocused) {
        // 在特写模式下点击空白处 - 退出特写
        this.exitFocus();
      } else {
        // 点击空白处 - 添加新星辰
        const randomInsight = sampleInsights[Math.floor(Math.random() * sampleInsights.length)];
        this.addInsightStar(randomInsight);
      }
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

  focusOnStar(star) {
    if (this.isFocused && this.focusedStar === star) {
      // 已经聚焦在这个星辰上，退出特写
      this.exitFocus();
      return;
    }

    this.isFocused = true;
    this.focusedStar = star;

    // 保存当前相机位置
    this.originalCameraPos.copy(this.camera.position);

    // 计算特写位置（在星辰前方15个单位）
    const starWorldPos = new THREE.Vector3();
    star.group.getWorldPosition(starWorldPos);

    // 从星辰到相机的方向
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, starWorldPos)
      .normalize();

    // 特写相机位置
    this.focusedCameraPos.copy(starWorldPos).add(direction.multiplyScalar(15));
  }

  exitFocus() {
    this.isFocused = false;
    this.focusedStar = null;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.0001;

    // 特写模式相机控制
    if (this.isFocused && this.focusedStar) {
      // 更新特写位置（星辰可能在移动）
      const starWorldPos = new THREE.Vector3();
      this.focusedStar.group.getWorldPosition(starWorldPos);

      const direction = new THREE.Vector3()
        .subVectors(this.camera.position, starWorldPos)
        .normalize();

      this.focusedCameraPos.copy(starWorldPos).add(direction.multiplyScalar(15));

      // 平滑移动到特写位置
      this.camera.position.lerp(this.focusedCameraPos, 0.05);

      // 让相机看向星辰
      const lookAtTarget = new THREE.Vector3();
      this.focusedStar.group.getWorldPosition(lookAtTarget);
      this.camera.lookAt(lookAtTarget);
    } else {
      // 正常模式 - 视差效果
      this.camera.position.x += (this.targetCameraPos.x - this.camera.position.x) * 0.05;
      this.camera.position.y += (this.targetCameraPos.y - this.camera.position.y) * 0.05;

      // 平滑缩放
      const targetZ = this.observeDistance;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.1;

      // 重置相机朝向
      this.camera.lookAt(0, 0, 0);
    }

    // 平滑场景旋转（左右滚动控制）
    this.sceneRotation += (this.targetSceneRotation - this.sceneRotation) * 0.05;

    // 应用场景旋转到背景星辰
    if (this.backgroundStars) {
      this.backgroundStars.rotation.y = time * 0.05 + this.sceneRotation;
      this.backgroundStars.rotation.x = time * 0.02;
    }

    // 更新每个insight星辰，并应用场景旋转
    this.stars.forEach((star, index) => {
      star.update(time, this.camera, index);

      // 应用场景旋转（绕Y轴）
      if (!this.isFocused) {
        const radius = Math.sqrt(star.position.x ** 2 + star.position.z ** 2);
        const angle = Math.atan2(star.position.z, star.position.x) + this.sceneRotation;
        star.group.position.x = star.position.x + Math.sin(time * star.driftSpeed.x + star.driftOffset.x) * 2;
        star.group.position.z = star.position.z + Math.cos(time * star.driftSpeed.z + star.driftOffset.z) * 1.5;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}

// 启动应用
new DistanceObserver();
