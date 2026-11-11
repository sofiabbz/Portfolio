import { describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { BootScreen } from './BootScreen'
import { SmoothScroll, useSmoothScroll } from './SmoothScroll'

const overflow = () => document.documentElement.style.overflow

describe('trava de scroll', () => {
  it('a boot screen libera o scroll assim que some (bug do touch no celular)', async () => {
    const user = userEvent.setup()
    render(
      <SmoothScroll>
        <BootScreen onDone={() => {}} />
      </SmoothScroll>,
    )
    expect(overflow()).toBe('hidden')
    await user.click(screen.getByRole('status'))
    expect(overflow()).toBe('')
  })

  it('travas simultâneas: o scroll só volta quando todas liberam', () => {
    const holder: { api?: ReturnType<typeof useSmoothScroll> } = {}
    function Probe() {
      const ctx = useSmoothScroll()
      useEffect(() => {
        holder.api = ctx
      }, [ctx])
      return null
    }
    render(
      <SmoothScroll>
        <Probe />
      </SmoothScroll>,
    )
    if (!holder.api) throw new Error('contexto não montou')
    const { stop, start } = holder.api
    act(() => {
      stop() // ex.: palette
      stop() // ex.: galeria
    })
    expect(overflow()).toBe('hidden')
    act(() => start())
    expect(overflow()).toBe('hidden')
    act(() => start())
    expect(overflow()).toBe('')
  })
})
