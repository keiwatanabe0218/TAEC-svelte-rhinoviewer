<script>
    import { getContext } from "svelte";
    import { Button, Card, Slider, H2, FileDropzone } from "attractions";
    import {
      Material,
      MeshNormalMaterial,
      BufferGeometryLoader,
      BufferGeometry,
      Mesh,
    } from "three";
    import rhino3dm from "rhino3dm";
    import { key as sceneKey} from "./rhinoFile";
    import { isLoading as loading } from "./store";
  
    let isLoading;
    loading.subscribe((value) => {
      isLoading = value;
    });
    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
    let width = "100%";
    let height = "50vh";
    let val;
  
    const { getScene } = getContext(sceneKey);
  
    let scene;
  
    const SliderChange = () => {
      console.log(val);
    };

    const onChange = (value) => {
      isLoading = true;
      const scene = getScene();
      rhino3dm().then(async (m) => {
        await _sleep(2000);
  
        console.log("Loaded rhino3dm.");
        let rhino = m;
        value.detail.files.forEach((file) => {
          read3dmfile(rhino, file, scene);
        });
        isLoading = false;
      });
    };
  
    const read3dmfile = async (rhino, file, scene) => {
      const filePath = URL.createObjectURL(file);
      let res = await fetch(filePath);
      let buffer = await res.arrayBuffer();
      let arr = new Uint8Array(buffer);
      let doc = rhino.File3dm.fromByteArray(arr);
      // create a copy of the doc.toByteArray data to get an ArrayBuffer
      // const buffer = new Uint8Array( doc.toByteArray() ).buffer;

  
      let material = new MeshNormalMaterial();
  
      let objects = doc.objects();
      for (let i = 0; i < objects.count; i++) {
        let mesh = objects.get(i).geometry();
        let threeMesh = meshToThreejs(mesh, material);
        scene.add(threeMesh);
      }
    };
  
      const meshToThreejs = (mesh, material) => {
        let loader = new BufferGeometryLoader();
        var geometry = loader.parse(mesh.toThreejsJSON());
        return new Mesh(geometry, material);
      };
  </script>
  
  <Card tight style="width: {width}; height: {height};">
    <div class="container">
      <div class="inputs">
        <FileDropzone accept=".3dm" max={1} on:change={onChange} />
      </div>
    </div>
  </Card>
  <style>
    .inputs {
      margin: 20px;
    }
  </style>
  