import { useEffect, useState } from 'react'
import './App.css'

type ItemGroup = 'Primary' | 'Secondary'

interface Item {
  id: number
  name: string
  group: ItemGroup
  created_at: string
  updated_at: string
}

// Keep the backend address in one place so every API call uses the same URL
const API_URL = 'http://127.0.0.1:8000/items/'

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Load the current items when the page opens.
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
        setError(
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

  return (
    <main>
      <h1>Item Manager</h1>

      {isLoading && <p>Loading items...</p>}
      {error && <p>{error}</p>}

      {!isLoading && !error && (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} — {item.group}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App