import { useState } from "react";

interface DragState {
  target: string;
  startX: number;
  startY: number;
  startPercentX: number;
  startPercentY: number;
  catIdx?: number;
}

const parsePosition = (posStr?: string): [number, number] => {
  if (!posStr) return [50, 50];
  const parts = posStr.split(" ");
  if (parts.length !== 2) return [50, 50];
  const x = parseFloat(parts[0]);
  const y = parseFloat(parts[1]);
  return [isNaN(x) ? 50 : x, isNaN(y) ? 50 : y];
};

export function useImageDrag(onPositionChange: (target: string, posStr: string, catIdx?: number) => void) {
  const [dragState, setDragState] = useState<DragState | null>(null);

  const calcPosition = (
    clientX: number,
    clientY: number,
    container: HTMLElement
  ): string | null => {
    if (!dragState) return null;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const dx = clientX - dragState.startX;
    const dy = clientY - dragState.startY;

    const changeX = (dx / rect.width) * 100;
    const changeY = (dy / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, dragState.startPercentX - changeX));
    const newY = Math.max(0, Math.min(100, dragState.startPercentY - changeY));

    return `${newX.toFixed(1)}% ${newY.toFixed(1)}%`;
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    target: string,
    currentPosStr?: string,
    catIdx?: number
  ) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const [startXPercent, startYPercent] = parsePosition(currentPosStr);
    setDragState({ target, startX: e.clientX, startY: e.clientY, startPercentX: startXPercent, startPercentY: startYPercent, catIdx });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState) return;
    const posStr = calcPosition(e.clientX, e.clientY, e.currentTarget);
    if (posStr) onPositionChange(dragState.target, posStr, dragState.catIdx);
  };

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    target: string,
    currentPosStr?: string,
    catIdx?: number
  ) => {
    const touch = e.touches[0];
    if (!touch) return;
    const [startXPercent, startYPercent] = parsePosition(currentPosStr);
    setDragState({ target, startX: touch.clientX, startY: touch.clientY, startPercentX: startXPercent, startPercentY: startYPercent, catIdx });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragState) return;
    const touch = e.touches[0];
    if (!touch) return;
    const posStr = calcPosition(touch.clientX, touch.clientY, e.currentTarget);
    if (posStr) onPositionChange(dragState.target, posStr, dragState.catIdx);
  };

  const handleDragEnd = () => {
    if (dragState) setDragState(null);
  };

  return {
    dragState,
    handleMouseDown,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleDragEnd
  };
}
