export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface RequestOptions extends RequestInit {
  params?: Record<string, string>
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options

  let url = `${API_URL}${endpoint}`
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
      errorMessage = await response.text() || errorMessage
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
