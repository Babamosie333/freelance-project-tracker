function ProgressBar({ value, label, variant }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span style={{ fontWeight: 600 }}>{clamped}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div
          className={`progress-fill ${variant || ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
