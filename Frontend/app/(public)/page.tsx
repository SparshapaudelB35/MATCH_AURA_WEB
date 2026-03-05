import Link from "next/link";

export default function Home() {
  return (
    <div className="py-12 sm:py-16">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-pink-50/70 to-rose-100/60 p-8 shadow-xl sm:p-12 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-pink-300/30 to-rose-400/30 blur-3xl dark:from-pink-500/20 dark:to-rose-500/20" />

        <p className="inline-flex rounded-full border border-rose-300/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:border-rose-400/30 dark:bg-zinc-900/80 dark:text-rose-300">
          Match Aura Platform
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">
          Find meaningful matches without the endless swiping loop.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-zinc-300">
          Match Aura helps you discover people with aligned interests, values, and energy. Build better conversations from day one.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-pink-500 to-rose-500 px-4 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            Create account
          </Link>
          <Link
            href="/about"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Learn more
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-3">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Smarter discovery</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Curated profiles based on compatibility, not just appearance.</p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Real conversations</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Icebreakers and prompts designed to start thoughtful chats.</p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Safe by default</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Profile tools and moderation features to keep your experience secure.</p>
        </article>
      </section>

      <section className="mt-10 sm:mt-12">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">What members are saying</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Testimonials</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-rose-200/70 bg-gradient-to-b from-white to-rose-50/70 p-5 dark:border-rose-400/20 dark:from-zinc-900 dark:to-zinc-900">
            <p className="text-sm text-zinc-700 dark:text-zinc-200">&ldquo;I met people who actually matched my values. Conversations felt easy.&rdquo;</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Aisha, 27</p>
          </article>
          <article className="rounded-2xl border border-rose-200/70 bg-gradient-to-b from-white to-rose-50/70 p-5 dark:border-rose-400/20 dark:from-zinc-900 dark:to-zinc-900">
            <p className="text-sm text-zinc-700 dark:text-zinc-200">&ldquo;The prompts are good. It feels less random and way more human.&rdquo;</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Noah, 30</p>
          </article>
          <article className="rounded-2xl border border-rose-200/70 bg-gradient-to-b from-white to-rose-50/70 p-5 dark:border-rose-400/20 dark:from-zinc-900 dark:to-zinc-900">
            <p className="text-sm text-zinc-700 dark:text-zinc-200">&ldquo;Safe, clean, and focused. I spend less time swiping and more time connecting.&rdquo;</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Maya, 25</p>
          </article>
        </div>
      </section>
    </div>
  );
}
