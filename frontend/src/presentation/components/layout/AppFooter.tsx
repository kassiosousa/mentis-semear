export function AppFooter() {
  return (
    <footer className="border-t border-border bg-surface px-6 py-5">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <img
          src="/assets/marca-sesi-azul.webp"
          alt="SESI"
          className="h-9 w-auto shrink-0 select-none"
        />

        <p className="text-xs text-muted-foreground">
          Mentis Semear · Programa de saúde mental no trabalho
        </p>
      </div>
    </footer>
  );
}
