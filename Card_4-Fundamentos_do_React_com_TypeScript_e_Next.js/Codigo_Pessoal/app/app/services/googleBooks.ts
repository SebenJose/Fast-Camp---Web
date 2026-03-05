export async function fetchBookCover(
  title: string,
): Promise<string | undefined> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`,
    );

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json();
    const coverUrl = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;

    return coverUrl ? coverUrl.replace("http:", "https:") : undefined;
  } catch (error) {
    console.error("Erro ao buscar a capa do livro:", error);
    return undefined;
  }
}
