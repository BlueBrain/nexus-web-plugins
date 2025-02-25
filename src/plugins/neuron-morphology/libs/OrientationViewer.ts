import * as THREE from 'three';
import { removeChildren } from './dom';
import { makeText } from './text';

const AXES_HELPER_SCALE = 15;

const createOrientationHelper = (): THREE.Object3D => {
  const orientationHelper = new THREE.Object3D();

  const colors = ['red', 'green', 'blue'];
  const axes = ['X', 'Z', 'Y'];

  // We need to swap Y for Z
  // because three.js uses an uncommon orientation format
  // therefore we will generate the Axes Helper ourselves
  const positions = [
    [AXES_HELPER_SCALE, 0, 0],
    [0, 0, AXES_HELPER_SCALE],
    [0, AXES_HELPER_SCALE, 0],
  ];

  for (let i = 0; i <= 2; i++) {
    const color = colors[i];
    const position = new THREE.Vector3(
      positions[i][0],
      positions[i][1],
      positions[i][2]
    );

    const geometry = new THREE.Geometry();
    geometry.vertices.push(position, new THREE.Vector3(0, 0, 0));
    const material = new THREE.LineBasicMaterial({
      color,
      linewidth: 1,
    });
    const line = new THREE.LineSegments(geometry, material);

    const label = axes[i];
    const axisLabel = makeText(label, { color });
    // Make sure the label has a little margin
    const labelPosition = position.clone().multiplyScalar(1.2);
    axisLabel?.position.set(labelPosition.x, labelPosition.y, labelPosition.z);

    axisLabel && orientationHelper.add(axisLabel, line);
  }

  return orientationHelper;
};

export default class OrientationViewer {
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
      alpha: true,
    });
    this.renderer.setClearColor(0x000000, 0);
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
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
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
    removeChildren(this.div);
    cancelAnimationFrame(this.requestedAnimationFrameID);
    this.scene = null;
    this.renderer = null;
    this.camera = null;
  }
}
