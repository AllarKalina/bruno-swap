import SwapForm from "@/components/SwapForm";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center p-2 font-[family-name:var(--font-geist-sans)] sm:p-8">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <Card>
          <SwapForm />
        </Card>
      </main>
    </div>
  );
}
