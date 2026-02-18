export function Background() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-50 h-screen w-screen"
    >
      <div className="absolute top-0 left-0 h-full w-full bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#E6E6FA,transparent)]" />
      </div>
      <div
        className="fixed top-1/4 left-1/4 h-96 w-96 animate-blob-spin-slow rounded-full bg-primary/20 opacity-70 blur-3xl"
      />
      <div
        className="fixed bottom-1/4 right-1/4 h-96 w-96 animate-blob-spin-fast rounded-full bg-accent/60 opacity-70 blur-3xl"
      />
    </div>
  );
}
