import dynamic from "next/dynamic"

const FormsScreen = dynamic(() =>
  import("@/app/screens").then((mod) => mod.FormsScreen)
)

export default function FormsPage() {
  return <FormsScreen />
}
