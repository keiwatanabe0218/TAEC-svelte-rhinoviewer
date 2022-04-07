<script>
	import Header from "./lib/Header.svelte";
	import Footer from "./lib/Footer.svelte"
	import Viewer from "./lib/Viewer.svelte";
	import Panel from "./lib/Panel.svelte";
</script>
  
<main>
	<Header />
	<div class="container">
	  <div class="viewer">
		<Viewer>
			<Panel slot="leftSidebar" />
		</Viewer>
	  </div>
	</div>
	<footer_child />
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