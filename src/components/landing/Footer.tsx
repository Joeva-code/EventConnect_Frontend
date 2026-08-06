import Link from "next/link";
import { Globe, At, Message, Mail } from "./icons";

const footerColumns = [
  {
    title: "For Planners",
    links: [
      { label: "Find Vendors", href: "#" },
      { label: "Browse Categories", href: "#" },
      { label: "How It Works", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Reviews", href: "#" },
    ],
  },
  {
    title: "For Vendors",
    links: [
      { label: "Become a Vendor", href: "#" },
      { label: "Vendor Login", href: "/signin" },
      { label: "Success Stories", href: "#" },
      { label: "Resources", href: "#" },
      { label: "Help Center", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
];

const socials = [Globe, At, Message, Mail];

export function Footer() {
  return (
    <footer className="bg-blue-600 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-white" />
              <span className="text-lg font-semibold">
                Event<span className="font-normal">Connect</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-blue-100">
              The trusted marketplace connecting planners with vendors for
              unforgettable events.
            </p>
            <div className="mt-5 flex gap-3">
              {socials.map((Icon, i) => (
                <span
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="font-semibold">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="text-blue-100 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-blue-100 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-blue-500/50 pt-8 text-sm text-blue-100 sm:flex-row sm:items-center">
          <p>&copy; 2026 EventConnect. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
