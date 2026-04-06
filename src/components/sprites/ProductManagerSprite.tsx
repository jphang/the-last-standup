interface Props {
  size: number;
}

export default function ProductManagerSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(6, 1, 4, 1, '#1e293b')}
      {px(5, 2, 6, 1, '#1e293b')}
      {px(5, 3, 6, 1, '#1e293b')}

      {px(5, 4, 6, 1, '#d4a882')}
      {px(4, 5, 8, 1, '#d4a882')}
      {px(4, 6, 8, 1, '#d4a882')}
      {px(5, 7, 6, 1, '#d4a882')}

      {px(5, 5, 2, 1, '#1a1a2e')}
      {px(9, 5, 2, 1, '#1a1a2e')}

      {px(4, 4, 1, 2, '#3b82f6')}
      {px(11, 4, 1, 2, '#3b82f6')}

      {px(7, 7, 2, 1, '#c4886a')}

      {px(5, 8, 6, 1, '#3b82f6')}
      {px(4, 9, 8, 1, '#2563eb')}
      {px(4, 10, 8, 1, '#1d4ed8')}
      {px(4, 11, 8, 1, '#1d4ed8')}

      {px(7, 8, 2, 1, '#ffffff')}
      {px(7, 9, 2, 1, '#1e40af')}

      {px(3, 9, 1, 2, '#d4a882')}
      {px(12, 9, 1, 2, '#d4a882')}
      {px(2, 10, 1, 2, '#d4a882')}
      {px(13, 10, 1, 2, '#d4a882')}

      {px(1, 10, 1, 2, '#60a5fa')}

      {px(5, 12, 2, 3, '#374151')}
      {px(9, 12, 2, 3, '#374151')}
      {px(4, 15, 3, 1, '#1e293b')}
      {px(9, 15, 3, 1, '#1e293b')}
    </svg>
  );
}
