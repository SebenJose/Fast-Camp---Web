"use client"

import { useState } from "react"
import { INewsArticle } from "@/app/types"
import { NewsCarousel } from "./NewsCarousel"
import { NewsHeader } from "./NewsHeader"
import { X } from "lucide-react"
import { Button } from "@/app/components/ui"
import { cn } from "@/app/lib/utils"

interface NewsSectionProps {
  news: INewsArticle[]
}

export function NewsSection({ news }: NewsSectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedArticle = news.find((n) => n.id === selectedId)

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col gap-6 transition-all duration-500 ease-in-out md:flex-row">
      {/* Carousel Container */}
      <div
        className={cn(
          "h-full flex-col gap-6 transition-all duration-500 ease-in-out",
          selectedId ? "hidden md:flex md:w-1/3 xl:w-1/4" : "flex w-full"
        )}
      >
        <NewsHeader selectedId={selectedId} />
        <div className="min-h-0 flex-1">
          <NewsCarousel
            news={news}
            selectedId={selectedId}
            onSelect={setSelectedId}
            isVertical={!!selectedId}
          />
        </div>
      </div>

      {/* Selected Article Viewer */}
      {selectedArticle && (
        <div className="z-30 flex h-full w-full flex-1 animate-in flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm duration-500 fade-in slide-in-from-right-8">
          <div
            className="relative h-48 w-full shrink-0 bg-cover bg-center md:h-64"
            style={{ backgroundImage: `url(${selectedArticle.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full border-0 bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
              onClick={() => setSelectedId(null)}
            >
              <X size={18} />
            </Button>
            <div className="absolute right-4 bottom-4 left-4">
              <span className="mb-2 inline-block rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                Flash
              </span>
              <h2 className="text-xl font-bold text-white drop-shadow-md md:text-2xl">
                {selectedArticle.title}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-white/80 md:text-sm">
                <span>{selectedArticle.author}</span>
                <span>•</span>
                <span>{selectedArticle.date}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-card p-4 md:p-8">
            <div className="text-sm leading-loose text-muted-foreground md:text-base">
              {selectedArticle.content.split("\n").map((paragraph, idx) => (
                <p key={idx} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
