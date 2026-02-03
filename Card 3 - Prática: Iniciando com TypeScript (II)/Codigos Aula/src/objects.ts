// type
type Order = {
  productId: string;
  price: number;
};

type User = {
  firstName: string;
  age: number;
  email: string;
  password?: string;
  orders: Order[];
};

const user: User = {
  firstName: "jose",
  age: 30,
  email: "jose@example.com",
  password: "secret123",
  orders: [{ productId: "abc123", price: 29.99 }],
};

const printLog = (message: string): void => {};

printLog(user.password!);

// Union
type Author = {
  books: string[];
};

const author: Author & User = {
  firstName: "maria",
  age: 45,
  email: "maria@example.com",
  orders: [],
  books: ["TypeScript Basics", "Advanced TypeScript"],
};

// Interfaces
interface UserInterface {
  readonly firstName: string;
  email: string;
}

const emailUser: UserInterface = {
  firstName: "ana",
  email: "ana@example.com",
};

interface AuthorInterface {
  books: string[];
}

const NewAuthor: AuthorInterface & UserInterface = {
  firstName: "carlos",
  email: "carlos@example.com",
  books: ["Learning TypeScript"],
};

type Grade = number | string;
const grade: Grade = 1;
