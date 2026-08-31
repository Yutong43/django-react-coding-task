import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

type ItemGroup = 'Primary' | 'Secondary'

interface Item {
  id: number
  name: string
  group: ItemGroup
  created_at: string
  updated_at: string
}

interface ApiErrorResponse {
  name?: string[]
  group?: string[]
  non_field_errors?: string[]
}

// Keep API calls pointed at the same backend
const API_URL = 'http://127.0.0.1:8000/items/'

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [name, setName] = useState('')
  const [group, setGroup] = useState<ItemGroup>('Primary')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  // Load items when the page opens
  useEffect(() => {
    async function loadItems() {
      try {
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Could not load items.')
        }

        const data: Item[] = await response.json()
        setItems(data)
      } catch (caughtError) {
        setLoadError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not load items.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadItems()
  }, [])

  // Create an item and append the API response to the list
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setFormError('Name is required.')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          group,
        }),
      })

      const data: Item | ApiErrorResponse = await response.json()

      if (!response.ok) {
        const apiError = data as ApiErrorResponse

        throw new Error(
          apiError.non_field_errors?.[0] ??
            apiError.name?.[0] ??
            apiError.group?.[0] ??
            'Could not create item.',
        )
      }

      setItems((currentItems) => [...currentItems, data as Item])
      setName('')
    } catch (caughtError) {
      setFormError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not create item.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch a fresh copy for the detail panel
  async function handleSelectItem(id: number) {
    setIsDetailLoading(true)
    setDetailError('')

    try {
      const response = await fetch(`${API_URL}${id}/`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Item not found.')
        }

        throw new Error('Could not load item details.')
      }

      const data: Item = await response.json()
      setSelectedItem(data)
    } catch (caughtError) {
      setSelectedItem(null)
      setDetailError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not load item details.',
      )
    } finally {
      setIsDetailLoading(false)
    }
  }

  return (
    <main>
      <h1>Item Manager</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="item-name">Name</label>
        <input
          id="item-name"
          type="text"
          value={name}
          maxLength={100}
          required
          onChange={(event) => setName(event.target.value)}
        />

        <label htmlFor="item-group">Group</label>
        <select
          id="item-group"
          value={group}
          onChange={(event) => setGroup(event.target.value as ItemGroup)}
        >
          <option value="Primary">Primary</option>
          <option value="Secondary">Secondary</option>
        </select>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Item'}
        </button>
      </form>

      {formError && <p role="alert">{formError}</p>}
      {isLoading && <p>Loading items...</p>}
      {loadError && <p role="alert">{loadError}</p>}

      {!isLoading && !loadError && (
        <>
          {items.length === 0 ? (
            <p>No items yet.</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={selectedItem?.id === item.id}
                    onClick={() => void handleSelectItem(item.id)}
                  >
                    {item.name} — {item.group}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <section aria-labelledby="item-details-heading">
        <h2 id="item-details-heading">Item details</h2>

        {isDetailLoading && <p>Loading item details...</p>}
        {detailError && <p role="alert">{detailError}</p>}

        {!isDetailLoading && !detailError && !selectedItem && (
          <p>Select an item to review its details.</p>
        )}

        {!isDetailLoading && !detailError && selectedItem && (
          <dl>
            <div>
              <dt>ID</dt>
              <dd>{selectedItem.id}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{selectedItem.name}</dd>
            </div>
            <div>
              <dt>Group</dt>
              <dd>{selectedItem.group}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{new Date(selectedItem.created_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{new Date(selectedItem.updated_at).toLocaleString()}</dd>
            </div>
          </dl>
        )}
      </section>
    </main>
  )
}

export default App