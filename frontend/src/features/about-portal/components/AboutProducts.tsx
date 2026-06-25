import Image from "next/image";
import { featuredProducts } from "./data";

export default function AboutProducts() {
  return (
    <section className="bg-[#FAFAFA] border-t border-neutral-200/60" style={{ padding: "clamp(40px, 5vw, 64px) 0" }}>
      <div className="container-gooli">
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-neutral-900 uppercase tracking-widest text-center"
          style={{ marginBottom: "48px" }}
        >
          SẢN PHẨM NỔI BẬT
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto" style={{ gap: "32px" }}>
          {featuredProducts.map((product) => (
            <div key={product.title} className="flex flex-col border border-neutral-200 bg-white group rounded-lg overflow-hidden">
              <div className="relative h-56 w-full overflow-hidden bg-neutral-100">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="flex-1 flex flex-col" style={{ padding: "24px" }}>
                <h3
                  className="font-bold text-neutral-900 tracking-tight text-base group-hover:text-[#B06518] transition-colors duration-200"
                  style={{ marginBottom: "8px" }}
                >
                  {product.title}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-light">
                  {product.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
