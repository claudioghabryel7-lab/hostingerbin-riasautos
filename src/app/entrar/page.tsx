import { Suspense } from "react";
import EntrarClient from "./EntrarClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[var(--rice-dim)]">
          Carregando...
        </div>
      }
    >
      <EntrarClient />
    </Suspense>
  );
}
