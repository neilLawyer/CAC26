import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center gap-8 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">OpenDoor</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          A free tool that helps you find public benefit programs you may qualify for — food,
          health, energy, cash, and more. Plain language. A few simple questions. No guesswork.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-sm text-left space-y-2 bg-gray-50 dark:bg-gray-900/40">
        <p className="font-semibold">Before you start, know this:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
          <li>No account, no login. Your answers stay in your browser — nothing is stored on a server.</li>
          <li>
            This is informational only — not a government site. Every result says &ldquo;you may
            qualify&rdquo; and links to the real agency to confirm.
          </li>
          <li>Not financial, tax, or legal advice.</li>
        </ul>
      </div>

      <Link
        href="/intake"
        className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 transition-colors"
      >
        Get started
      </Link>

      <Link href="/cliff-simulator" className="text-sm text-blue-600 hover:underline">
        Or jump straight to the benefits-cliff simulator →
      </Link>
    </main>
  );
}
