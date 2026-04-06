interface Props {
  size: number;
}

export default function BossSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}-${fill}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(5, 0, 1, 1, '#991b1b')}
      {px(10, 0, 1, 1, '#991b1b')}
      {px(4, 0, 1, 1, '#7f1d1d')}
      {px(11, 0, 1, 1, '#7f1d1d')}
      {px(6, 0, 4, 1, '#ef4444')}
      {px(3, 1, 2, 1, '#991b1b')}
      {px(11, 1, 2, 1, '#991b1b')}
      {px(5, 1, 6, 1, '#dc2626')}

      {px(4, 2, 8, 1, '#7f1d1d')}
      {px(3, 3, 10, 1, '#991b1b')}

      {px(5, 4, 6, 1, '#d4a574')}
      {px(4, 5, 8, 1, '#d4a574')}
      {px(3, 6, 10, 1, '#c9956a')}
      {px(4, 7, 8, 1, '#c9956a')}

      {px(4, 5, 3, 1, '#1a1a2e')}
      {px(9, 5, 3, 1, '#1a1a2e')}
      {px(5, 5, 1, 1, '#ef4444')}
      {px(10, 5, 1, 1, '#ef4444')}

      {px(6, 7, 4, 1, '#991b1b')}

      {px(5, 8, 6, 1, '#1a1a2e')}
      {px(4, 9, 8, 1, '#1a1a2e')}
      {px(3, 10, 10, 1, '#111827')}
      {px(4, 11, 8, 1, '#111827')}

      {px(7, 8, 2, 1, '#ef4444')}
      {px(6, 9, 1, 1, '#ef4444')}
      {px(9, 9, 1, 1, '#ef4444')}

      {px(2, 8, 1, 1, '#d4a574')}
      {px(13, 8, 1, 1, '#d4a574')}
      {px(1, 7, 1, 1, '#d4a574')}
      {px(14, 7, 1, 1, '#d4a574')}
      {px(0, 5, 1, 2, '#d4a574')}
      {px(15, 5, 1, 2, '#d4a574')}
      {px(0, 4, 2, 1, '#c9956a')}
      {px(14, 4, 2, 1, '#c9956a')}

      {px(5, 12, 2, 2, '#1a1a2e')}
      {px(9, 12, 2, 2, '#1a1a2e')}
      {px(4, 14, 3, 1, '#991b1b')}
      {px(9, 14, 3, 1, '#991b1b')}
      {px(4, 15, 3, 1, '#7f1d1d')}
      {px(9, 15, 3, 1, '#7f1d1d')}
    </svg>
  );
}
