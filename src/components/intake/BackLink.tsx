// The "← Back" link shared by the intake steps.
type BackLinkProps = { onClick: () => void };

export function BackLink({ onClick }: BackLinkProps) {
  return (
    <button onClick={onClick} className="text-sm text-muted hover:text-accent transition-colors">
      ← Back
    </button>
  );
}
