/**
 * Слот для логотипа — сюда добавит второй фронтендер.
 * Пока пустой контейнер с фиксированной высотой.
 */
export function Logo() {
  return (
    <div className="flex h-9 items-center" aria-label="Bazar">
      {/* <img src="..." alt="Bazar" className="h-9 w-auto" /> */}
import logoImage from '@/assets/logo.png'

export function Logo() {
  return (
    <div className="flex h-12 items-center" aria-label="Bazar">
      <img src={logoImage} alt="Bazar" className="h-12 w-auto" />
    </div>
  )
}
