const VARIANTS = {
  primary:
    "bg-civic-600 text-white hover:bg-civic-700 shadow-card focus-visible:ring-2 focus-visible:ring-civic-300",
  signal:
    "bg-signal-500 text-white hover:bg-signal-600 shadow-card focus-visible:ring-2 focus-visible:ring-signal-200",
  outline:
    "bg-white text-civic-700 border border-ink-100 hover:border-civic-300 hover:text-civic-800",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100/60",
};

const SIZES = {
  md: "px-5 py-3 text-[0.95rem]",
  lg: "px-7 py-4 text-base",
  sm: "px-4 py-2 text-sm",
};

/**
 * Shared button used across Civic-Eye. Wraps a native <button> unless `as`
 * is passed a different component (e.g. React Router's Link).
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  as: Component = "button",
  className = "",
  ...props
}) {
  return (
    <Component
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon className="h-[1.1em] w-[1.1em] shrink-0" strokeWidth={2.2} />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="h-[1.1em] w-[1.1em] shrink-0" strokeWidth={2.2} />}
    </Component>
  );
}
