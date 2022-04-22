<script>
  import { getContext } from "svelte";
  import { Card, FileDropzone } from "attractions";
  import { MeshNormalMaterial, BufferGeometryLoader, Mesh, MeshLambertMaterial } from "three";
  import rhino3dm from "rhino3dm";
  import { key as sceneKey } from "./key";
  import { HsvPicker } from "svelte-color-picker";

  let width = "100%";
  let height = "55vh";
  let threeMesh;

  const { getScene } = getContext(sceneKey);

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
    let arr = new Uint8Array(buffer);
    let doc = rhino.File3dm.fromByteArray(arr);
    let material = new MeshLambertMaterial( { color: 0xff0000} );

    let objects = doc.objects();
    for (let i = 0; i < objects.count; i++) {
      let mesh = objects.get(i).geometry();
      threeMesh = meshToThreejs(mesh, material);
      scene.add(threeMesh);
    }
  };

  const meshToThreejs = (mesh, material) => {
    let loader = new BufferGeometryLoader();
    var geometry = loader.parse(mesh.toThreejsJSON());
    return new Mesh(geometry, material);
  };

  const onColorChange = (color) => {
    if (threeMesh) {
    let hex = rgb2hex([color.detail.r, color.detail.g, color.detail.b]);
    threeMesh.material.color.setHex(hex);
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
  }

</script>

<Card tight style="width: {width}; height: {height};">
  <div class="container">
    <div class="inputs">
      <FileDropzone accept=".3dm" max={1} on:change={onChange} />
      <HsvPicker on:colorChange={onColorChange} startColor={"#82EAEA"} />
    </div>
  </div>
</Card>

<style>
  .inputs {
    margin: 20px;
  }
</style>
