import { writable } from "svelte/store";
import { MeshLambertMaterial } from "three";

export const storeMaterial = writable(new MeshLambertMaterial({ color: 0xffffff }));