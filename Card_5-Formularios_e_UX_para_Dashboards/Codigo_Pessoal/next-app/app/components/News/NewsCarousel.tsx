import { INewsArticle } from "@/app/types"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel"
import { Card, CardContent } from "@/app/components/ui/card"
import { cn } from "@/app/lib/utils"

interface NewsCarouselProps {
  news: INewsArticle[]
  selectedId: string | null
  onSelect: (id: string, index: number) => void
  isVertical: boolean
}

export function NewsCarousel({
  news,
  selectedId,
  onSelect,
  isVertical,
}: NewsCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        axis: isVertical ? "y" : "x",
      }}
      orientation={isVertical ? "vertical" : "horizontal"}
      className="h-full w-full"
    >
      <CarouselContent className={cn(isVertical ? "h-[600px]" : "")}>
        {news.map((item, index) => (
          <CarouselItem
            key={item.id}
            className={cn(
              isVertical ? "basis-1/3 pt-4" : "pl-4 md:basis-1/2 lg:basis-1/3"
            )}
          >
            <div className="h-full p-1">
              <Card
                className={cn(
                  "group flex h-full cursor-pointer flex-col overflow-hidden transition-all hover:border-primary/50",
                  selectedId === item.id
                    ? "border-primary shadow-md ring-1 ring-primary"
                    : ""
                )}
                onClick={() => onSelect(item.id, index)}
              >
                <div
                  className={cn(
                    "w-full bg-cover bg-center transition-all duration-300 group-hover:scale-105",
                    isVertical ? "h-24" : "h-40"
                  )}
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />
                <CardContent className="z-10 flex flex-1 flex-col justify-between bg-card p-4">
                  <div>
                    <h3 className="line-clamp-2 text-base font-bold md:text-lg">
                      {item.title}
                    </h3>
                    {!isVertical && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                  <span className="mt-4 text-xs font-medium text-muted-foreground">
                    {item.date}
                  </span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className={cn("animate-in fade-in-0")}>
        <CarouselPrevious
          className={cn(
            "z-20 bg-background/80 backdrop-blur-sm hover:bg-background/90",
            isVertical ? "top-4 left-1/2 -translate-x-1/2 rotate-90" : "left-4"
          )}
        />
        <CarouselNext
          className={cn(
            "z-20 bg-background/80 backdrop-blur-sm hover:bg-background/90",
            isVertical
              ? "bottom-4 left-1/2 -translate-x-1/2 rotate-90"
              : "right-4"
          )}
        />
      </div>
    </Carousel>
  )
}
