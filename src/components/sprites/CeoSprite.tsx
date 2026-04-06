interface Props {
  size: number;
}

export default function CeoSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(6, 1, 4, 1, '#1a1a2e')}
      {px(5, 2, 6, 1, '#1a1a2e')}
      {px(5, 3, 6, 1, '#1a1a2e')}

      {px(5, 4, 6, 1, '#f5cfa0')}
      {px(4, 5, 8, 1, '#f5cfa0')}
      {px(4, 6, 8, 1, '#f5cfa0')}
      {px(5, 7, 6, 1, '#f5cfa0')}

      {px(5, 5, 2, 1, '#1a1a2e')}
      {px(9, 5, 2, 1, '#1a1a2e')}

      {px(7, 7, 2, 1, '#e8967a')}

      {px(5, 8, 6, 1, '#10b981')}
      {px(4, 9, 8, 1, '#10b981')}
      {px(4, 10, 8, 1, '#059669')}
      {px(4, 11, 8, 1, '#059669')}

      {px(7, 8, 2, 1, '#ffffff')}
      {px(7, 9, 2, 1, '#047857')}

      {px(3, 9, 1, 2, '#f5cfa0')}
      {px(12, 9, 1, 2, '#f5cfa0')}
      {px(2, 10, 2, 1, '#f5cfa0')}
      {px(12, 10, 2, 1, '#f5cfa0')}

      {px(5, 12, 2, 3, '#1a1a2e')}
      {px(9, 12, 2, 3, '#1a1a2e')}
      {px(4, 15, 3, 1, '#4a3728')}
      {px(9, 15, 3, 1, '#4a3728')}
    </svg>
  );
}
