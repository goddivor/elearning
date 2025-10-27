import { useState, type ReactNode, useRef } from 'react';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip = ({ content, children, position = 'top', className = '' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      let x = rect.left + scrollLeft;
      let y = rect.top + scrollTop;

      switch (position) {
        case 'top':
          x += rect.width / 2;
          y -= 8;
          break;
        case 'bottom':
          x += rect.width / 2;
          y += rect.height + 8;
          break;
        case 'left':
          x -= 8;
          y += rect.height / 2;
          break;
        case 'right':
          x += rect.width + 8;
          y += rect.height / 2;
          break;
        default:
          // Default to top position
          x += rect.width / 2;
          y -= 8;
          break;
      }

      setTooltipPosition({ x, y });
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const getTooltipClasses = () => {
    const baseClasses = 'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg max-w-xs break-words transition-opacity duration-200';

    let positionClasses = '';
    switch (position) {
      case 'top':
        positionClasses = 'transform -translate-x-1/2 -translate-y-full';
        break;
      case 'bottom':
        positionClasses = 'transform -translate-x-1/2';
        break;
      case 'left':
        positionClasses = 'transform -translate-x-full -translate-y-1/2';
        break;
      case 'right':
        positionClasses = 'transform -translate-y-1/2';
        break;
      default:
        positionClasses = 'transform -translate-x-1/2 -translate-y-full';
        break;
    }

    return `${baseClasses} ${positionClasses}`;
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900';
      case 'bottom':
        return 'absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900';
      case 'left':
        return 'absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900';
      case 'right':
        return 'absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900';
      default:
        return '';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={getTooltipClasses()}
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          {content}
          <div className={getArrowClasses()} />
        </div>
      )}
    </>
  );
};

export default Tooltip;