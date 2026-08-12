import Image from "next/image";

type LogoProps = {
  href?: string;
  className?: string;
  showTagline?: boolean;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
};

export function Logo({
  href = "/",
  className = "",
  showTagline = false,
  iconOnly = false,
  size = "md",
}: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-16 w-auto",
  };

  return (
    <a href={href} className={`inline-flex flex-col ${className}`}>
      <span className="flex items-center gap-2">
        <Image
          src="/eventconnect-logo.svg"
          alt="EventConnect"
          width={340}
          height={100}
          className={`${sizeClasses[size]} shrink-0 ${iconOnly ? "" : "hidden sm:block"}`}
          style={{ width: "auto" }}
          priority
        />
        {!iconOnly && (
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Event<span className="text-blue-600">Connect</span>
          </span>
        )}
      </span>
      {showTagline && (
        <span className="text-[10px] font-medium tracking-[0.2em] text-slate-500 uppercase">
          Plan&nbsp;&nbsp;•&nbsp;&nbsp;Manage&nbsp;&nbsp;•&nbsp;&nbsp;Sell&nbsp;&nbsp;•&nbsp;&nbsp;Attend
        </span>
      )}
    </a>
  );
}
