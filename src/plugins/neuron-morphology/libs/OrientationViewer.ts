import * as THREE from 'three';
import { makeText } from './text';

const AXES_HELPER_SCALE = 20;

const createOrientationHelper = (): THREE.Object3D => {
  const orientationHelper = new THREE.Object3D();
  const axesHelper = new THREE.AxesHelper(AXES_HELPER_SCALE);

  const xAxisLAbel = makeText('X', { color: 'red' });
  const yAxisLAbel = makeText('Y', { color: 'green' });
  const zAxisLAbel = makeText('Z', { color: 'blue' });

  xAxisLAbel?.position.set(AXES_HELPER_SCALE, 0, 0);
  yAxisLAbel?.position.set(0, AXES_HELPER_SCALE, 0);
  zAxisLAbel?.position.set(0, 0, AXES_HELPER_SCALE);

  xAxisLAbel && orientationHelper.add(xAxisLAbel);
  yAxisLAbel && orientationHelper.add(yAxisLAbel);
  zAxisLAbel && orientationHelper.add(zAxisLAbel);

  orientationHelper.add(axesHelper);
  return orientationHelper;
};

export class OrientationViewer {
  private renderer: THREE.WebGLRenderer | null;
  private scene: THREE.Scene | null;
  private camera: THREE.Camera | null;
  private orientationHelper: THREE.Object3D;
  private requestedAnimationFrameID: number = 0;

  public followCamera: THREE.Camera | null = null;

  constructor(private div: HTMLDivElement) {
    const canvas = document.createElement('canvas');
    div.appendChild(canvas);
    const context = canvas.getContext('webgl2', {
      // preserveDrawingBuffer: true,
      alpha: true,
      antialias: true,
    });

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      context: context || undefined,
    });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(div.clientWidth, div.clientHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      27,
      div.clientWidth / div.clientHeight,
      1,
      50000
    );
    const camPos = { x: 0, y: 0, z: 100 };
    this.camera.position.x = camPos.x;
    this.camera.position.y = camPos.y;
    this.camera.position.z = camPos.z;
    this.scene.add(this.camera);

    this.orientationHelper = createOrientationHelper();
    this.scene.add(this.orientationHelper);

    window.addEventListener('resize', () => {
      this.renderer?.setSize(div.clientWidth, div.clientHeight);
    });

    this.animate();
  }

  setFollowCamera(camera: THREE.Camera) {
    this.followCamera = camera;
  }

  animate() {
    this.requestedAnimationFrameID = requestAnimationFrame(
      this.animate.bind(this)
    );
    this.render();
  }

  render() {
    if (this.followCamera) {
      this.camera?.lookAt(this.orientationHelper.position.clone());
      this.orientationHelper.rotation.copy(this.followCamera.rotation.clone());

      // Invert the orientation of the object
      // because the camera is inverted (see MorphologyViewer.tsx)
      this.orientationHelper.scale.x = -1;
      this.orientationHelper.scale.y = -1;
      this.orientationHelper.scale.z = -1;
    }
    if (this.scene && this.camera && this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    while (this.div.lastChild) {
      this.div.removeChild(this.div.lastChild);
    }
    cancelAnimationFrame(this.requestedAnimationFrameID);
    this.scene = null;
    this.renderer = null;
    this.camera = null;
  }
}
