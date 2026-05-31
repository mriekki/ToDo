import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TaskForm from '../components/TaskForm'

describe('TaskForm', () => {
  let onSubmit

  beforeEach(() => {
    onSubmit = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders title input and submit button', () => {
    render(<TaskForm onSubmit={onSubmit} />)
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
  })

  test('calls onSubmit with title when form is submitted', () => {
    render(<TaskForm onSubmit={onSubmit} />)
    fireEvent.change(screen.getByRole('textbox', { name: /title/i }), {
      target: { value: 'My Task' },
    })
    fireEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(onSubmit).toHaveBeenCalledWith('My Task', expect.any(String))
  })

  test('shows error when submitted with empty title', () => {
    render(<TaskForm onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  test('does not call onSubmit when title is empty', () => {
    render(<TaskForm onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test('clears inputs after successful submit', () => {
    render(<TaskForm onSubmit={onSubmit} />)
    const titleInput = screen.getByRole('textbox', { name: /title/i })
    fireEvent.change(titleInput, { target: { value: 'My Task' } })
    fireEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(titleInput.value).toBe('')
  })

  it('calls onSubmit with dueDate when date is entered', async () => {
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} />)
    await userEvent.type(screen.getByPlaceholderText(/task title/i), 'My task')
    // The date input has aria-label "Due date"
    const dateInput = screen.getByLabelText(/due date/i)
    await userEvent.type(dateInput, '2026-12-31')
    fireEvent.submit(screen.getByRole('button', { name: /add task/i }).closest('form'))
    expect(onSubmit).toHaveBeenCalledWith('My task', '', expect.stringContaining('2026'))
  })
})
