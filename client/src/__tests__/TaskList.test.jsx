import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import TaskList from '../components/TaskList'

vi.mock('../components/TaskItem', () => ({
  default: ({ task }) => <div>{task.title}</div>,
}))

describe('TaskList', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("renders 'No tasks yet.' when tasks is empty", () => {
    render(<TaskList tasks={[]} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('No tasks yet.')).toBeInTheDocument()
  })

  test('renders one TaskItem per task', () => {
    const tasks = [
      { id: 1, title: 'First task', completed: false },
      { id: 2, title: 'Second task', completed: false },
    ]
    render(<TaskList tasks={tasks} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('First task')).toBeInTheDocument()
    expect(screen.getByText('Second task')).toBeInTheDocument()
  })
})
