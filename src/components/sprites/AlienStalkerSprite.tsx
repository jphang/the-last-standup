interface Props {
  size: number;
}

export default function AlienStalkerSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}-${w}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(6, 0, 4, 1, '#a78bfa')}
      {px(5, 1, 6, 1, '#8b5cf6')}

      {px(5, 2, 6, 1, '#c4b5fd')}
      {px(4, 3, 8, 1, '#c4b5fd')}
      {px(4, 4, 8, 1, '#a78bfa')}
      {px(4, 5, 8, 1, '#a78bfa')}
      {px(5, 6, 6, 1, '#8b5cf6')}
      {px(6, 7, 4, 1, '#8b5cf6')}

      {px(5, 3, 2, 2, '#1a1a2e')}
      {px(9, 3, 2, 2, '#1a1a2e')}
      {px(5, 3, 1, 1, '#e879f9')}
      {px(9, 3, 1, 1, '#e879f9')}

      {px(7, 6, 2, 1, '#6d28d9')}

      {px(3, 4, 1, 3, '#c4b5fd')}
      {px(12, 4, 1, 3, '#c4b5fd')}
      {px(2, 6, 1, 2, '#a78bfa')}
      {px(13, 6, 1, 2, '#a78bfa')}
      {px(1, 7, 1, 2, '#8b5cf6')}
      {px(14, 7, 1, 2, '#8b5cf6')}

      {px(5, 8, 6, 1, '#374151')}
      {px(4, 9, 8, 1, '#374151')}
      {px(4, 10, 8, 1, '#1f2937')}

      {px(4, 11, 2, 3, '#a78bfa')}
      {px(10, 11, 2, 3, '#a78bfa')}
      {px(4, 14, 2, 1, '#8b5cf6')}
      {px(10, 14, 2, 1, '#8b5cf6')}
      {px(4, 15, 2, 1, '#6d28d9')}
      {px(10, 15, 2, 1, '#6d28d9')}
    </svg>
  );
}
