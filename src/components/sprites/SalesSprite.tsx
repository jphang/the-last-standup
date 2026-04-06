interface Props {
  size: number;
}

export default function SalesSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(6, 1, 4, 1, '#b8860b')}
      {px(5, 2, 6, 1, '#b8860b')}
      {px(5, 3, 6, 1, '#daa520')}

      {px(5, 4, 6, 1, '#f5cfa0')}
      {px(4, 5, 8, 1, '#f5cfa0')}
      {px(4, 6, 8, 1, '#f5cfa0')}
      {px(5, 7, 6, 1, '#f5cfa0')}

      {px(5, 5, 2, 1, '#1a1a2e')}
      {px(9, 5, 2, 1, '#1a1a2e')}

      {px(6, 7, 4, 1, '#e8967a')}

      {px(5, 8, 6, 1, '#22c55e')}
      {px(4, 9, 8, 1, '#16a34a')}
      {px(4, 10, 8, 1, '#15803d')}
      {px(4, 11, 8, 1, '#15803d')}

      {px(7, 8, 2, 1, '#ffffff')}
      {px(7, 9, 2, 1, '#166534')}

      {px(3, 9, 1, 2, '#f5cfa0')}
      {px(12, 9, 1, 2, '#f5cfa0')}
      {px(2, 10, 1, 2, '#f5cfa0')}
      {px(13, 10, 1, 2, '#f5cfa0')}

      {px(14, 9, 2, 1, '#fbbf24')}
      {px(14, 10, 2, 1, '#f59e0b')}

      {px(5, 12, 2, 3, '#374151')}
      {px(9, 12, 2, 3, '#374151')}
      {px(4, 15, 3, 1, '#4a3728')}
      {px(9, 15, 3, 1, '#4a3728')}
    </svg>
  );
}
