import logoImage from '@/assets/logo.png'

export function Logo() {
  return (
    <div className="flex h-12 items-center" aria-label="Bazar">
      <img src={logoImage} alt="Bazar" className="h-12 w-auto" />
    </div>
  )
}
