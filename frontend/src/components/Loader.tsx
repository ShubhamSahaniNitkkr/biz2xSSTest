interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  overlay?: boolean;
  fullScreen?: boolean;
}

export default function Loader({ size = 'md', label, overlay, fullScreen }: LoaderProps) {
  const spinner = (
    <div className={`loader-wrap loader-${size}`} role="status" aria-live="polite">
      <div className="loader-spinner">
        <div className="loader-ring" />
        <div className="loader-ring loader-ring-2" />
      </div>
      {label && <p className="loader-label">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loader-fullscreen">{spinner}</div>;
  }

  if (overlay) {
    return <div className="loader-overlay">{spinner}</div>;
  }

  return spinner;
}
