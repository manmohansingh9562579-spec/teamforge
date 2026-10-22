import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = { sm: 28, md: 36, lg: 48, xl: 72, xxl: 96 };

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const px = sizes[size];
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const avatarSrc = src?.startsWith("/api/profile/avatar/") ? src : null;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-soft font-medium text-accent",
        className
      )}
      style={{ width: px, height: px, fontSize: px * 0.38 }}
    >
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt={name}
          fill
          sizes={`${px}px`}
          className="object-cover"
          unoptimized
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
