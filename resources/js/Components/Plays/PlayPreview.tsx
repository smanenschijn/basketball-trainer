import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Circle, Arrow, Text, Group } from 'react-konva';
import Court, { getCourtHeight } from './Court';
import type { PlayCanvasData } from '@/types';

/** The width PlayDesigner uses — all canvas_data coordinates are relative to this. */
const DESIGNER_WIDTH = 500;
const DESIGNER_PLAYER_RADIUS = 20;

interface PlayPreviewProps {
    canvasData: PlayCanvasData;
    courtType: 'half' | 'full';
    /** Fixed width in pixels. If omitted, fills the container width. */
    width?: number;
    /** Extra CSS classes for the wrapper div */
    className?: string;
}

export default function PlayPreview({
    canvasData,
    courtType,
    width: fixedWidth,
    className = '',
}: PlayPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [measuredWidth, setMeasuredWidth] = useState<number | null>(fixedWidth ?? null);

    useEffect(() => {
        if (fixedWidth) {
            setMeasuredWidth(fixedWidth);
            return;
        }
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setMeasuredWidth(Math.floor(entry.contentRect.width));
            }
        });
        observer.observe(el);
        // Set initial value
        setMeasuredWidth(Math.floor(el.getBoundingClientRect().width));
        return () => observer.disconnect();
    }, [fixedWidth]);

    const width = measuredWidth ?? DESIGNER_WIDTH;
    const scale = width / DESIGNER_WIDTH;
    const courtHeight = getCourtHeight(width, courtType);
    const r = DESIGNER_PLAYER_RADIUS * scale;
    const fontSize = Math.max(8, 16 * scale);

    return (
        <div ref={containerRef} className={`overflow-hidden ${className}`}>
            {measuredWidth !== null && (
                <Stage width={width} height={courtHeight} listening={false}>
                    {/* Court background */}
                    <Layer>
                        <Court width={width} courtType={courtType} />
                    </Layer>

                    {/* Lines */}
                    <Layer>
                        {canvasData.lines.map((line) => (
                            <Arrow
                                key={line.id}
                                points={line.points.map((p) => p * scale)}
                                stroke="#000000"
                                strokeWidth={Math.max(1, 3 * scale)}
                                fill="#000000"
                                pointerLength={Math.max(4, 10 * scale)}
                                pointerWidth={Math.max(3, 8 * scale)}
                                dash={line.dashed ? [10 * scale, 5 * scale] : undefined}
                                listening={false}
                            />
                        ))}
                    </Layer>

                    {/* Players */}
                    <Layer>
                        {canvasData.players.map((player) => (
                            <Group
                                key={player.id}
                                x={player.x * scale}
                                y={player.y * scale}
                                listening={false}
                            >
                                <Circle
                                    radius={r}
                                    fill={player.team === 'yellow' ? '#facc15' : '#ef4444'}
                                    stroke={player.team === 'yellow' ? '#a16207' : '#991b1b'}
                                    strokeWidth={Math.max(1, 2 * scale)}
                                />
                                <Text
                                    text={player.label}
                                    fontSize={fontSize}
                                    fontStyle="bold"
                                    fill={player.team === 'yellow' ? '#000' : '#fff'}
                                    align="center"
                                    verticalAlign="middle"
                                    width={r * 2}
                                    height={r * 2}
                                    offsetX={r}
                                    offsetY={r}
                                />
                            </Group>
                        ))}
                    </Layer>
                </Stage>
            )}
        </div>
    );
}
