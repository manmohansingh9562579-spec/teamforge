import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <Image
        src="/logo.png"
        alt="TeamForge"
        width={size}
        height={size}
        className="rounded-md"
        priority
      />
      <span className="text-[15px] font-semibold tracking-tight text-text">
        Team<span className="text-accent">Forge</span>
      </span>
    </Link>
  );
}
