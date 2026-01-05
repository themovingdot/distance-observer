import * as THREE from 'three';

export class InsightStar {
  constructor(insight, position) {
    this.insight = insight;
    this.position = position;

    // 创建一个组来包含所有元素
    this.group = new THREE.Group();
    this.group.position.set(position.x, position.y, position.z);

    // 随机初始旋转速度
    this.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.002,
      z: (Math.random() - 0.5) * 0.001
    };

    // 漂浮参数
    this.floatOffset = Math.random() * Math.PI * 2;
    this.floatSpeed = 0.3 + Math.random() * 0.3;
    this.floatAmplitude = 0.5 + Math.random() * 0.5;

    this.init();
  }

  init() {
    // 中心光点
    const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.6, 0.7),
      transparent: true,
      opacity: 0.8
    });
    this.glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    this.group.add(this.glowSphere);

    // 外围光晕
    const haloGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: glowMaterial.color,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    this.halo = new THREE.Mesh(haloGeometry, haloMaterial);
    this.group.add(this.halo);

    // 创建文字精灵
    this.createTextSprite();

    // 连接线（constellation效果）
    this.createConnectionLines();
  }

  createTextSprite() {
    // 创建canvas来渲染文字
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // 设置canvas大小
    canvas.width = 512;
    canvas.height = 256;

    // 清空背景
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制半透明背景
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 10);
    context.fill();

    // 绘制文字
    context.fillStyle = '#ffffff';
    context.font = 'bold 32px sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'top';

    // 标题
    const title = this.insight.title;
    context.fillText(title, canvas.width / 2, 30);

    // 内容（小字）
    context.font = '20px sans-serif';
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';

    const content = this.insight.content;
    const maxWidth = canvas.width - 40;
    const lineHeight = 28;
    let y = 80;

    // 简单的文字换行
    const words = content.split('');
    let line = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = context.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        context.fillText(line, canvas.width / 2, y);
        line = words[i];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, canvas.width / 2, y);

    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // 创建精灵材质
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      depthTest: false
    });

    this.textSprite = new THREE.Sprite(spriteMaterial);
    this.textSprite.scale.set(8, 4, 1);
    this.textSprite.position.set(0, 2, 0);

    this.group.add(this.textSprite);
  }

  createConnectionLines() {
    // 创建一些装饰性的连接线
    const points = [];
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1 + Math.random() * 0.5;

      points.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          (Math.random() - 0.5) * 0.5
        )
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: this.glowSphere.material.color,
      transparent: true,
      opacity: 0.3
    });

    this.connectionLines = new THREE.LineSegments(geometry, material);
    this.group.add(this.connectionLines);
  }

  update(time, camera, index) {
    // 缓慢自转
    this.group.rotation.x += this.rotationSpeed.x;
    this.group.rotation.y += this.rotationSpeed.y;
    this.group.rotation.z += this.rotationSpeed.z;

    // 漂浮效果
    const floatY = Math.sin(time * this.floatSpeed + this.floatOffset) * this.floatAmplitude;
    this.group.position.y = this.position.y + floatY;

    // 光晕呼吸效果
    const pulse = Math.sin(time * 2 + index) * 0.1 + 0.9;
    this.halo.scale.setScalar(pulse);
    this.glowSphere.material.opacity = 0.6 + pulse * 0.2;

    // 让文字始终面向相机
    if (this.textSprite && camera) {
      this.textSprite.quaternion.copy(camera.quaternion);
    }

    // 连接线动画
    if (this.connectionLines) {
      this.connectionLines.rotation.y = time * 0.5;
    }
  }
}
