// Tipos Basicos
let age: number = 23;
const firstName: string = "Jose";
const isValid: boolean = true;
let idk: any = 5;

idk = "maybe a string now?";
idk = false;

const ids: number[] = [1, 2, 3, 4, 5];
const booleans: boolean[] = [true, false, true];
const names: string[] = ["Jose", "Maria", "Joao"];

// Tuplas
const person: [number, string] = [20, "jane"];

// Lita de Tuplas
const people: [number, string][] = [
  [10, "alice"],
  [20, "bob"],
  [30, "charlie"],
];

// Union
const productID: number | string | boolean = false;

// enum
enum Direction {
  up = 1,
  down = 2,
}

const direction = Direction.up;

// Type Assertions
const produtctNAme: any = "Bone";

// let itemID = produtctNAme as string;
let itemID = <string>produtctNAme;
