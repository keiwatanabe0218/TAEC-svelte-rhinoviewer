# 今日やること
- svelteを使って3dmファイルを閲覧できるビューアーを作ります

# 環境
- VSCode
- Node.js v14.16.1
    - svelte 3.0.0
    - rhino3dm 7.14.0
    - attractions 3.7.0
    - three 0.139.2

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

# rhino3dmを使う
## パッケージをインストール
```
npm i --save-dev rhino3dm three --save-dev
npm i --save-dev attractions svelte-preprocess sass postcss --save-dev
npm i rollup-plugin-node-builtins rollup-plugin-node-globals --save-dev
```
## wasmを移動

- `node_modules/rhino3dm`内の`rhino3dm.wasm`を`public/build`にコピペ
## Header/Footerを追加
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

## ビューアーを追加
- `src/lib/Viewer.svelte`を追加
```

```

# ファイルアップロード機能を追加する
```

```
## コントロールを追加
```

```

# 参考
https://zenn.dev/masamiki/articles/c9a34119acfd6c