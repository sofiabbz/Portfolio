import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Terminal } from './Terminal'

describe('Terminal', () => {
  it('comando desconhecido imprime erro', async () => {
    const user = userEvent.setup()
    render(<Terminal onOpenGallery={() => {}} />)
    await user.type(screen.getByLabelText('Comando do terminal'), 'xyz{Enter}')
    expect(screen.getByText(/comando não encontrado: xyz/i)).toBeInTheDocument()
  })

  it('clear limpa o histórico visível', async () => {
    const user = userEvent.setup()
    render(<Terminal onOpenGallery={() => {}} />)
    const log = screen.getByRole('log')
    expect(log.textContent).toMatch(/vamos trabalhar juntos/)
    await user.type(screen.getByLabelText('Comando do terminal'), 'clear{Enter}')
    expect(log.textContent).toBe('')
  })

  it('fotos abre a galeria', async () => {
    const user = userEvent.setup()
    const onOpenGallery = vi.fn()
    render(<Terminal onOpenGallery={onOpenGallery} />)
    await user.type(screen.getByLabelText('Comando do terminal'), 'fotos{Enter}')
    expect(onOpenGallery).toHaveBeenCalledTimes(1)
  })

  it('email: se o clipboard falhar, não diz copiado e oferece mailto', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('negado')) },
    })
    render(<Terminal onOpenGallery={() => {}} />)
    await user.type(screen.getByLabelText('Comando do terminal'), 'email{Enter}')
    expect(await screen.findByText(/não consegui copiar/i)).toBeInTheDocument()
    expect(screen.queryByText(/e-mail copiado/i)).toBeNull()
    expect(screen.getByRole('link', { name: /abrir e-mail/i })).toHaveAttribute('href', 'mailto:sofiabezlem@gmail.com')
  })

  it('chip clicável executa o comando sem digitar', async () => {
    const user = userEvent.setup()
    const onOpenGallery = vi.fn()
    render(<Terminal onOpenGallery={onOpenGallery} />)
    await user.click(screen.getByRole('button', { name: 'whoami' }))
    expect(screen.getByRole('log').textContent).toMatch(/Sofia Bezerra Belém/)
    await user.click(screen.getByRole('button', { name: 'fotos' }))
    expect(onOpenGallery).toHaveBeenCalledTimes(1)
  })

  it('sudo contratar liga o modo recrutador temporariamente', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Terminal onOpenGallery={() => {}} />)
    await user.type(screen.getByLabelText('Comando do terminal'), 'sudo contratar{Enter}')
    expect(document.documentElement.classList.contains('recruiter-mode')).toBe(true)
    vi.advanceTimersByTime(2500)
    expect(document.documentElement.classList.contains('recruiter-mode')).toBe(false)
    vi.useRealTimers()
  })

  it('setas navegam pelo histórico', async () => {
    const user = userEvent.setup()
    render(<Terminal onOpenGallery={() => {}} />)
    const input = screen.getByLabelText<HTMLInputElement>('Comando do terminal')
    await user.type(input, 'whoami{Enter}')
    await user.type(input, 'skills{Enter}')
    await user.keyboard('{ArrowUp}')
    expect(input.value).toBe('skills')
    await user.keyboard('{ArrowUp}')
    expect(input.value).toBe('whoami')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(input.value).toBe('')
  })
})
