import dynamic from "next/dynamic"

const DashboardScreen = dynamic(() =>
  import("@/app/screens").then((mod) => mod.DashboardScreen)
)

export default function DashboardPage() {
  return <DashboardScreen />
}
