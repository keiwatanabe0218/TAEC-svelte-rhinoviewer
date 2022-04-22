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
  
    setContext(sceneKey, {
      getScene: () => scene,
    });
  
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
  
      // create the directional light
      // 指向性ライトの作成
      const directionalLight = new DirectionalLight(
        lightColor,
        0.5
      );
      directionalLight.position.set(10, 10, 10);
      directionalLight.target.position.set(0, 0, 0);
      scene.add(directionalLight);
      scene.add(directionalLight.target);
  
      // create the renderer
      // レンダラの作成
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
      });
      renderer.setSize(canvasWidth, canvasHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
  
      // create the grid
      // グリッドの生成
      const grid = new GridHelper(50, 30);
      grid.rotateX(Math.PI / 2); 
      scene.add(grid);
  
      // add the axes helper
      // AxesHelperの追加
      const axes = new AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 1;
      axes.rotateX(Math.PI / 2); 
      scene.add(axes);
      // create the orbit controls
      // オービットコントロール（シーンをナビゲートするためのもの）の作成
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.target.set(-2, 0, 0);
      animate();
    };
    // set animation loop
    // アニメーションループ
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    // check initialization of the canvas
    // canvasの初期化の確認
    const isReadyThreeCanvas = () => {
      return !!scene && !!camera && !!renderer;
    };
  
    // update the camera setting for change of the canvas size
    // canvasのサイズが変更された時にカメラの更新をする
    const onResizeCanvas = () => {
      if (!isReadyThreeCanvas()) return;
      // canvasWidth = window.innerWidth;
      // canvasHeight = window.innerHeight;
  
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(canvasWidth, canvasHeight);
  
      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();
    };
  
    // event handler of changing size of the canvas
    // canvasのサイズが変わった際のイベントハンドラー
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
  