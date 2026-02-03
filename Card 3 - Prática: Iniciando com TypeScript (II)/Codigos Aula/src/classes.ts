interface IPerson {
  id: number;
  name: string;
  age: number;
  sayMyName(): string;
}

class Person implements IPerson {
  readonly id: number;
  name: string;
  age: number;

  constructor(id: number, name: string, age: number) {
    this.id = id;
    this.name = name;
    this.age = age;
  }

  sayMyName(): string {
    return this.name;
  }
}

// Que clase bonitinha kkkk
class Maicon {
  constructor(
    public id: number,
    public name: string,
    public age: number,
  ) {}
}

class Employee extends Person {
  constructor(id: number, name: string, age: number) {
    super(id, name, age);
  }

  whoAmI(): string {
    return this.name;
  }
}

const felipe = new Person(1, "Felipe", 21);
felipe.name;
