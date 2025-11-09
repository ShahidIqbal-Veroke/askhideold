import React, { useEffect, useRef, useState } from "react";

export type SplitCompareProps = {
  originalSrc: string;
  overlaySrc: string;
  leftLabel?: string;
  rightLabel?: string;
  /** Initial slider position (0-100). Default: 50 */
  initial?: number;
  /** If set, enables auto sliding for the given duration in ms. Default: 8000 when triggered */
  autoSlideDuration?: number;
  className?: string;
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const toCssPx = (h: number | string | undefined, fallback = 600) =>
    typeof h === "number" ? `${h}px` : h ?? `${fallback}px`;

export const SplitCompare: React.FC<SplitCompareProps> = ({
                                                            originalSrc,
                                                            overlaySrc,
                                                            leftLabel,
                                                            rightLabel,
                                                            initial = 45,
                                                            autoSlideDuration = 8000,
                                                            className = "",
                                                          }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState(clamp(initial));
  const [dragging, setDragging] = useState(false);
  const autoRef = useRef<{ active: boolean; id?: number }>({ active: false });

  // Update CSS variable for clip path
  useEffect(() => {
    if (containerRef.current) {
      const overlay = containerRef.current.querySelector(
          ".overlay-container"
      ) as HTMLElement | null;
      if (overlay) overlay.style.setProperty("--pos", `${pos}%`);
      if (sliderRef.current) sliderRef.current.style.left = `${pos}%`;
    }
  }, [pos]);

  // Keyboard arrows support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPos((p) => clamp(p - 5));
      else if (e.key === "ArrowRight") setPos((p) => clamp(p + 5));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    if (e.cancelable) e.preventDefault();
  };

  const endDrag = () => setDragging(false);

  const onMove = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const p = (x / rect.width) * 100;
    setPos(p);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    onMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    if (touch) onMove(touch.clientX);
  };

  const triggerAutoSlide = () => {
    if (autoRef.current.active) {
      autoRef.current.active = false;
      return;
    }
    autoRef.current.active = true;
    let position = 0;
    let direction = 1;
    const step = () => {
      if (!autoRef.current.active) return;
      position += direction * 0.5;
      if (position >= 100 || position <= 0) direction *= -1;
      setPos(position);
      autoRef.current.id = window.requestAnimationFrame(step);
    };
    autoRef.current.id = window.requestAnimationFrame(step);
    window.setTimeout(() => {
      autoRef.current.active = false;
      if (autoRef.current.id) cancelAnimationFrame(autoRef.current.id);
      setPos(50);
    }, autoSlideDuration);
  };

  return (
      <div className={`w-full flex items-center justify-center p-5 ${className}`}>
        {/* Component-scoped styles */}
        <style>{`
        .split-compare-container {
          background: transparent;
          border-radius: 24px;
          padding: 30px;
          max-width: 1200px;
          width: 100%;
        }
        .comparison-wrapper { position: relative; width: 100%; max-width: 100%; margin: 0 auto; border-radius: 16px; overflow: hidden; }
        @media (max-width: 768px) {
          .split-compare-container { padding: 15px; max-width: 100%; }
          .comparison-wrapper { max-width: 100%; }
        }
        .image-container { position: relative; width: 100%; height: 400px; background: transparent; overflow: hidden; }
        .image-layer, .overlay-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .image-layer img, .overlay-container img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .overlay-container { overflow: hidden; --pos: 50%; clip-path: inset(0 calc(100% - var(--pos)) 0 0); }
        .slider { position: absolute; top: 0; left: 50%; width: 4px; height: 100%; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px) saturate(180%); cursor: ew-resize; transform: translateX(-50%); z-index: 10; box-shadow: 0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.3); }
        .slider::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(30px) saturate(200%); border-radius: 50%; box-shadow: 0 0 30px rgba(255, 255, 255, 0.4), 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.4); }
        .slider::after { content: '◀ ▶'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #374151; font-size: 14px; font-weight: bold; pointer-events: none; text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8); }
        .label { position: absolute; top: 12px; padding: 8px 12px; background: rgba(255, 255, 255, 0.15); color: #1f2937; border-radius: 8px; font-size: 18px; font-weight: 500; z-index: 5; backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6); }
        .label-left { left: 8px; border: 2px solid rgba(255, 255, 255, 0.6); background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(20px) saturate(180%); }
        .label-right { right: 8px; }
        @media (max-width: 1200px) {
          .label { font-size: 14px; padding: 8px 12px; top: 15px; }
          .label-left { left: 10px; }
          .label-right { right: 10px; }
        }
        @media (max-width: 768px) {
          .label { font-size: 12px; padding: 6px 10px; top: 10px; }
          .label-left { left: 8px; }
          .label-right { right: 8px; }
        }
        @media (max-width: 480px) {
          .label { font-size: 10px; padding: 4px 8px; top: 8px; max-width: calc(50% - 16px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .label-left { left: 5px; }
          .label-right { right: 5px; }
        }
        .btn { padding: 12px 24px; margin: 0 10px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: all 0.3s ease; }
        .btn:hover { background: #6366f1; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4); }
      `}</style>

        <div
            ref={containerRef}
            className="image-container"
            onMouseMove={onMouseMove}
            onTouchMove={onTouchMove}
            onMouseLeave={endDrag}
            onMouseUp={endDrag}
            onTouchEnd={endDrag}
        >
          <div className="image-layer">
            <img src={originalSrc} alt="Original" />
          </div>

          <div className="overlay-container">
            <img src={overlaySrc} alt="Overlay" />
          </div>

          <div
              ref={sliderRef}
              className="slider"
              onMouseDown={startDrag}
              onTouchStart={startDrag}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              aria-label="Comparison slider"
          />

          <div className="label label-left ">{leftLabel}</div>
          <div className="label label-right">{rightLabel}</div>
        </div>
      </div>


  );
};


// Example usage:
// <SplitCompare
//   originalSrc="https://.../689ba253b3c5f95c0f741c25_test5.png"
//   overlaySrc="https://.../68078663803a9cbdee451447_result_test5.png"
//   height={600}
// />
