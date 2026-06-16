type SliderArrowProps = {
  direction: "left" | "right";
  label: string;
  onClick: () => void;
  className?: string;
};

export default function SliderArrow({ direction, label, onClick, className = "" }: SliderArrowProps) {
  return (
    <button
      type="button"
      className={`web-slider-arrow web-slider-arrow--${direction}${className ? ` ${className}` : ""}`}
      aria-label={label}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {direction === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}
