import { useEffect, useState, type FormEvent } from 'react'

import {
  createItem,
  fetchItem,
  fetchItems,
  updateItem,
  type Item,
  type ItemGroup,
} from './api/items'
import './App.css'

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

  const [editName, setEditName] = useState('')
  const [editGroup, setEditGroup] = useState<ItemGroup>('Primary')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')

  // Load items when the page opens
  useEffect(() => {
    async function loadItems() {
      try {
        const data = await fetchItems()
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
      const createdItem = await createItem({
        name: trimmedName,
        group,
      })

      setItems((currentItems) => [...currentItems, createdItem])
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
    setUpdateError('')
    setUpdateMessage('')

    try {
      const data = await fetchItem(id)

      setSelectedItem(data)
      setEditName(data.name)
      setEditGroup(data.group)
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

  // Update the selected item and keep the list in sync
  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedItem) {
      return
    }

    const trimmedName = editName.trim()

    if (!trimmedName) {
      setUpdateError('Name is required.')
      return
    }

    setIsUpdating(true)
    setUpdateError('')
    setUpdateMessage('')

    try {
      const updatedItem = await updateItem(selectedItem.id, {
        name: trimmedName,
        group: editGroup,
      })

      setSelectedItem(updatedItem)
      setEditName(updatedItem.name)
      setEditGroup(updatedItem.group)
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        ),
      )
      setUpdateMessage('Item updated.')
    } catch (caughtError) {
      setUpdateError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not update item.',
      )
    } finally {
      setIsUpdating(false)
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
          onChange={(event) =>
            setGroup(event.target.value as ItemGroup)
          }
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
          <>
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
                <dd>
                  {new Date(
                    selectedItem.created_at,
                  ).toLocaleString()}
                </dd>
              </div>

              <div>
                <dt>Last updated</dt>
                <dd>
                  {new Date(
                    selectedItem.updated_at,
                  ).toLocaleString()}
                </dd>
              </div>
            </dl>

            <h3>Update item</h3>

            <form onSubmit={handleUpdate}>
              <label htmlFor="edit-item-name">Name</label>
              <input
                id="edit-item-name"
                type="text"
                value={editName}
                maxLength={100}
                required
                onChange={(event) =>
                  setEditName(event.target.value)
                }
              />

              <label htmlFor="edit-item-group">Group</label>
              <select
                id="edit-item-group"
                value={editGroup}
                onChange={(event) =>
                  setEditGroup(
                    event.target.value as ItemGroup,
                  )
                }
              >
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
              </select>

              <button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Item'}
              </button>
            </form>

            {updateError && <p role="alert">{updateError}</p>}

            {updateMessage && (
              <p role="status">{updateMessage}</p>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default App