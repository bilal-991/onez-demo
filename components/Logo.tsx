export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      <svg viewBox="0 0 60 30" width={size * 1.7} height={size * 0.85} aria-hidden>
        <path d="M2 22c10 4 24-2 40-14 6-4 12-6 16-6-4 6-14 20-30 24C18 29 8 28 2 22z" fill="var(--red)" />
        <path d="M10 20c8-1 18-6 30-14" stroke="var(--cream)" strokeWidth="1.6" fill="none" opacity=".7" />
      </svg>
      <b>ONEZ</b>
    </span>
  );
}
