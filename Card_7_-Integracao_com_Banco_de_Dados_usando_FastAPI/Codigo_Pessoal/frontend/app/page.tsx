import dynamic from "next/dynamic"

const HomeScreen = dynamic(() =>
  import("@/app/screens").then((mod) => mod.HomeScreen)
)

export default function Page() {
  return <HomeScreen />
}
