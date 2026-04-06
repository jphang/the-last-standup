interface Props {
  size: number;
}

export default function DesignerSprite({ size }: Props) {
  const s = size / 16;
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}`} x={x * s} y={y * s} width={w * s} height={h * s} fill={fill} />
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
      {px(5, 0, 6, 1, '#f43f5e')}
      {px(4, 1, 8, 1, '#f43f5e')}
      {px(4, 2, 9, 1, '#fb7185')}
      {px(12, 1, 1, 2, '#fb7185')}

      {px(5, 3, 6, 1, '#c9a07a')}
      {px(4, 4, 8, 1, '#c9a07a')}
      {px(4, 5, 8, 1, '#c9a07a')}
      {px(4, 6, 8, 1, '#c9a07a')}
      {px(5, 7, 6, 1, '#c9a07a')}

      {px(5, 5, 2, 1, '#1a1a2e')}
      {px(9, 5, 2, 1, '#1a1a2e')}

      {px(7, 7, 2, 1, '#b8846a')}

      {px(5, 8, 6, 1, '#f43f5e')}
      {px(4, 9, 8, 1, '#e11d48')}
      {px(4, 10, 8, 1, '#be123c')}
      {px(4, 11, 8, 1, '#be123c')}

      {px(6, 8, 1, 1, '#ffffff')}
      {px(7, 9, 2, 1, '#ffffff')}
      {px(9, 8, 1, 1, '#ffffff')}

      {px(3, 9, 1, 2, '#c9a07a')}
      {px(12, 9, 1, 2, '#c9a07a')}
      {px(2, 11, 2, 1, '#c9a07a')}
      {px(12, 11, 2, 1, '#c9a07a')}

      {px(1, 10, 2, 2, '#f59e0b')}

      {px(5, 12, 2, 3, '#1a1a2e')}
      {px(9, 12, 2, 3, '#1a1a2e')}
      {px(4, 15, 3, 1, '#f43f5e')}
      {px(9, 15, 3, 1, '#f43f5e')}
    </svg>
  );
}
