// Iniciando as variaveis

// Utilizando o enum para definir os generos dos livros disponiveis na biblioteca
enum Genero {
  Ficcao = "Ficção",
  Tecnologia = "Tecnologia",
  Biografia = "Biografia",
  Romance = "Romance",
}

// Utilizando o union type para definir o tipo do ID (pode ser number ou string)
type ID = number | string;

// Interface para definir a estrutura dos Autores
interface Autor {
  nome: string;
  nacionalidade: string;
}

// Interface para definir a estrutura dos livros e dentro dela utilizando "?" para termor uma propriedade como opcional
interface Livro {
  id: ID;
  titulo: string;
  subtitulo?: string;
  autor: Autor;
  genero: Genero;
  disponivel: boolean;
}

// Um livro alugado e tudo que um Livro é mais a data que precisa devolver
type LivroAlugado = Livro & {
  dataDevolucao: Date;
  multaPorAtraso: number;
};

interface Usuario {
  id: ID;
  nome: string;
  email: string;
  livrosAlugados: LivroAlugado[]; // Usando array para termos uma lista dos livros alugados
}

// Atribuindo valores as variaveis

// Autores
const autor1: Autor = { nome: "Roberto Takamassa", nacionalidade: "Japones" };
const autor2: Autor = { nome: "Inacio Valencia", nacionalidade: "Brasileiro" };

// Biblioteca - Lista de Livros
const biblioteca: Livro[] = [
  {
    id: 1,
    titulo: "Clean Code",
    subtitulo: "Habilidades Práticas do Agile Software",
    autor: autor1,
    genero: Genero.Tecnologia,
    disponivel: true,
  },
  {
    id: "AB32I",
    titulo: "O Guarani",
    autor: autor2,
    genero: Genero.Ficcao,
    disponivel: true,
  },
  {
    id: 2,
    titulo: "Guerra do Peixe",
    autor: autor2,
    genero: Genero.Ficcao,
    disponivel: true,
  },
];

// Lista de Usuários
const usuarios: Usuario[] = [];

// Função para cadastrar um novo usuário
function cadastrarUsuario(nome: string, email: string): Usuario {
  const novoUsuario: Usuario = {
    id: usuarios.length + 1, // Gera um ID automático
    nome,
    email,
    livrosAlugados: [],
  };

  usuarios.push(novoUsuario);
  console.log(
    `Usuário cadastrado: ${novoUsuario.nome} (ID: ${novoUsuario.id})`,
  );
  return novoUsuario;
}

// Função para alugar livro
function alugarLivro(usuarioId: ID, livroId: ID): void {
  const usuario = usuarios.find((u) => u.id === usuarioId);
  const livro = biblioteca.find((l) => l.id === livroId);

  if (!usuario) {
    console.log(`Erro: Usuário com ID ${usuarioId} não encontrado.`);
    return;
  }

  if (!livro) {
    console.log(`Erro: Livro com ID ${livroId} não encontrado.`);
    return;
  }

  if (!livro.disponivel) {
    console.log(`Aviso: O livro "${livro.titulo}" já está alugado.`);
    return;
  }

  // Calculando a data de devolução data de hoje mais 7 dias
  const dataEntrega = new Date();
  dataEntrega.setDate(dataEntrega.getDate() + 7);

  // Juntando Livro mais dados do Aluguel
  const novoAluguel: LivroAlugado = {
    ...livro, // Copia tudo que tem no objeto livro
    dataDevolucao: dataEntrega,
    multaPorAtraso: 10.0,
  };

  // Atualizando os dados
  usuario.livrosAlugados.push(novoAluguel); // Adiciona na ficha do usuário
  livro.disponivel = false; // Marca como indisponível na biblioteca

  console.log(`Sucesso: "${livro.titulo}" alugado para ${usuario.nome}.`);
  console.log(`Devolver até: ${dataEntrega.toLocaleDateString("pt-BR")}`);
}

// Testes no Terminal

console.log("\nINICIANDO SISTEMA DE BIBLIOTECA\n");

// Criando Cadastro
const meuUsuario = cadastrarUsuario("José Seben", "jose.seben@email.com");

// Alugando um livro pelo ID Numérico (Clean Code)
console.log("\nTentativa 1: Alugar Clean Code");
alugarLivro(meuUsuario.id, 1);

// Alugando um livro pelo ID String O Guarani
console.log("\nTentativa 2: Alugar O Guarani");
alugarLivro(meuUsuario.id, "AB32I");

// Tentando alugar um livro que já foi alugado
console.log("\nTentativa 3: Alugar Clean Code novamente");
alugarLivro(meuUsuario.id, 1);

console.log("\nFICHA FINAL DO USUÁRIO:");
console.dir(meuUsuario, { depth: null });