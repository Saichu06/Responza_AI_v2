import { COLORS, FONTS } from "../../utils/constants";

const css = `
@keyframes spin  { to { transform: rotate(360deg); } }
@keyframes blink { 0%,100%{ opacity:.2; } 50%{ opacity:1; } }
`;

export default function Loader({ size = 32, label = "Loading...", inline = false }) {
  if (inline) {
    return (
      <>
        <style>{css}</style>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted }}>
          <span style={{ width: 10, height: 10, border: `1.5px solid ${COLORS.green}`, borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
          {label}
        </span>
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 40 }}>
      <style>{css}</style>
      <div style={{ width: size, height: size, border: `2px solid ${COLORS.border}`, borderTopColor: COLORS.green, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted, letterSpacing: 1 }}>{label}</span>
    </div>
  );
}