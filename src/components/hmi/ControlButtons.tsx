// ControlButtons: provides reusable `HoldButton` and `ToggleButton` used
// across the HMI for hold-to-activate and toggle interactions.
import React, { memo, useCallback, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Props for HoldButton: callbacks for start/end hold and presentation
interface HoldButtonProps {
  onHoldStart: () => void;
  onHoldEnd: () => void;
  disabled?: boolean;
  className?: string | ((isHolding: boolean) => string);
  children: React.ReactNode;
  showToggle?: boolean;
}



// HoldButton: triggers `onHoldStart` when pressed and `onHoldEnd` when released
export const HoldButton = memo(({
  onHoldStart,
  onHoldEnd,
  disabled,
  className,
  showToggle=true,
  children
}: HoldButtonProps) => {
  const [isHolding, setIsHolding] = useState(false);
  const holdingRef = useRef(false);

  // Called when user begins holding the control (mouse/touch down)
  const handleStart = useCallback(() => {
    if (disabled) return;
    holdingRef.current = true;
    setIsHolding(true);
    onHoldStart();
  }, [disabled, onHoldStart]);

  // Called when user stops holding (mouse up / touch end / leave)
  const handleEnd = useCallback(() => {
    if (holdingRef.current) {
      holdingRef.current = false;
      setIsHolding(false);
      onHoldEnd();
    }
  }, [onHoldEnd]);

  return (
    <button
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      disabled={disabled}
      className={`${typeof className === 'function' ? className(isHolding) : className} ${isHolding ? 'scale-95 brightness-125' : ''} transition-all`}
    >
      {children}
      {showToggle && <span className="text-white/70 text-xs mt-1">{isHolding ? 'ON' : 'OFF'}</span>}
    </button>
  );
});

HoldButton.displayName = 'HoldButton';

// Props for ToggleButton: represents a binary on/off control
interface ToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  isMutating?: boolean;
  activeClassName: string;
  inactiveClassName: string;
  children: React.ReactNode;
  activeLabel?: string;
  inactiveLabel?: string;
}

// ToggleButton: toggles state via `onClick` and shows active/inactive UI
export const ToggleButton = memo(({
  isActive,
  onClick,
  disabled,
  isMutating,
  activeClassName,
  inactiveClassName,
  children,
  activeLabel,
  inactiveLabel
}: ToggleButtonProps) => {
  const isDisabled = disabled || isMutating;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`relative ${isActive ? activeClassName : inactiveClassName} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isMutating ? (
        <Loader2 className="w-6 h-6 animate-spin text-white" />
      ) : (
        <>
          {children}
          {(activeLabel || inactiveLabel) && (
            <span className="block text-xs mt-1 opacity-75">
              {isActive ? activeLabel : inactiveLabel}
            </span>
          )}
        </>
      )}
      {isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse shadow-lg" />
      )}
    </button>
  );
});

ToggleButton.displayName = 'ToggleButton';
