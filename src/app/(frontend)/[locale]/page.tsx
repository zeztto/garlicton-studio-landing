export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">GARLICTON STUDIO</h1>
    </div>
  )
}

export function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'en' }]
}
