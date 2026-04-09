import { COLORS, FONTS } from "../../utils/constants";

export default function Card({ children, style = {}, onClick, hover = false }) {
  const base = {
    background:   COLORS.surface,
    border:       `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding:      20,
    fontFamily:   FONTS.sans,
    transition:   "all .2s",
    ...style,
  };

  return (
    <div
      style={base}
      onClick={onClick}
      onMouseEnter={hover ? (e) => { e.currentTarget.style.borderColor = COLORS.blue; e.currentTarget.style.transform = "translateY(-2px)"; } : undefined}
      onMouseLeave={hover ? (e) => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = "translateY(0)"; } : undefined}
    >
      {children}
    </div>
  );
}