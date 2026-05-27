const API_URL_BY_RUNTIME = {
  browser: process.env.NEXT_PUBLIC_API_URL,
  server: process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL,
}

function getApiUrl(): string {
  const runtime = typeof window === "undefined" ? "server" : "browser"
  const apiUrl = API_URL_BY_RUNTIME[runtime]

  if (!apiUrl) {
    throw new Error(
      runtime === "server"
        ? "API_INTERNAL_URL ou NEXT_PUBLIC_API_URL precisa ser configurada"
        : "NEXT_PUBLIC_API_URL precisa ser configurada"
    )
  }

  return apiUrl
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options

  let url = `${getApiUrl()}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    let errorMessage = "Erro na requisição"
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorMessage
    } catch {
      errorMessage = (await response.text()) || errorMessage
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
