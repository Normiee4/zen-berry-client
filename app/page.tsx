

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-(--color-background)">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-(--color-accent-dark)">
          Zen Berry 🍓
        </h1>
        <p className="mt-2 text-(--color-accent)">
          Focus on what truly matters.
        </p>

        <div className="mt-6 flex gap-4 justify-center">
          <a href="/login" className="px-4 py-2 bg-(--color-primary) rounded">
            Login
          </a>
          <a href="/register" className="px-4 py-2 border rounded">
            Get Started
          </a>
        </div>
      </div>
    </main>
  );
}