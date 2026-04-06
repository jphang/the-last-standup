interface Props {
  size: number;
}

export default function InternSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(6, 1, 4, 1, '#854d0e')}
      {px(5, 2, 6, 1, '#854d0e')}
      {px(4, 3, 3, 1, '#854d0e')}
      {px(9, 3, 3, 1, '#854d0e')}

      {px(5, 3, 6, 1, '#f0c8a0')}
      {px(4, 4, 8, 1, '#f0c8a0')}
      {px(4, 5, 8, 1, '#f0c8a0')}
      {px(4, 6, 8, 1, '#f0c8a0')}
      {px(5, 7, 6, 1, '#f0c8a0')}

      {px(5, 5, 2, 1, '#1a1a2e')}
      {px(9, 5, 2, 1, '#1a1a2e')}

      {px(6, 7, 4, 1, '#e8967a')}

      {px(5, 8, 6, 1, '#0ea5e9')}
      {px(4, 9, 8, 1, '#0284c7')}
      {px(4, 10, 8, 1, '#0369a1')}
      {px(4, 11, 8, 1, '#0369a1')}

      {px(7, 8, 2, 1, '#ffffff')}
      {px(7, 9, 1, 1, '#0ea5e9')}
      {px(8, 9, 1, 1, '#0ea5e9')}

      {px(3, 9, 1, 2, '#f0c8a0')}
      {px(12, 9, 1, 2, '#f0c8a0')}
      {px(2, 11, 2, 1, '#f0c8a0')}
      {px(12, 11, 2, 1, '#f0c8a0')}

      {px(13, 10, 2, 3, '#854d0e')}
      {px(14, 12, 1, 1, '#f0c8a0')}

      {px(5, 12, 2, 3, '#1e3a5f')}
      {px(9, 12, 2, 3, '#1e3a5f')}
      {px(4, 15, 3, 1, '#6b7280')}
      {px(9, 15, 3, 1, '#6b7280')}
    </svg>
  );
}
