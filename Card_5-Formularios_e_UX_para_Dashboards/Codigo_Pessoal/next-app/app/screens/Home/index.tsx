import { Suspense } from "react"
import { NewsSection } from "@/app/components"
import { NewsSkeleton } from "@/app/components/News"
import { getIBGENews } from "@/app/services/api/news"

async function NewsFeedLoader() {
  const news = await getIBGENews(5)
  return <NewsSection news={news} />
}

export default function HomeScreen() {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-1 flex-col">
      <Suspense fallback={<NewsSkeleton />}>
        <NewsFeedLoader />
      </Suspense>
    </div>
  )
}
