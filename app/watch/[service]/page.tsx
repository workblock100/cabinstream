import { SERVICES } from "@/lib/services";
import { WatchScreen } from "@/components/WatchScreen";

// Pre-render every known service route — required for static export, harmless on Vercel.
export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.id }));
}

export const dynamicParams = false;

export default function WatchPage() {
  return <WatchScreen />;
}
