import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App'

vi.mock('../components/TaskForm', () => ({
  default: ({ onSubmit }) => <form onSubmit={onSubmit}><button type="submit">Add Task</button></form>,
}))

vi.mock('../components/TaskList', () => ({
  default: ({ tasks }) => (
    <ul>
      {tasks.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  ),
}))

describe('App', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders Tasks heading', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
    render(<App />)
    expect(screen.getByRole('heading', { name: /tasks/i })).toBeInTheDocument()
  })

  test('fetches and displays tasks on mount', async () => {
    const tasks = [
      { id: 1, title: 'Test task', completed: false, createdAt: new Date().toISOString() },
    ]
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => tasks,
    })
    render(<App />)
    await waitFor(() => expect(screen.getByText('Test task')).toBeInTheDocument())
    expect(global.fetch).toHaveBeenCalledWith('/api/tasks')
  })

  test('shows error message when fetch fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
    })
    render(<App />)
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    )
  })
})
