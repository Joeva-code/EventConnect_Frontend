import Image from "next/image";
import { ArrowRight } from "./icons";
import { CATEGORY_IMAGES } from "@/lib/images";

const categories = Object.entries(CATEGORY_IMAGES).map(([name]) => ({
  name,
  count: "View vendors",
  image: CATEGORY_IMAGES[name][0],
}));

export function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-6 py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-950">
            Every Vendor Your Event Needs
          </h2>
          <p className="mt-3 max-w-xl text-lg text-slate-500">
            Browse by category and connect with specialists who bring your
            vision to life.
          </p>
        </div>
        <a
          href="/signin"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View All Categories
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <a
            key={category.name}
            href="#categories"
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 text-white">
              <p className="text-lg font-semibold">{category.name}</p>
              <p className="text-sm text-white/80">{category.count}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
