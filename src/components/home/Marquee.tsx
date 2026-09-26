const PHRASES = ["Flow your way", "Made to flow alone", "Different route, same destination", "流れが違う"];

export function Marquee() {
  const items = [...PHRASES, ...PHRASES, ...PHRASES];
  return (
    <div className="overflow-hidden border-y border-line bg-coal py-5 sm:py-7" aria-hidden="true">
      <div className="flex w-max animate-marquee items-center [animation-duration:60s]">
        {items.map((p, i) => (
          <span key={i} className="flex items-center">
            <span
              className={
                i % 2 === 0
                  ? "display px-6 text-4xl text-bone sm:px-10 sm:text-6xl"
                  : "display px-6 text-4xl text-transparent [-webkit-text-stroke:1px_rgba(239,237,232,0.55)] sm:px-10 sm:text-6xl"
              }
            >
              {p}
            </span>
            <span className="size-3 rotate-45 bg-blood sm:size-4" />
          </span>
        ))}
      </div>
    </div>
  );
}
