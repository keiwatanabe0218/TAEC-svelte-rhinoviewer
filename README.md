# 今日やること
- svelteを使って3dmファイルを閲覧できるビューアーを作ります

# 環境
- VSCode
- Node.js v14.16.1
    - svelte v3.0.0
    - rhino3dm v7.14.0
    - attractions v3.7.0
    - three v0.139.2

# Svelteとは
https://svelte.dev/
- UI作成のためのコンポーネントベースのフレームワーク
- Vue、Reactと違って仮想DOMを使わないことで、高速化・パフォーマンス向上
- 少ないコードで書ける

# Hello World
```
npx degit sveltejs/template taec-svelte
cd taec-svelte
npm install
npm run dev
```
<img width="1671" alt="svelte-helloworld" src="https://user-images.githubusercontent.com/45413802/161876725-555240d9-9e7e-4eba-a218-d8cff06e6b37.png">

# attractionsとrhino3dmを使う
https://illright.github.io/attractions/
## 1. パッケージをインストール
```
npm i rhino3dm three --save-dev
npm i attractions svelte-preprocess sass postcss --save-dev
npm i rollup-plugin-node-builtins rollup-plugin-node-globals --save-dev
```
## 2. wasmを移動

- `node_modules/rhino3dm`内の`rhino3dm.wasm`を`public/build`にコピペ
## 3. Header/Footerを追加
- `src/lib`内に`Header.svelte`と`Footer.svelte`を追加
### Header.svelte
```svelte
<script>
    import {
      H1,
      Divider,
      Breadcrumbs,
    } from "attractions";
    const items = [
      { href: "/", text: "Home" },
      { href: "/docs", text: "Docs" },
    ];
  </script>
  <div>
      <div class="title">
          <H1>TAEC 3dm viewer</H1>
      </div>
      <div class="crumbs">
          <Breadcrumbs {items} />
      </div>
  </div>
  <Divider style="margin-bottom: 20px" />
  
  <style>
      .title {
          float: left;
      }
      .crumbs{
          float: left;
      }
  </style>
```

### Footer.svelte
```svelte
<script>
    import {Divider} from 'attractions';
</script>
  
<div>
<footer>
    <Divider style="margin-bottom: 20px" />
    <p>© All rights reserved by ****</p>
</footer>

</div>

<style>
footer {
    width: 100%;
    text-align: center;
    position:absolute;
    bottom:0;
}
</style>
```

### App.svelte
```svelte
<script>
	import Header from "./lib/Header.svelte";
	import Footer from "./lib/Footer.svelte"
</script>
  
<main>
	<Header />
	<div class="footer">
	  <Footer />
	</div>
  </main>
  
<style>
.footer{
    float: bottom;
    width: 100%;
}
</style>
```

### rollup.config.js
- importを追加
```diff
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
+import sveltePreprocess from 'svelte-preprocess';
+import builtins from 'rollup-plugin-node-builtins';
+import globals from 'rollup-plugin-node-globals';
```
- pluginsに追加
```diff
+ commonjs(),
+ globals(),
+ builtins(),
svelte({
+    preprocess: sveltePreprocess({ sourceMap: !production }),
    compilerOptions: {
        // enable run-time checks when not in production
        dev: !production
    }
}),
- commonjs(),
```
<img width="1674" alt="スクリーンショット 2022-04-06 10 58 56" src="https://user-images.githubusercontent.com/45413802/161880550-77dcb466-5406-467e-b13c-923bd150f247.png">

