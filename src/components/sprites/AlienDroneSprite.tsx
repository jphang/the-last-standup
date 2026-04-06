interface Props {
  size: number;
}

export default function AlienDroneSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}-${w}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(3, 0, 2, 1, '#38bdf8')}
      {px(11, 0, 2, 1, '#38bdf8')}
      {px(4, 1, 1, 1, '#0ea5e9')}
      {px(11, 1, 1, 1, '#0ea5e9')}

      {px(5, 1, 6, 1, '#7dd3fc')}
      {px(4, 2, 8, 1, '#7dd3fc')}
      {px(4, 3, 8, 1, '#38bdf8')}
      {px(4, 4, 8, 1, '#38bdf8')}
      {px(4, 5, 8, 1, '#0ea5e9')}
      {px(5, 6, 6, 1, '#0ea5e9')}
      {px(6, 7, 4, 1, '#0284c7')}

      {px(5, 3, 2, 2, '#1a1a2e')}
      {px(9, 3, 2, 2, '#1a1a2e')}
      {px(5, 3, 1, 1, '#f0abfc')}
      {px(9, 3, 1, 1, '#f0abfc')}

      {px(7, 5, 2, 1, '#075985')}

      {px(3, 3, 1, 2, '#7dd3fc')}
      {px(12, 3, 1, 2, '#7dd3fc')}
      {px(2, 4, 1, 1, '#38bdf8')}
      {px(13, 4, 1, 1, '#38bdf8')}

      {px(5, 8, 6, 1, '#334155')}
      {px(4, 9, 8, 1, '#334155')}
      {px(4, 10, 8, 1, '#1e293b')}
      {px(5, 11, 6, 1, '#1e293b')}

      {px(4, 12, 2, 2, '#38bdf8')}
      {px(10, 12, 2, 2, '#38bdf8')}
      {px(4, 14, 2, 1, '#0ea5e9')}
      {px(10, 14, 2, 1, '#0ea5e9')}
      {px(3, 15, 3, 1, '#0284c7')}
      {px(10, 15, 3, 1, '#0284c7')}
    </svg>
  );
}
