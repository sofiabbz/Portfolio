import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandPalette, filterActions, type PaletteAction } from './CommandPalette'
import { SmoothScroll } from './SmoothScroll'
import { ThemeProvider } from './ThemeProvider'

const sample: PaletteAction[] = [
  { id: 'a', label: 'Ir para Experiência', hint: '#experiencia', keywords: '', icon: 'go', run: () => {} },
  { id: 'b', label: 'Abrir GitHub', hint: 'github.com', keywords: 'codigo', icon: 'link', run: () => {} },
]

describe('filterActions', () => {
  it('ignora acentos e maiúsculas', () => {
    expect(filterActions(sample, 'EXPERIENCIA').map((a) => a.id)).toEqual(['a'])
    expect(filterActions(sample, 'código').map((a) => a.id)).toEqual(['b'])
  })

  it('busca vazia devolve tudo', () => {
    expect(filterActions(sample, '')).toHaveLength(2)
  })
})

function renderPalette(open = true, onClose = vi.fn()) {
  render(
    <ThemeProvider>
      <SmoothScroll>
        <CommandPalette open={open} onClose={onClose} />
      </SmoothScroll>
    </ThemeProvider>,
  )
  return { onClose }
}

describe('CommandPalette', () => {
  it('não renderiza nada fechada', () => {
    renderPalette(false)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('filtra e mostra estado vazio', async () => {
    const user = userEvent.setup()
    renderPalette()
    const input = screen.getByRole('combobox')
    await user.type(input, 'zzzz')
    expect(screen.getByText(/nenhum resultado/i)).toBeInTheDocument()
  })

  it('setas movem a seleção com volta na lista e Esc fecha', async () => {
    const user = userEvent.setup()
    const { onClose } = renderPalette()
    const list = screen.getByRole('listbox')
    const options = within(list).getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowUp}')
    expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowDown}')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('Enter executa a ação selecionada e fecha', async () => {
    const user = userEvent.setup()
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { onClose } = renderPalette()
    await user.type(screen.getByRole('combobox'), 'github')
    await user.keyboard('{Enter}')
    expect(onClose).toHaveBeenCalled()
    await new Promise((r) => requestAnimationFrame(r))
    expect(openSpy).toHaveBeenCalledWith('https://github.com/sofiabbz', '_blank', 'noopener,noreferrer')
    openSpy.mockRestore()
  })
})
