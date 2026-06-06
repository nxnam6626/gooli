import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="w-full flex-1 flex flex-col">
        <Header />
        {children}
      </div>
      <Footer />
    </div>
  );
}
