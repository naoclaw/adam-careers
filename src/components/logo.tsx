import Link from "next/link";

type Variant = "dark" | "light" | "mono";
type Size = "sm" | "md" | "lg";

const sizeMap: Record<Size, { mark: string; text: string; gap: string }> = {
  sm: { mark: "w-7 h-7", text: "text-base", gap: "gap-2" },
  md: { mark: "w-9 h-9", text: "text-xl", gap: "gap-2.5" },
  lg: { mark: "w-12 h-12", text: "text-2xl", gap: "gap-3" },
};

const textColor: Record<Variant, string> = {
  dark: "text-gray-900",
  light: "text-white",
  mono: "text-current",
};

const subColor: Record<Variant, string> = {
  dark: "text-blue-600",
  light: "text-blue-300",
  mono: "text-current opacity-60",
};

export function LogoMark({
  size = "md",
  className = "",
}: {
  size?: Size;
  className?: string;
}) {
  const dim = sizeMap[size].mark;
  return (
    <span
      className={`${dim} ${className} relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/20`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-[60%] w-[60%] text-white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      >
        <path d="M4 20 L12 4 L20 20" />
        <path d="M7.5 14 L16.5 14" />
      </svg>
    </span>
  );
}

export function Logo({
  variant = "dark",
  size = "md",
  href = "/",
  withTag = false,
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  href?: string | null;
  withTag?: boolean;
  className?: string;
}) {
  const s = sizeMap[size];
  const inner = (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark size={size} />
      <span className="flex flex-col leading-none">
        <span
          className={`${s.text} font-extrabold tracking-tight ${textColor[variant]}`}
          style={{ letterSpacing: "-0.02em" }}
        >
          adam<span className={subColor[variant]}>.</span>
        </span>
        {withTag && (
          <span
            className={`mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] ${subColor[variant]}`}
          >
            Careers
          </span>
        )}
      </span>
    </span>
  );

  if (href === null) return inner;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Adam Careers">
      {inner}
    </Link>
  );
}
