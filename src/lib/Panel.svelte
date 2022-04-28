<script>
  import { getContext } from "svelte";
  import { Card, FileDropzone } from "attractions";
  import {
    MeshNormalMaterial,
    BufferGeometryLoader,
    Mesh,
    MeshLambertMaterial,
    Vector3,
    LineBasicMaterial,
    Line,
    BufferGeometry,
  } from "three";
  import rhino3dm from "rhino3dm";
  import { key as sceneKey } from "./key";
  import { HsvPicker } from "svelte-color-picker";
  import WireframeCheckbox from "./WireframeCheckbox.svelte";
  import { storeMaterial } from "./stores.js";
  import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";

  let width = "100%";
  let height = "55vh";
  let material;
  storeMaterial.subscribe((value) => {
    material = value;
  });

  const { getScene } = getContext(sceneKey);

  const loader = new Rhino3dmLoader();
  loader.setLibraryPath("/build/");

  const onChange = (value) => {
    const scene = getScene();
    rhino3dm().then(async (m) => {
      console.log("Loaded rhino3dm.");
      let rhino = m;
      value.detail.files.forEach((file) => {
        read3dmfile(rhino, file, scene);
      });
    });
  };

  const read3dmfile = async (rhino, file, scene) => {
    const filePath = URL.createObjectURL(file);
    let res = await fetch(filePath);
    let buffer = await res.arrayBuffer();
    loader.parse(buffer, function (object) {
      scene.add(object);
    });
  };

  const meshToThreejs = (mesh, material) => {
    let loader = new BufferGeometryLoader();
    var geometry = loader.parse(mesh.toThreejsJSON());
    return new Mesh(geometry, material);
  };

  const onColorChange = (color) => {
    if (material) {
      let hex = rgb2hex([color.detail.r, color.detail.g, color.detail.b]);
      material.color.setHex(hex);
    }
  };

  const rgb2hex = (rgb) => {
    return (
      "0x" +
      rgb
        .map(function (value) {
          return ("0" + value.toString(16)).slice(-2);
        })
        .join("")
    );
  };

  const onCheckboxChange = (e) => {
    if (material) {
      material.wireframe = e.target.checked;
    }
  };
</script>

<Card tight style="width: {width}; height: {height};">
  <div class="container">
    <div class="inputs">
      <FileDropzone accept=".3dm" max={1} on:change={onChange} />
      <HsvPicker on:colorChange={onColorChange} startColor={"#82EAEA"} />
      <WireframeCheckbox />
    </div>
  </div>
</Card>

<style>
  .inputs {
    margin: 20px;
  }
</style>
