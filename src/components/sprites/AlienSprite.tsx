interface Props {
  size: number;
}

export default function AlienSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(5, 0, 6, 1, '#4ade80')}
      {px(4, 1, 8, 1, '#22c55e')}

      {px(4, 2, 8, 1, '#86efac')}
      {px(3, 3, 10, 1, '#86efac')}
      {px(3, 4, 10, 1, '#4ade80')}
      {px(3, 5, 10, 1, '#4ade80')}
      {px(4, 6, 8, 1, '#22c55e')}
      {px(5, 7, 6, 1, '#22c55e')}

      {px(4, 3, 3, 2, '#1a1a2e')}
      {px(9, 3, 3, 2, '#1a1a2e')}
      {px(5, 3, 1, 1, '#ef4444')}
      {px(10, 3, 1, 1, '#ef4444')}

      {px(7, 6, 2, 1, '#15803d')}

      {px(2, 4, 1, 2, '#86efac')}
      {px(13, 4, 1, 2, '#86efac')}
      {px(1, 5, 1, 1, '#4ade80')}
      {px(14, 5, 1, 1, '#4ade80')}

      {px(4, 8, 2, 1, '#374151')}
      {px(6, 8, 4, 1, '#4b5563')}
      {px(10, 8, 2, 1, '#374151')}
      {px(3, 9, 10, 1, '#374151')}
      {px(3, 10, 10, 1, '#1f2937')}
      {px(4, 11, 8, 1, '#1f2937')}

      {px(4, 12, 2, 2, '#4ade80')}
      {px(10, 12, 2, 2, '#4ade80')}
      {px(3, 14, 3, 1, '#22c55e')}
      {px(10, 14, 3, 1, '#22c55e')}
      {px(3, 15, 3, 1, '#15803d')}
      {px(10, 15, 3, 1, '#15803d')}
    </svg>
  );
}
