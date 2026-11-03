import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { PublicSite } from './PublicSite'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function openDownload(userAgent: string, width: number) {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(width)
  const nothing = () => {}
  render(<PublicSite view="descargar" isAuthenticated={false} onNavigate={nothing} onAccount={nothing} onBuy={nothing} />)
}

test('ofrece una APK descargable al visitar desde un teléfono Android', () => {
  openDownload('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36', 390)
  const link = screen.getByRole('link', { name: 'Descargar APK para Android' })
  expect(link.getAttribute('href')).toBe('/downloads/emergen.apk')
  expect(link.getAttribute('download')).toBe('EMERGEN.apk')
})

test.each([
  ['computador con ventana pequeña', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36', 390],
  ['tablet Android', 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 Chrome/131.0 Safari/537.36', 820],
])('no muestra la descarga en un %s', (_device, userAgent, width) => {
  openDownload(userAgent, width)
  expect(screen.queryByRole('link', { name: 'Descargar APK para Android' })).toBeNull()
  expect(screen.getByText('Abre esta página desde tu teléfono Android para descargar la app.')).toBeTruthy()
})

test('mantiene el aviso de iOS en iPhone sin ofrecer una APK incompatible', () => {
  openDownload('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1', 390)
  expect(screen.queryByRole('link', { name: 'Descargar APK para Android' })).toBeNull()
  expect(screen.getByText('Próximamente en iOS.')).toBeTruthy()
})
