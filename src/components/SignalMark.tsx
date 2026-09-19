export default function SignalMark() {
  return (
    <div className="signal-mark" aria-label="観測中" role="img">
      <span className="signal-ring signal-ring-one" />
      <span className="signal-ring signal-ring-two" />
      <span className="signal-core" />
      <span className="signal-cross signal-cross-x" />
      <span className="signal-cross signal-cross-y" />
    </div>
  )
}
