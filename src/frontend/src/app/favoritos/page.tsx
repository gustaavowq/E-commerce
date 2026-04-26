import { FavoritesView } from './FavoritesView'

export const metadata = { title: 'Favoritos' }
export const dynamic = 'force-dynamic'

export default function FavoritesPage() {
  return (
    <div className="container-app py-6 sm:py-10">
      <FavoritesView />
    </div>
  )
}
