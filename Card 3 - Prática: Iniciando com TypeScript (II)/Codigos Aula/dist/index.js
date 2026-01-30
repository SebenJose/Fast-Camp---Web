// Tipos Basicos
let age = 23;
const firstName = "Jose";
const isValid = true;
let idk = 5;
idk = "maybe a string now?";
idk = false;
const ids = [1, 2, 3, 4, 5];
const booleans = [true, false, true];
const names = ["Jose", "Maria", "Joao"];
// Tuplas
const person = [20, "jane"];
// Lita de Tuplas
const people = [
    [10, "alice"],
    [20, "bob"],
    [30, "charlie"]
];
// intersections
const productID = false;
// enum
var Direction;
(function (Direction) {
    Direction[Direction["up"] = 1] = "up";
    Direction[Direction["down"] = 2] = "down";
})(Direction || (Direction = {}));
const direction = Direction.up;
export {};
//# sourceMappingURL=index.js.map