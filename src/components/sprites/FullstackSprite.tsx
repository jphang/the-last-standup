interface Props {
  size: number;
}

export default function FullstackSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(6, 1, 4, 1, '#92400e')}
      {px(5, 2, 6, 2, '#92400e')}
      {px(4, 3, 8, 1, '#78350f')}

      {px(5, 4, 6, 1, '#e8c4a0')}
      {px(4, 5, 8, 1, '#e8c4a0')}
      {px(4, 6, 8, 1, '#e8c4a0')}
      {px(5, 7, 6, 1, '#e8c4a0')}

      {px(5, 5, 2, 1, '#1a1a2e')}
      {px(9, 5, 2, 1, '#1a1a2e')}

      {px(11, 5, 1, 1, '#e8c4a0')}

      {px(7, 7, 2, 1, '#d4967a')}

      {px(5, 8, 6, 1, '#f59e0b')}
      {px(4, 9, 8, 1, '#d97706')}
      {px(4, 10, 8, 1, '#b45309')}
      {px(4, 11, 8, 1, '#b45309')}

      {px(7, 9, 2, 2, '#1a1a2e')}

      {px(3, 9, 1, 2, '#e8c4a0')}
      {px(12, 9, 1, 2, '#e8c4a0')}
      {px(1, 11, 3, 1, '#e8c4a0')}
      {px(12, 11, 3, 1, '#e8c4a0')}

      {px(13, 10, 3, 2, '#374151')}
      {px(14, 9, 2, 1, '#374151')}
      {px(14, 10, 1, 1, '#60a5fa')}

      {px(5, 12, 2, 3, '#1e3a5f')}
      {px(9, 12, 2, 3, '#1e3a5f')}
      {px(4, 15, 3, 1, '#6b7280')}
      {px(9, 15, 3, 1, '#6b7280')}
    </svg>
  );
}