## 4. ビューアーを追加
- `src/lib/Viewer.svelte`を追加
### Viewer.svelte
```svelte
<script>
    import { onMount, setContext } from "svelte";
    import { Card, Loading } from "attractions";
    import {
      AmbientLight,
      AxesHelper,
      DirectionalLight,
      GridHelper,
      PerspectiveCamera,
      Scene,
      WebGLRenderer,
      Object3D,
    } from "three";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import rhino3dm from "rhino3dm";
    import {key as sceneKey} from "./key";
  
    let canvasWidth;
    let canvasHeight;
    let canvas;
    export let width = "100%";
    export let height = "80vh";
  
    let scene;
    let camera;
    let renderer;
    let controls;
    Object3D.DefaultUp.set(0, 0, 1);
  
    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
    onMount(() => {
      load_model;
    });
  
    const load_model = new Promise((resolve, reject) => {
      rhino3dm().then(async (m) => {
        await _sleep(2000);
        console.log("Loaded rhino3dm.");
        let rhino = m;
        await init();
        resolve();
      });
    });

  
    const init = () => {
      // create the Three.js scene
      // Three.jsのシーン作成
      scene = new Scene();
  
      // creates the camera
      // カメラ（ユーザーの視点）の作成
      camera = new PerspectiveCamera(75, canvasWidth / canvasHeight);
      camera.position.z = 15;
      camera.position.y = 13;
      camera.position.x = 8;
  
      // define the color of light
      // ライトの色を設定
      const lightColor = 0xffffff;
  
      // create the ambientLight（環境光の作成）
      const ambientLight = new AmbientLight(lightColor, 0.5);
      scene.add(ambientLight);
  
      const directionalLight = new DirectionalLight(
        lightColor,
        0.5
      );
      directionalLight.position.set(10, 10, 10);
      directionalLight.target.position.set(0, 0, 0);
      scene.add(directionalLight);
      scene.add(directionalLight.target);
  
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
      });
      renderer.setSize(canvasWidth, canvasHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;

      const grid = new GridHelper(50, 30);
      grid.rotateX(Math.PI / 2); 
      scene.add(grid);
  
      const axes = new AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 1;
      axes.rotateX(Math.PI / 2); 
      scene.add(axes);

      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.target.set(-2, 0, 0);
      animate();
    };

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const isReadyThreeCanvas = () => {
      return !!scene && !!camera && !!renderer;
    };
  
    const onResizeCanvas = () => {
      if (!isReadyThreeCanvas()) return;
  
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(canvasWidth, canvasHeight);
  
      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();
    };

    $: canvasWidth, onResizeCanvas();
    $: canvasHeight, onResizeCanvas();
  </script>
  
  <div>
    <Card tight style="width: {width}; height: {height};">
      {#if $$slots.leftSidebar}
        <div class="panel">
            <slot name="leftSidebar" />
        </div>
      {/if}
      <div
        class="three-canvas-container"
        bind:clientWidth={canvasWidth}
        bind:clientHeight={canvasHeight}
      >
        <canvas bind:this={canvas} />
        {#await load_model}
          <div>
            <Loading />
          </div>
        {:then}
          <p />
        {:catch error}
          <p>Error</p>
        {/await}
      </div>
    </Card>
  </div>
  
  <style>
    .three-canvas-container {
      width: 100%;
      height: 100%;
    }
    .panel {
      z-index: 3;
      position: absolute;
      margin: 20px;
      float: left;
      width: 20%;
    }
  </style>
```
### App.svelte
```diff
<script>
	import Header from "./lib/Header.svelte";
	import Footer from "./lib/Footer.svelte"
+	import Viewer from "./lib/Viewer.svelte";
</script>
  
<main>
	<Header />
+	<div class="container">
+	  <div class="viewer">
+		<Viewer/>
+	  </div>
+	</div>
	<div class="footer">
	  <Footer />
	</div>
  </main>
  
  <style>
+	.viewer{
+	  z-index: 2;
+	  width: 100%;
+	  height: 100%;
+	}
  
	.footer{
	  float: bottom;
	  width: 100%;
	}
  
  </style>
```
![スクリーンショット 2022-04-07 23 21 31](https://user-images.githubusercontent.com/45413802/162221343-4caef656-19fb-4acd-82b6-984dafd5507a.png)
# ファイルアップロード機能を追加する
## 1. sceneを共有する
- `src/lib`に`key.js`を作成
### key.js
```js
export const key = Symbol();
```
### Viewer.svelte
```diff
import rhino3dm from "rhino3dm";
+ import {key as sceneKey} from "./key";

let canvasWidth;
let canvasHeight;
let canvas;
export let width = "100%";
export let height = "80vh";

+setContext(sceneKey, {
+    getScene: () => scene,
+ });

let scene;
let camera;
```
## 2. コントロールを追加
- `src/lib`内に`Panel.svelte`を作成
### Panel.svelte
```svelte
<script>
    import { getContext } from "svelte";
    import { Card, FileDropzone } from "attractions";
    import {
      MeshNormalMaterial,
      BufferGeometryLoader,
      Mesh,
    } from "three";
    import rhino3dm from "rhino3dm";
    import { key as sceneKey} from "./key";
  
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
      let material = new MeshNormalMaterial();
  
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
```
### App.svelte
```diff
<script>
	import Header from "./lib/Header.svelte";
	import Footer from "./lib/Footer.svelte"
	import Viewer from "./lib/Viewer.svelte";
+	import Panel from "./lib/Panel.svelte";
</script>
  
<main>
	<Header />
	<div class="container">
	  <div class="viewer">
-       <Viewer/>
+		<Viewer>
+			<Panel slot="leftSidebar" />
+		</Viewer>
	  </div>
	</div>
	<div class="footer">
	  <Footer />
	</div>
  </main>
  
  <style>
	.viewer{
	  z-index: 2;
	  width: 100%;
	  height: 100%;
	}
  
	.footer{
	  float: bottom;
	  width: 100%;
	}
  
  </style>
```
![スクリーンショット 2022-04-07 23 20 28](https://user-images.githubusercontent.com/45413802/162221137-4cc13854-ecbd-44d0-a3ab-9a98255fabce.png)

# カラーピッカーを追加
## 1. カラーピッカーを追加
https://github.com/efeskucuk/svelte-color-picker
```
npm i svelte-color-picker
```
## 2. Panel.svelteを更新
### Panel.svelte
```diff
import {
      MeshNormalMaterial,
      BufferGeometryLoader,
      Mesh,
+     MeshLambertMaterial
    } from "three";
import rhino3dm from "rhino3dm";
import { key as sceneKey } from "./key";
+ import { HsvPicker } from "svelte-color-picker";
```

```diff
    const filePath = URL.createObjectURL(file);
    let res = await fetch(filePath);
    let buffer = await res.arrayBuffer();
    let arr = new Uint8Array(buffer);
    let doc = rhino.File3dm.fromByteArray(arr);
-   let material = new MeshNormalMaterial();
+   let material = new MeshLambertMaterial( { color: 0xff0000} );
```
```
  // カラーピッカーが変更された時
  const onColorChange = (color) => {
    if (threeMesh) {
    let hex = rgb2hex([color.detail.r, color.detail.g, color.detail.b]);
    threeMesh.material.color.setHex(hex);
    }
  };
  // rgbをhexに変換
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
```
```diff
<Card tight style="width: {width}; height: {height};">
  <div class="container">
    <div class="inputs">
      <FileDropzone accept=".3dm" max={1} on:change={onChange} />
+      <HsvPicker on:colorChange={onColorChange} startColor={"#82EAEA"} />
    </div>
  </div>
</Card>
```
<img width="1678" alt="スクリーンショット 2022-04-23 0 20 14" src="https://user-images.githubusercontent.com/45413802/164744574-04054616-c18a-440e-b2b6-9bdc1a010392.png">

# 参考
https://zenn.dev/masamiki/articles/c9a34119acfd6c
https://github.com/efeskucuk/svelte-color-picker