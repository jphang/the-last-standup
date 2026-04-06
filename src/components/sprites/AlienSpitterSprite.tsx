interface Props {
  size: number;
}

export default function AlienSpitterSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}-${w}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(6, 0, 4, 1, '#fbbf24')}
      {px(5, 1, 6, 1, '#f59e0b')}

      {px(4, 2, 8, 1, '#fde68a')}
      {px(3, 3, 10, 1, '#fde68a')}
      {px(3, 4, 10, 1, '#fbbf24')}
      {px(3, 5, 10, 1, '#fbbf24')}
      {px(4, 6, 8, 1, '#f59e0b')}
      {px(5, 7, 6, 1, '#f59e0b')}

      {px(4, 3, 3, 2, '#1a1a2e')}
      {px(9, 3, 3, 2, '#1a1a2e')}
      {px(5, 3, 1, 1, '#ef4444')}
      {px(10, 3, 1, 1, '#ef4444')}

      {px(6, 6, 4, 1, '#92400e')}
      {px(5, 7, 1, 1, '#fbbf24')}
      {px(10, 7, 1, 1, '#fbbf24')}

      {px(2, 4, 1, 2, '#fde68a')}
      {px(13, 4, 1, 2, '#fde68a')}
      {px(1, 5, 1, 1, '#fbbf24')}
      {px(14, 5, 1, 1, '#fbbf24')}

      {px(4, 8, 2, 1, '#374151')}
      {px(6, 8, 4, 1, '#4b5563')}
      {px(10, 8, 2, 1, '#374151')}
      {px(3, 9, 10, 1, '#374151')}
      {px(3, 10, 10, 1, '#1f2937')}
      {px(4, 11, 8, 1, '#1f2937')}

      {px(4, 12, 2, 2, '#fbbf24')}
      {px(10, 12, 2, 2, '#fbbf24')}
      {px(3, 14, 3, 1, '#f59e0b')}
      {px(10, 14, 3, 1, '#f59e0b')}
      {px(3, 15, 3, 1, '#92400e')}
      {px(10, 15, 3, 1, '#92400e')}
    </svg>
  );
}
