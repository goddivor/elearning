import { Outlet } from "react-router";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function RootLayout() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
