import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Sign up" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200/80 py-8 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-lg font-extrabold text-transparent">
              Match Aura
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Quality connections over endless swipes.</p>
          </div>

          <nav className="flex flex-wrap gap-3 text-sm">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-1 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">2026 Match Aura. Built for authentic conversations.</p>
      </div>
    </footer>
  );
}
