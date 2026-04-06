interface Props {
  size: number;
}

export default function RecruiterSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(5, 0, 6, 1, '#1a1a2e')}
      {px(4, 1, 8, 1, '#1a1a2e')}
      {px(4, 2, 8, 1, '#1a1a2e')}
      {px(3, 2, 1, 2, '#1a1a2e')}
      {px(12, 2, 1, 2, '#1a1a2e')}

      {px(5, 3, 6, 1, '#c9956e')}
      {px(4, 4, 8, 1, '#c9956e')}
      {px(4, 5, 8, 1, '#c9956e')}
      {px(4, 6, 8, 1, '#c9956e')}
      {px(5, 7, 6, 1, '#c9956e')}

      {px(5, 5, 2, 1, '#1a1a2e')}
      {px(9, 5, 2, 1, '#1a1a2e')}

      {px(7, 7, 2, 1, '#b8755e')}

      {px(5, 8, 6, 1, '#ec4899')}
      {px(4, 9, 8, 1, '#db2777')}
      {px(4, 10, 8, 1, '#be185d')}
      {px(4, 11, 8, 1, '#be185d')}

      {px(6, 8, 1, 1, '#fce7f3')}
      {px(7, 9, 2, 1, '#fce7f3')}
      {px(9, 8, 1, 1, '#fce7f3')}

      {px(3, 9, 1, 2, '#c9956e')}
      {px(12, 9, 1, 2, '#c9956e')}
      {px(2, 11, 2, 1, '#c9956e')}
      {px(12, 11, 2, 1, '#c9956e')}

      {px(1, 10, 2, 2, '#f9a8d4')}

      {px(5, 12, 2, 3, '#1e293b')}
      {px(9, 12, 2, 3, '#1e293b')}
      {px(4, 15, 3, 1, '#ec4899')}
      {px(9, 15, 3, 1, '#ec4899')}
    </svg>
  );
}
