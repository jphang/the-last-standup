interface Props {
  size: number;
}

export default function AlienBruteSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}-${w}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(4, 0, 8, 1, '#f97316')}
      {px(3, 1, 10, 1, '#ea580c')}

      {px(3, 2, 10, 1, '#fb923c')}
      {px(2, 3, 12, 1, '#fb923c')}
      {px(2, 4, 12, 1, '#f97316')}
      {px(2, 5, 12, 1, '#f97316')}
      {px(3, 6, 10, 1, '#ea580c')}
      {px(4, 7, 8, 1, '#ea580c')}

      {px(3, 3, 3, 2, '#1a1a2e')}
      {px(10, 3, 3, 2, '#1a1a2e')}
      {px(4, 3, 1, 1, '#fbbf24')}
      {px(11, 3, 1, 1, '#fbbf24')}

      {px(7, 6, 2, 1, '#9a3412')}

      {px(1, 3, 1, 3, '#fb923c')}
      {px(14, 3, 1, 3, '#fb923c')}
      {px(0, 5, 1, 2, '#f97316')}
      {px(15, 5, 1, 2, '#f97316')}

      {px(3, 8, 4, 1, '#374151')}
      {px(9, 8, 4, 1, '#374151')}
      {px(2, 9, 12, 1, '#4b5563')}
      {px(2, 10, 12, 1, '#374151')}
      {px(3, 11, 10, 1, '#1f2937')}

      {px(3, 12, 3, 2, '#f97316')}
      {px(10, 12, 3, 2, '#f97316')}
      {px(3, 14, 3, 1, '#ea580c')}
      {px(10, 14, 3, 1, '#ea580c')}
      {px(2, 15, 4, 1, '#9a3412')}
      {px(10, 15, 4, 1, '#9a3412')}
    </svg>
  );
}
