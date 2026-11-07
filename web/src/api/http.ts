export type ProblemDetails = {
  title?: string
  status?: number
  detail?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  status: number
  problem: ProblemDetails

  constructor(status: number, problem: ProblemDetails) {
    super(problem.detail ?? problem.title ?? `HTTP error ${status}`)
    this.status = status
    this.problem = problem
  }
}

/** Calls the API, throws an ApiError on a non-2xx status, handles empty responses. */
export async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const isJson = response.headers.get('content-type')?.includes('json')
    throw new ApiError(response.status, isJson ? await response.json() : {})
  }

  // Some responses have no body (204 No Content, or an empty 200 like /register):
  // read the text and only parse it when it is not empty.
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}