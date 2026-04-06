interface Props {
  size: number;
}

export default function QaSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(6, 1, 4, 1, '#1a1a2e')}
      {px(5, 2, 6, 2, '#1a1a2e')}

      {px(5, 4, 6, 1, '#d4a07a')}
      {px(4, 5, 8, 1, '#d4a07a')}
      {px(4, 6, 8, 1, '#d4a07a')}
      {px(5, 7, 6, 1, '#d4a07a')}

      {px(5, 5, 2, 1, '#1a1a2e')}
      {px(9, 5, 2, 1, '#1a1a2e')}

      {px(4, 4, 1, 3, '#f97316')}
      {px(3, 5, 1, 1, '#f97316')}

      {px(7, 7, 2, 1, '#c4846a')}

      {px(5, 8, 6, 1, '#f97316')}
      {px(4, 9, 8, 1, '#ea580c')}
      {px(4, 10, 8, 1, '#c2410c')}
      {px(4, 11, 8, 1, '#c2410c')}

      {px(6, 8, 4, 1, '#1a1a2e')}
      {px(7, 9, 2, 1, '#f97316')}

      {px(3, 9, 1, 2, '#d4a07a')}
      {px(12, 9, 1, 2, '#d4a07a')}
      {px(2, 11, 2, 1, '#d4a07a')}
      {px(12, 11, 2, 1, '#d4a07a')}

      {px(13, 10, 2, 2, '#4ade80')}

      {px(5, 12, 2, 3, '#374151')}
      {px(9, 12, 2, 3, '#374151')}
      {px(4, 15, 3, 1, '#4b5563')}
      {px(9, 15, 3, 1, '#4b5563')}
    </svg>
  );
}
