import { CitySearch } from "@/components/CitySearch";
import { FavoritesGrid } from "@/components/FavoritesGrid";
import { Screen } from "@/components/Screen";


export default function Home() {
  return (
    <Screen>
      <header className="pb-6 pt-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Погода</h1>
        <p className="mt-1 text-white/70">Найдите город, чтобы увидеть прогноз</p>
      </header>
      <CitySearch />
      <FavoritesGrid />
    </Screen>
  )
}