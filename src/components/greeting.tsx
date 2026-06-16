'use client'

export function Greeting() {
  const h = new Date().getHours()
  const text =
    h >= 5 && h < 12 ? 'Buenos días' :
    h >= 12 && h < 19 ? 'Buenas tardes' :
    'Buenas noches'

  return <h1 className="text-xl md:text-2xl font-bold text-foreground">{text} 👋</h1>
}
