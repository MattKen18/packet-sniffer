import Sniffer from "@/components/Sniffer";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] h-screen">
      <main className="w-full h-full flex items-center justify-center">
        <div className="w-fit h-[500px]">
          <Sniffer />
        </div>
      </main>
    </div>
  );
}
