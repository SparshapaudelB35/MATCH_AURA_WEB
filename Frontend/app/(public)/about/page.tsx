export default function Page() {
  return (
    <div className="py-12 sm:py-16">
      <section className="max-w-3xl rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-pink-50/60 to-rose-100/60 p-8 shadow-xl dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-300">About Match Aura</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">A better way to connect online.</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600 sm:text-base dark:text-zinc-300">
          Match Aura is built for people who want quality connections, not endless distractions. We focus on compatibility and clarity so
          conversations feel natural from the start.
        </p>
      </section>

      <section className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Our mission</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Help people build authentic relationships by matching on values, intent, and communication style.
          </p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Our approach</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            We combine thoughtful profile design, transparent controls, and a clean experience across devices.
          </p>
        </article>
      </section>

      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">What you can expect</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <li>Profiles that emphasize personality and goals.</li>
          <li>Clear tools to manage preferences and visibility.</li>
          <li>A respectful, safety-first community standard.</li>
        </ul>
      </section>

      <section className="mt-10 sm:mt-12">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Community voice</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Testimonials</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-rose-200/70 bg-gradient-to-b from-white to-rose-50/70 p-5 dark:border-rose-400/20 dark:from-zinc-900 dark:to-zinc-900">
            <p className="text-sm text-zinc-700 dark:text-zinc-200">
              &ldquo;I liked that people were clear about intentions. It saved time and felt respectful.&rdquo;
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Ria, 29</p>
          </article>
          <article className="rounded-2xl border border-rose-200/70 bg-gradient-to-b from-white to-rose-50/70 p-5 dark:border-rose-400/20 dark:from-zinc-900 dark:to-zinc-900">
            <p className="text-sm text-zinc-700 dark:text-zinc-200">
              &ldquo;The app design is simple but thoughtful. I knew what to do from day one.&rdquo;
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">Daniel, 31</p>
          </article>
        </div>
      </section>
    </div>
  );
}
