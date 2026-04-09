import { COLORS, FONTS } from "../../utils/constants";

export default function Button({
  children, onClick, variant = "ghost",
  size = "md", style = {}, disabled = false,
}) {
  const sizes = { sm: "6px 14px", md: "8px 18px", lg: "12px 28px" };
  const fsize = { sm: 11, md: 13, lg: 14 };

  const variants = {
    primary: { background: COLORS.green,  color: "#000",        border: "none" },
    ghost:   { background: "transparent", color: COLORS.text,   border: `1px solid ${COLORS.border}` },
    danger:  { background: "transparent", color: COLORS.red,    border: `1px solid ${COLORS.red}` },
    mono:    { background: "transparent", color: COLORS.muted,  border: `1px solid ${COLORS.border}`, fontFamily: FONTS.mono, fontSize: 11, letterSpacing: ".5px" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        padding:      sizes[size],
        fontSize:     fsize[size],
        fontWeight:   variant === "primary" ? 700 : 500,
        borderRadius: 8,
        fontFamily:   FONTS.sans,
        cursor:       disabled ? "not-allowed" : "pointer",
        opacity:      disabled ? .5 : 1,
        transition:   "all .18s",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "ghost")   { e.currentTarget.style.borderColor = COLORS.green; e.currentTarget.style.color = COLORS.green; }
        if (variant === "primary") { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = `0 0 20px rgba(0,255,136,.25)`; }
        if (variant === "mono")    { e.currentTarget.style.borderColor = COLORS.blue; e.currentTarget.style.color = COLORS.blue; }
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (variant === "ghost")   { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.text; }
        if (variant === "primary") { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }
        if (variant === "mono")    { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.muted; }
      }}
    >
      {children}
    </button>
  );
}