import { cn as classNames } from '@/lib/utils';
import React, { FC, useCallback, useMemo, useRef, useEffect } from 'react';
import { Tooltip } from '../Tooltip';

export interface SliderProps {
  min?: number;
  max?: number;
  value?: number;
  marks?: number[];
  onChange?: (value: number) => void;
}

export const Slider: FC<SliderProps> = ({
  min = 0,
  max = 100,
  marks = [],
  onChange,
  ...props
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  const value = useMemo(() => {
    const val = props.value ?? min;

    if (val < min) {
      return min;
    }
    if (val > max) {
      return max;
    }

    return val;
  }, [props.value, min, max]);

  const calcPosition = useCallback(
    (value: number) => {
      if (max === min) {
        return 0;
      }

      return ((value - min) / (max - min)) * 100;
    },
    [max, min],
  );

  const position = useMemo(() => calcPosition(value), [value, calcPosition]);

  const updateValue = useCallback(
    (mouseX: number) => {
      if (!rootRef.current) {
        return;
      }

      const element = rootRef.current as Element;
      const { left, width } = element.getBoundingClientRect();

      let x = mouseX - left;

      if (x < 0) {
        x = 0;
      }
      if (x > width) {
        x = width;
      }

      const value = Math.round((x / width) * (max - min) + min);

      onChange?.(value);
    },
    [min, max, onChange],
  );

  const handleMouseDown = useCallback(
    (evt: React.MouseEvent) => {
      if (evt.button > 0) {
        return;
      }

      isDraggingRef.current = true;

      updateValue(evt.clientX);

      evt.preventDefault();
      evt.stopPropagation();
    },
    [updateValue],
  );

  const handleTouchStart = useCallback(
    (evt: React.TouchEvent) => {
      isDraggingRef.current = true;

      const { clientX } = evt.touches[0];

      updateValue(clientX);
    },
    [updateValue],
  );

  const handleMouseMove = useCallback(
    (evt: MouseEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      updateValue(evt.clientX);
    },
    [updateValue],
  );

  const handleTouchMove = useCallback(
    (evt: TouchEvent) => {
      if (!isDraggingRef.current) {
        return;
      }

      updateValue(evt.touches[0].clientX);

      evt.preventDefault();
    },
    [updateValue],
  );

  useEffect(() => {
    const clearDragging = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', clearDragging);
    document.addEventListener('touchend', clearDragging);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', clearDragging);
      document.removeEventListener('touchend', clearDragging);
    };
  }, [handleMouseMove, handleTouchMove]);

  const handleMarkMousedown = useCallback(
    (evt: React.MouseEvent) => {
      const { x, width: markWidth } = (
        evt.target as Element
      ).getBoundingClientRect();

      isDraggingRef.current = true;

      updateValue(x + markWidth / 2);

      evt.preventDefault();
    },
    [updateValue],
  );

  const handleMarkTouchStart = useCallback(
    (evt: React.TouchEvent) => {
      const { x, width: markWidth } = (
        evt.target as Element
      ).getBoundingClientRect();

      isDraggingRef.current = true;

      updateValue(x + markWidth / 2);
    },
    [updateValue],
  );

  return (
    <div ref={rootRef} className="slider">
      <div
        className="slider-clickarea"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      ></div>

      <div
        ref={trackRef}
        className="slider-track"
        style={{ width: `${position}%` }}
      ></div>

      {marks.map((mark) => (
        <div
          key={mark}
          className={classNames('slider-mark', {
            reached: value >= mark,
          })}
          style={{ left: `${calcPosition(mark)}%` }}
        >
          <div className="slider-mark-point">
            <div
              className="slider-mark-clickarea"
              onMouseDown={handleMarkMousedown}
              onTouchStart={handleMarkTouchStart}
            ></div>
          </div>
        </div>
      ))}

      <div className="slider-cursor" style={{ left: `${position}%` }}>
        <div
          className="slider-handle"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <Tooltip content={`${value}%`} at="top" showDelay={0}>
            <div className="slider-handle-clickarea"></div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
