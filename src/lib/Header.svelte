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
  