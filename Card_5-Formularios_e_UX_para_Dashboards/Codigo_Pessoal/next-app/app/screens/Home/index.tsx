import { Suspense } from "react"
import { Sidebar, NewsSection } from "@/app/components"
import { NewsSkeleton } from "@/app/components/News"
import { getIBGENews } from "@/app/services/api/news"

async function NewsFeedLoader() {
  const news = await getIBGENews(5)
  return <NewsSection news={news} />
}

export default function HomeScreen() {
  return (
    <div className="flex bg-secondary w-full h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex flex-col flex-1 h-full overflow-auto p-6 md:p-10 transition-all">
        {/* Mobile Header Spacing */}
        <div className="md:hidden shrink-0 h-16" />

        <div className="flex flex-col flex-1 mx-auto w-full max-w-7xl h-full min-h-0">
          <Suspense fallback={<NewsSkeleton />}>
            <NewsFeedLoader />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
