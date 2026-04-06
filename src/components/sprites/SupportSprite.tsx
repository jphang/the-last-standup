interface Props {
  size: number;
}

export default function SupportSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(6, 1, 4, 1, '#374151')}
      {px(5, 2, 6, 1, '#374151')}
      {px(4, 2, 1, 2, '#14b8a6')}
      {px(11, 2, 1, 2, '#14b8a6')}
      {px(3, 3, 1, 2, '#14b8a6')}
      {px(12, 3, 1, 2, '#14b8a6')}

      {px(5, 3, 6, 1, '#e0b090')}
      {px(4, 4, 8, 1, '#e0b090')}
      {px(4, 5, 8, 1, '#e0b090')}
      {px(4, 6, 8, 1, '#e0b090')}
      {px(5, 7, 6, 1, '#e0b090')}

      {px(5, 5, 2, 1, '#1a1a2e')}
      {px(9, 5, 2, 1, '#1a1a2e')}

      {px(7, 7, 2, 1, '#d09070')}

      {px(5, 8, 6, 1, '#14b8a6')}
      {px(4, 9, 8, 1, '#0d9488')}
      {px(4, 10, 8, 1, '#0f766e')}
      {px(4, 11, 8, 1, '#0f766e')}

      {px(7, 8, 2, 1, '#ffffff')}
      {px(7, 9, 2, 1, '#14b8a6')}

      {px(3, 9, 1, 2, '#e0b090')}
      {px(12, 9, 1, 2, '#e0b090')}
      {px(2, 11, 2, 1, '#e0b090')}
      {px(12, 11, 2, 1, '#e0b090')}

      {px(13, 10, 2, 2, '#475569')}
      {px(14, 10, 1, 1, '#14b8a6')}

      {px(5, 12, 2, 3, '#1e293b')}
      {px(9, 12, 2, 3, '#1e293b')}
      {px(4, 15, 3, 1, '#475569')}
      {px(9, 15, 3, 1, '#475569')}
    </svg>
  );
}
