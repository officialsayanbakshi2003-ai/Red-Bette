import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { NotFoundView } from "@/components/NotFoundView";

export default function NotFound() {
  return (
    <>
      <header className="border-b border-line">
        <div className="container-x flex h-16 items-center justify-center">
          <Link href="/" className="text-[22px]" aria-label="Red Betta home">
            <Logo />
          </Link>
        </div>
      </header>
      <main>
        <NotFoundView />
      </main>
    </>
  );
}
