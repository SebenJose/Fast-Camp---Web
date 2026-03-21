import { INewsArticle } from "@/app/types"

interface IBGENewsItem {
  id: number
  titulo: string
  introducao: string
  data_publicacao: string
  editorias: string
  imagens: string
  link: string
}

interface IBGEResponse {
  items: IBGENewsItem[]
}

const IBGE_BASE_IMAGE_URL = "https://agenciadenoticias.ibge.gov.br/"

export async function getIBGENews(limit = 5): Promise<INewsArticle[]> {
  try {
    // Artificial delay to test the Loading Skeletons (Uncomment to test)
    // await new Promise(resolve => setTimeout(resolve, 3000))

    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v3/noticias/?qtd=${limit}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour to prevent rate limiting
      }
    )

    if (!res.ok) {
      throw new Error(`Failed to fetch from IBGE API: ${res.status}`)
    }

    const data: IBGEResponse = await res.json()

    return data.items.map((item) => {
      let imageUrl = ""
      try {
        const imageMetadata = JSON.parse(item.imagens)
        if (imageMetadata.image_intro) {
          imageUrl = `${IBGE_BASE_IMAGE_URL}${imageMetadata.image_intro}`
        }
      } catch (e) {
        console.error("Failed to parse image metadata", e)
      }

      return {
        id: item.id.toString(),
        title: item.titulo,
        excerpt: item.introducao,
        content: `${item.introducao}\n\nPara ler a matéria completa (com todas as mídias e gráficos), acesse o portal de notícias do IBGE:\n${item.link}`,
        imageUrl:
          imageUrl ||
          "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
        date: item.data_publicacao.split(" ")[0],
        author: item.editorias
          ? `Agência IBGE • ${item.editorias.charAt(0).toUpperCase() + item.editorias.slice(1)}`
          : "Agência IBGE",
      }
    })
  } catch (error) {
    console.error("Error fetching IBGE news:", error)
    return []
  }
}
