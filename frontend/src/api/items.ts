export type ItemGroup = 'Primary' | 'Secondary'

export interface Item {
  id: number
  name: string
  group: ItemGroup
  created_at: string
  updated_at: string
}

export interface ItemPayload {
  name: string
  group: ItemGroup
}

interface ApiErrorResponse {
  name?: string[]
  group?: string[]
  non_field_errors?: string[]
  detail?: string
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  'http://127.0.0.1:8000'
).replace(/\/$/, '')

const API_URL = `${API_BASE_URL}/items/`

function getApiErrorMessage(
  data: ApiErrorResponse,
  fallbackMessage: string,
) {
  return (
    data.non_field_errors?.[0] ??
    data.name?.[0] ??
    data.group?.[0] ??
    data.detail ??
    fallbackMessage
  )
}

// Read successful data or turn the API response into one useful error
async function readResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const data: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Item not found.')
    }

    if (data && typeof data === 'object') {
      throw new Error(
        getApiErrorMessage(
          data as ApiErrorResponse,
          fallbackMessage,
        ),
      )
    }

    throw new Error(fallbackMessage)
  }

  return data as T
}

export async function fetchItems(): Promise<Item[]> {
  const response = await fetch(API_URL)

  return readResponse<Item[]>(
    response,
    'Could not load items.',
  )
}

export async function createItem(
  payload: ItemPayload,
): Promise<Item> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return readResponse<Item>(
    response,
    'Could not create item.',
  )
}

export async function fetchItem(id: number): Promise<Item> {
  const response = await fetch(`${API_URL}${id}/`)

  return readResponse<Item>(
    response,
    'Could not load item details.',
  )
}

export async function updateItem(
  id: number,
  payload: ItemPayload,
): Promise<Item> {
  const response = await fetch(`${API_URL}${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return readResponse<Item>(
    response,
    'Could not update item.',
  )
}