import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import TaskItem from '../components/TaskItem'

describe('TaskItem', () => {
  const baseTask = { id: 1, title: 'Test task', completed: false }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders task title', () => {
    render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Test task')).toBeInTheDocument()
  })

  test('calls onToggle when checkbox is clicked', () => {
    const onToggle = vi.fn()
    render(<TaskItem task={baseTask} onToggle={onToggle} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith(baseTask.id)
  })

  test('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith(baseTask.id)
  })

  test('applies completed class when task.completed is true', () => {
    const completedTask = { ...baseTask, completed: true }
    const { container } = render(
      <TaskItem task={completedTask} onToggle={vi.fn()} onDelete={vi.fn()} />
    )
    expect(container.firstChild).toHaveClass('completed')
  })

  it('shows due date when task.dueDate is set', () => {
    const task = { id: 1, title: 'Task', completed: false, createdAt: new Date().toISOString(), dueDate: '2099-12-31T00:00:00.000Z' }
    render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/due:/i)).toBeInTheDocument()
  })

  it('does not show due date when task.dueDate is null', () => {
    const task = { id: 1, title: 'Task', completed: false, createdAt: new Date().toISOString(), dueDate: null }
    render(<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByText(/due:/i)).not.toBeInTheDocument()
  })
})
