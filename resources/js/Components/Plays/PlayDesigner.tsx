import { useCallback, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Circle, Arrow, Text, Group } from 'react-konva';
import { useTranslation } from 'react-i18next';
import Court, { getCourtHeight } from './Court';
import type { PlayPlayer, PlayLine, PlayCanvasData } from '@/types';
import type Konva from 'konva';

interface PlayDesignerProps {
    canvasData: PlayCanvasData;
    courtType: 'half' | 'full';
    onChange: (data: PlayCanvasData) => void;
    onCourtTypeChange: (type: 'half' | 'full') => void;
    readOnly?: boolean;
}

/** Canonical coordinate space width — all stored data uses this base. */
const BASE_WIDTH = 500;
const PLAYER_RADIUS = 20;

type Tool = 'select' | 'draw';

export default function PlayDesigner({
    canvasData,
    courtType,
    onChange,
    onCourtTypeChange,
    readOnly = false,
}: PlayDesignerProps) {
    const { t } = useTranslation();
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tool, setTool] = useState<Tool>('select');
    const [drawTeam, setDrawTeam] = useState<'yellow' | 'red'>('yellow');
    const [dashedLine, setDashedLine] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [drawingLine, setDrawingLine] = useState<number[] | null>(null);
    const [undoStack, setUndoStack] = useState<PlayCanvasData[]>([]);
    const [canvasWidth, setCanvasWidth] = useState(BASE_WIDTH);

    // Measure container and update canvas width
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setCanvasWidth(Math.floor(entry.contentRect.width));
            }
        });
        observer.observe(el);
        setCanvasWidth(Math.floor(el.getBoundingClientRect().width));
        return () => observer.disconnect();
    }, []);

    const scale = canvasWidth / BASE_WIDTH;
    const courtHeight = getCourtHeight(canvasWidth, courtType);
    const baseCourtHeight = getCourtHeight(BASE_WIDTH, courtType);
    const r = PLAYER_RADIUS * scale;

    /** Convert screen position to canonical coordinates */
    const toBase = useCallback((x: number, y: number) => ({
        x: x / scale,
        y: y / scale,
    }), [scale]);

    const pushUndo = useCallback(() => {
        setUndoStack(prev => [...prev.slice(-20), { ...canvasData, players: [...canvasData.players], lines: [...canvasData.lines] }]);
    }, [canvasData]);

    const handleUndo = useCallback(() => {
        if (undoStack.length === 0) return;
        const prev = undoStack[undoStack.length - 1];
        setUndoStack(s => s.slice(0, -1));
        onChange(prev);
    }, [undoStack, onChange]);

    const addPlayer = (team: 'yellow' | 'red') => {
        pushUndo();
        const existingCount = canvasData.players.filter(p => p.team === team).length;
        const newPlayer: PlayPlayer = {
            id: `p-${Date.now()}`,
            team,
            x: BASE_WIDTH / 2 + (team === 'yellow' ? -40 : 40),
            y: baseCourtHeight / 2,
            label: String(existingCount + 1),
        };
        onChange({
            ...canvasData,
            players: [...canvasData.players, newPlayer],
        });
    };

    const handleLineDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
        pushUndo();
        const node = e.target;
        const dx = node.x() / scale;
        const dy = node.y() / scale;
        // Reset node position (offset is baked into the points)
        node.position({ x: 0, y: 0 });
        onChange({
            ...canvasData,
            lines: canvasData.lines.map(l =>
                l.id === id ? {
                    ...l,
                    points: l.points.map((p, i) => p + (i % 2 === 0 ? dx : dy)),
                } : l
            ),
        });
    };

    const handlePlayerDragEnd = (id: string, screenX: number, screenY: number) => {
        pushUndo();
        const base = toBase(screenX, screenY);
        onChange({
            ...canvasData,
            players: canvasData.players.map(p =>
                p.id === id ? {
                    ...p,
                    x: Math.max(PLAYER_RADIUS, Math.min(BASE_WIDTH - PLAYER_RADIUS, base.x)),
                    y: Math.max(PLAYER_RADIUS, Math.min(baseCourtHeight - PLAYER_RADIUS, base.y)),
                } : p
            ),
        });
    };

    const handleDrawStart = () => {
        if (readOnly || tool !== 'draw') return;
        const stage = stageRef.current;
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        setDrawingLine([pos.x, pos.y]);
    };

    const handleDrawEnd = () => {
        if (readOnly || tool !== 'draw' || !drawingLine) return;
        const stage = stageRef.current;
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;

        const dx = pos.x - drawingLine[0];
        const dy = pos.y - drawingLine[1];
        if (Math.sqrt(dx * dx + dy * dy) > 10 * scale) {
            pushUndo();
            // Convert to base coordinates for storage
            const startBase = toBase(drawingLine[0], drawingLine[1]);
            const endBase = toBase(pos.x, pos.y);
            const newLine: PlayLine = {
                id: `l-${Date.now()}`,
                points: [startBase.x, startBase.y, endBase.x, endBase.y],
                dashed: dashedLine,
            };
            onChange({
                ...canvasData,
                lines: [...canvasData.lines, newLine],
            });
        }
        setDrawingLine(null);
    };

    const handleDelete = () => {
        if (!selectedId) return;
        pushUndo();
        onChange({
            ...canvasData,
            players: canvasData.players.filter(p => p.id !== selectedId),
            lines: canvasData.lines.filter(l => l.id !== selectedId),
        });
        setSelectedId(null);
    };

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.target === e.target.getStage()) {
            setSelectedId(null);
        }
    };

    const canvas = (
        <div ref={containerRef} className="overflow-hidden border-3 border-brand-black bg-gray-200">
            {canvasWidth > 0 && (
                <Stage
                    ref={stageRef}
                    width={canvasWidth}
                    height={courtHeight}
                    onMouseDown={handleDrawStart}
                    onMouseUp={handleDrawEnd}
                    onTouchStart={handleDrawStart}
                    onTouchEnd={handleDrawEnd}
                    onClick={handleStageClick}
                    style={{ cursor: tool === 'draw' ? 'crosshair' : 'default' }}
                >
                    <Layer>
                        <Court width={canvasWidth} courtType={courtType} />
                    </Layer>

                    <Layer>
                        {canvasData.lines.map((line) => (
                            <Arrow
                                key={line.id}
                                points={line.points.map(p => p * scale)}
                                stroke={selectedId === line.id ? '#3b82f6' : '#000000'}
                                strokeWidth={Math.max(2, (selectedId === line.id ? 4 : 3) * scale)}
                                fill={selectedId === line.id ? '#3b82f6' : '#000000'}
                                pointerLength={Math.max(4, 10 * scale)}
                                pointerWidth={Math.max(3, 8 * scale)}
                                dash={line.dashed ? [10 * scale, 5 * scale] : undefined}
                                draggable={!readOnly && tool === 'select'}
                                onDragEnd={(e) => handleLineDragEnd(line.id, e)}
                                onClick={() => !readOnly && setSelectedId(line.id)}
                                onTap={() => !readOnly && setSelectedId(line.id)}
                                hitStrokeWidth={15 * scale}
                            />
                        ))}
                        {drawingLine && (
                            <Arrow
                                points={drawingLine}
                                stroke="#666"
                                strokeWidth={2 * scale}
                                pointerLength={8 * scale}
                                pointerWidth={6 * scale}
                                dash={dashedLine ? [10 * scale, 5 * scale] : undefined}
                                listening={false}
                            />
                        )}
                    </Layer>

                    <Layer>
                        {canvasData.players.map((player) => (
                            <Group
                                key={player.id}
                                x={player.x * scale}
                                y={player.y * scale}
                                draggable={!readOnly && tool === 'select'}
                                onDragEnd={(e) => handlePlayerDragEnd(player.id, e.target.x(), e.target.y())}
                                onClick={() => !readOnly && setSelectedId(player.id)}
                                onTap={() => !readOnly && setSelectedId(player.id)}
                            >
                                {selectedId === player.id && (
                                    <Circle
                                        radius={r + 4 * scale}
                                        stroke="#3b82f6"
                                        strokeWidth={3 * scale}
                                    />
                                )}
                                <Circle
                                    radius={r}
                                    fill={player.team === 'yellow' ? '#facc15' : '#ef4444'}
                                    stroke={player.team === 'yellow' ? '#a16207' : '#991b1b'}
                                    strokeWidth={2 * scale}
                                />
                                <Text
                                    text={player.label}
                                    fontSize={Math.max(8, 16 * scale)}
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

    if (readOnly) {
        return canvas;
    }

    const controls = (
        <div className="border-3 border-brand-black bg-white p-5 shadow-brutal">
            {/* Court type */}
            <div className="mb-5">
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-brand-black">
                    {t('plays.courtType')}
                </h3>
                <div className="flex overflow-hidden border-2 border-brand-black">
                    <button
                        type="button"
                        onClick={() => onCourtTypeChange('half')}
                        className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider ${courtType === 'half' ? 'bg-brand-black text-brand-gold' : 'bg-white text-brand-black hover:bg-gray-50'}`}
                    >
                        {t('plays.halfCourt')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onCourtTypeChange('full')}
                        className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider ${courtType === 'full' ? 'bg-brand-black text-brand-gold' : 'bg-white text-brand-black hover:bg-gray-50'}`}
                    >
                        {t('plays.fullCourt')}
                    </button>
                </div>
            </div>

            {/* Add players */}
            <div className="mb-5">
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-brand-black">
                    {t('plays.addPlayer')}
                </h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => addPlayer('yellow')}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 border-2 border-yellow-600 bg-yellow-400 px-3 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-yellow-500"
                    >
                        <span className="h-3 w-3 rounded-full bg-yellow-600" />
                        + {t('plays.yellowTeam')}
                    </button>
                    <button
                        type="button"
                        onClick={() => addPlayer('red')}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 border-2 border-red-700 bg-red-500 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600"
                    >
                        <span className="h-3 w-3 rounded-full bg-red-700" />
                        + {t('plays.redTeam')}
                    </button>
                </div>
            </div>

            {/* Tools */}
            <div className="mb-5">
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-brand-black">
                    Tools
                </h3>
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => setTool('select')}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider ${tool === 'select' ? 'bg-brand-black text-brand-gold' : 'border-2 border-brand-black bg-white text-brand-black hover:bg-gray-50'}`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        Select
                    </button>
                    <button
                        type="button"
                        onClick={() => setTool('draw')}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider ${tool === 'draw' ? 'bg-brand-black text-brand-gold' : 'border-2 border-brand-black bg-white text-brand-black hover:bg-gray-50'}`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        {t('plays.drawLine')}
                    </button>

                    {tool === 'draw' && (
                        <button
                            type="button"
                            onClick={() => setDashedLine(!dashedLine)}
                            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider ${dashedLine ? 'bg-gray-700 text-white' : 'border-2 border-brand-black bg-white text-brand-black hover:bg-gray-50'}`}
                        >
                            {dashedLine ? t('plays.dashedLine') : t('plays.solidLine')}
                        </button>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div>
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-brand-black">
                    Actions
                </h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={!selectedId}
                        className="flex-1 border-2 border-red-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {t('plays.eraser')}
                    </button>
                    <button
                        type="button"
                        onClick={handleUndo}
                        disabled={undoStack.length === 0}
                        className="flex-1 border-2 border-brand-black bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {t('plays.undo')}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`grid grid-cols-1 gap-4 ${courtType === 'full' ? 'lg:grid-cols-[55fr_45fr]' : 'lg:grid-cols-[7fr_3fr]'}`}>
            {/* Canvas — left on desktop, top on mobile */}
            <div>{canvas}</div>
            {/* Controls — right on desktop, bottom on mobile */}
            <div>{controls}</div>
        </div>
    );
}
