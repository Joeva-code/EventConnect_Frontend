import Link from "next/link";

export function MobileBrand() {
  return (
    <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
        e
      </span>
      <span className="text-lg font-semibold text-slate-900">
        Event<span className="text-blue-600">Connect</span>
      </span>
    </Link>
  );
}
