interface Props {
  size: number;
}

export default function DevopsSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(5, 1, 6, 1, '#06b6d4')}
      {px(4, 2, 8, 2, '#06b6d4')}
      {px(3, 3, 10, 1, '#0891b2')}

      {px(5, 4, 6, 1, '#d4a574')}
      {px(4, 5, 8, 1, '#d4a574')}
      {px(4, 6, 8, 1, '#d4a574')}
      {px(5, 7, 6, 1, '#d4a574')}

      {px(5, 5, 2, 1, '#1a1a2e')}
      {px(9, 5, 2, 1, '#1a1a2e')}

      {px(11, 5, 1, 2, '#9ca3af')}

      {px(7, 7, 2, 1, '#c4846a')}

      {px(5, 8, 6, 1, '#1e293b')}
      {px(4, 9, 8, 1, '#1e293b')}
      {px(4, 10, 8, 1, '#0f172a')}
      {px(4, 11, 8, 1, '#0f172a')}

      {px(6, 9, 1, 1, '#06b6d4')}
      {px(7, 8, 2, 1, '#06b6d4')}
      {px(9, 9, 1, 1, '#06b6d4')}

      {px(3, 9, 1, 2, '#d4a574')}
      {px(12, 9, 1, 2, '#d4a574')}
      {px(2, 11, 2, 1, '#d4a574')}
      {px(12, 11, 2, 1, '#d4a574')}

      {px(5, 12, 2, 3, '#334155')}
      {px(9, 12, 2, 3, '#334155')}
      {px(4, 15, 3, 1, '#1e293b')}
      {px(9, 15, 3, 1, '#1e293b')}
    </svg>
  );
}
