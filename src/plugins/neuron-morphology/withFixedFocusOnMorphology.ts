// @ts-nocheck
import * as THREE from 'three';

const CAMERA_DISTANCE_OFFSET = 1;

// This is a temporary fix
// THIS CODE IS MEANT TO BE REMOVED
// that addresses focus problems in the morphoviewer library
// this higher order function patches a morphoviewer instance
// with a working focus funciton.
// https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/24
const withFixedFocusOnMorphology = morphoViewer => {
  morphoViewer._threeContext.focusOnMorphology = function(name = null) {
    let morphoName = name;
    // if no name of morphology is provided, we take the first one
    if (!morphoName) {
      const allNames = Object.keys(this._morphologyMeshCollection);
      if (allNames.length) {
        morphoName = allNames[0];
      } else {
        return;
      }
    }

    const fitOffset = CAMERA_DISTANCE_OFFSET;

    const morphoMesh = this._morphologyMeshCollection[morphoName];

    const box = new THREE.Box3();

    box.expandByObject(morphoMesh);

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance =
      maxSize / (2 * Math.atan((Math.PI * this._camera.fov) / 360));
    const fitWidthDistance = fitHeightDistance / this._camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    const direction = this._controls.target
      .clone()
      .sub(this._camera.position)
      .normalize()
      .multiplyScalar(distance);

    this._controls.maxDistance = distance * 10;
    this._controls.target.copy(center);

    this._camera.near = distance / 100;
    this._camera.far = distance * 100;
    this._camera.updateProjectionMatrix();

    this._camera.position.copy(this._controls.target).sub(direction);
    this._camera.rotation.set(new THREE.Vector3());

    this._controls.update();

    this._render();
  };
  return morphoViewer;
};

export default withFixedFocusOnMorphology;
