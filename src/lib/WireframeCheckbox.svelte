<script>
  import { storeMaterial } from "./stores.js"
  const onCheckboxChange = (e) => {
    let newMaterial;
    storeMaterial.subscribe(value => {
      newMaterial = value;
    });
    newMaterial.wireframe = e.target.checked;
    storeMaterial.update(material => newMaterial);
};
</script>

<label>
    <input type=checkbox on:change={onCheckboxChange}>
    Wireframe
</label>