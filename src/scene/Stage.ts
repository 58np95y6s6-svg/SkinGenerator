// Scène 3D : rendu, éclairage de studio, ombre au sol, contrôles tactiles.
// Le personnage tourne sur lui-même (les lumières restent fixes, comme en studio).

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Character } from '../character/Character';

const FOV = 28;

export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 50);
  readonly character = new Character();

  private turntable = new THREE.Group();
  private shadow: THREE.Mesh;
  private timer = new THREE.Timer();
  private raf = 0;
  private ro: ResizeObserver;

  // Contrôles
  private yaw = 0;
  private vel = 0;
  private elev = 0.06;
  private zoom = 1;
  private shownH = 0;
  private lastInput = -10;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinchDist = 0;

  constructor(private container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    const canvas = this.renderer.domElement;
    canvas.style.touchAction = 'none';
    container.appendChild(canvas);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.55;
    pmrem.dispose();

    const key = new THREE.DirectionalLight('#fff6ec', 1.9);
    key.position.set(2.2, 4, 3.2);
    const fill = new THREE.DirectionalLight('#eef2ff', 0.6);
    fill.position.set(-3, 2, 2);
    const rim = new THREE.DirectionalLight('#ffffff', 1.1);
    rim.position.set(-1, 3, -4);
    const hemi = new THREE.HemisphereLight('#ffffff', '#d9d2e6', 0.5);
    this.scene.add(key, fill, rim, hemi);

    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.001;
    this.scene.add(this.shadow);

    this.turntable.add(this.character.root);
    this.scene.add(this.turntable);

    this.bindControls(canvas);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.loop();
  }

  /** Signale une interaction (suspend la rotation automatique). */
  poke() {
    this.lastInput = this.timer.getElapsed();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private loop = (now?: number) => {
    this.raf = requestAnimationFrame(this.loop);
    this.timer.update(now);
    const dt = Math.min(this.timer.getDelta(), 0.05);
    const t = this.timer.getElapsed();

    // Rotation : inertie après un glissement, puis lente rotation automatique au repos.
    const idle = t - this.lastInput > 3.5 && this.pointers.size === 0;
    const target = idle ? 0.32 : 0;
    if (this.pointers.size === 0) this.vel += (target - this.vel) * Math.min(1, dt * (idle ? 0.8 : 3));
    this.yaw += this.vel * dt;
    // Point d'entrée de test : fige l'angle de vue (captures automatiques).
    const forced = (window as { __yaw?: number }).__yaw;
    if (typeof forced === 'number') this.yaw = forced;
    this.turntable.rotation.y = this.yaw;

    this.character.tick(t);
    this.frame(dt);
    this.renderer.render(this.scene, this.camera);
  };

  /** Cadre la caméra sur le personnage (en douceur quand sa taille change). */
  private frame(dt: number) {
    const H = this.character.height || 1.7;
    this.shownH = this.shownH ? this.shownH + (H - this.shownH) * Math.min(1, dt * 6) : H;
    const h = this.shownH;
    const half = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const distV = (h * 0.5 + 0.2) / half;
    const distW = Math.max(0.5, h * 0.28) / (half * this.camera.aspect);
    const dist = (Math.max(distV, distW) * 1.04) / this.zoom;
    const z = THREE.MathUtils.clamp((this.zoom - 1) / 2, 0, 1);
    const ty = THREE.MathUtils.lerp(h * 0.47, h * 0.84, z);
    this.camera.position.set(0, ty + Math.sin(this.elev) * dist, Math.cos(this.elev) * dist);
    this.camera.lookAt(0, ty, 0);
    const s = this.character.metrics ? this.character.metrics.shoulderW * 5.2 * this.character.config.height : 1;
    this.shadow.scale.set(s, s * 0.75, 1);
  }

  private bindControls(el: HTMLCanvasElement) {
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.pinchDist = this.pinch();
      this.vel = 0;
      this.poke();
    });
    el.addEventListener('pointermove', (e) => {
      const p = this.pointers.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      this.poke();
      if (this.pointers.size === 1) {
        const k = 0.012;
        this.yaw += dx * k;
        this.vel = THREE.MathUtils.lerp(this.vel, (dx * k) / 0.016, 0.5);
        this.elev = THREE.MathUtils.clamp(this.elev + dy * 0.004, -0.2, 0.6);
      } else if (this.pointers.size === 2) {
        const d = this.pinch();
        if (this.pinchDist > 0) this.setZoom(this.zoom * (d / this.pinchDist));
        this.pinchDist = d;
      }
    });
    const up = (e: PointerEvent) => {
      this.pointers.delete(e.pointerId);
      this.pinchDist = this.pinch();
      if (this.pointers.size > 0) this.vel = 0;
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.setZoom(this.zoom * Math.exp(-e.deltaY * 0.0015));
        this.poke();
      },
      { passive: false },
    );
    el.addEventListener('dblclick', () => {
      this.zoom = 1;
      this.elev = 0.06;
    });
  }

  private setZoom(z: number) {
    this.zoom = THREE.MathUtils.clamp(z, 0.8, 3.2);
  }

  private pinch(): number {
    if (this.pointers.size < 2) return 0;
    const [a, b] = [...this.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}

function blobTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(40,30,70,0.32)');
  grd.addColorStop(0.5, 'rgba(40,30,70,0.14)');
  grd.addColorStop(1, 'rgba(40,30,70,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
