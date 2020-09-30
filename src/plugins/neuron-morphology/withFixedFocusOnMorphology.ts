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

    // Get the coordinates for the center of the soma
    // This will be the point we want the camera to focus on!

    // NOTE: this function falls back to bounding box center even if soma is generated
    // via orphaned sections
    let targetPoint = morphoMesh.getTargetPoint();

    // Does the soma exist or was it automatically generated?
    const somaCenterTargetExists = !!morphoMesh._pointToTarget;

    // If soma was generated using orphaned sections
    // then we need to get the soma mesh and use the coordintates from that
    if (!somaCenterTargetExists) {
      // in the case where the soma was automatically generated
      // by guessing the shape from the orphaned sections
      // the soma will be added to the Morphology Object3D last
      const soma = morphoMesh.children[morphoMesh.children.length - 1];

      const somaBoundingBox = new THREE.Box3();
      somaBoundingBox.expandByObject(soma);

      // set the new target point from the soma's bounding box
      // instead of the entire neuron bounding box
      targetPoint = somaBoundingBox.getCenter(new THREE.Vector3());
    }

    // Look at our new center point
    this._camera.lookAt(targetPoint);
    // apply soma center coordinates as OrbitControls target
    // this will center the controls around it for rotation
    this._controls.target.copy(targetPoint);

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
