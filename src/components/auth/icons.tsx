type IconProps = { className?: string };

export function Mail({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function Lock({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  );
}

export function Eye({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOff({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.94 17.94A10.94 10.94 0 0112 19.5C5 19.5 1.5 12 1.5 12a20.3 20.3 0 015.06-5.94M9.9 4.24A10.94 10.94 0 0112 4.5c7 0 10.5 7.5 10.5 7.5a20.32 20.32 0 01-3.15 4.36M14.12 14.12a3 3 0 11-4.24-4.24" />
      <path d="M1.5 1.5l21 21" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" />
    </svg>
  );
}

export function Briefcase({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

export function ArrowLeft({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  );
}

export function Google({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.07-1.48-.22-2.13H12v3.87h6.6c-.13 1.1-.86 2.76-2.47 3.87l-.02.15 3.59 2.78.25.02c2.28-2.1 3.57-5.2 3.57-8.56"
      />
      <path
        fill="#34A853"
        d="M12 23.5c3.24 0 5.96-1.06 7.95-2.87l-3.79-2.94c-1.02.71-2.4 1.2-4.16 1.2-3.18 0-5.88-2.1-6.84-5H1.25l-.03.16A11.5 11.5 0 0012 23.5"
      />
      <path
        fill="#FBBC05"
        d="M5.16 13.89A6.9 6.9 0 014.77 12c0-.66.11-1.3.37-1.89l-.01-.16-3.83-2.98-.13.06A11.5 11.5 0 000.5 12c0 1.85.44 3.6 1.23 5.14l3.43-3.25"
      />
      <path
        fill="#EB4335"
        d="M12 4.75c2.25 0 3.77.97 4.64 1.78l3.38-3.3C17.94 1.24 15.24 0 12 0 7.31 0 3.26 2.69 1.25 6.83l3.9 3.02c.97-2.9 3.67-5.1 6.85-5.1"
      />
    </svg>
  );
}
