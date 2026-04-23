import { useCallback, useRef, useState } from 'react';
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

const COURT_WIDTH = 500;
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
    const [tool, setTool] = useState<Tool>('select');
    const [drawTeam, setDrawTeam] = useState<'yellow' | 'red'>('yellow');
    const [dashedLine, setDashedLine] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [drawingLine, setDrawingLine] = useState<number[] | null>(null);
    const [undoStack, setUndoStack] = useState<PlayCanvasData[]>([]);

    const courtHeight = getCourtHeight(COURT_WIDTH, courtType);

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
            x: COURT_WIDTH / 2 + (team === 'yellow' ? -40 : 40),
            y: courtHeight / 2,
            label: String(existingCount + 1),
        };
        onChange({
            ...canvasData,
            players: [...canvasData.players, newPlayer],
        });
    };

    const handlePlayerDragEnd = (id: string, x: number, y: number) => {
        pushUndo();
        onChange({
            ...canvasData,
            players: canvasData.players.map(p =>
                p.id === id ? { ...p, x: Math.max(PLAYER_RADIUS, Math.min(COURT_WIDTH - PLAYER_RADIUS, x)), y: Math.max(PLAYER_RADIUS, Math.min(courtHeight - PLAYER_RADIUS, y)) } : p
            ),
        });
    };

    const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (readOnly || tool !== 'draw') return;
        const stage = stageRef.current;
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        setDrawingLine([pos.x, pos.y]);
    };

    const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (readOnly || tool !== 'draw' || !drawingLine) return;
        const stage = stageRef.current;
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;

        // Only create line if it has meaningful length
        const dx = pos.x - drawingLine[0];
        const dy = pos.y - drawingLine[1];
        if (Math.sqrt(dx * dx + dy * dy) > 10) {
            pushUndo();
            const newLine: PlayLine = {
                id: `l-${Date.now()}`,
                points: [...drawingLine, pos.x, pos.y],
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

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            {!readOnly && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-100 p-3">
                    {/* Court type toggle */}
                    <div className="flex rounded-md border border-gray-300 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => onCourtTypeChange('half')}
                            className={`px-3 py-1.5 text-sm font-medium ${courtType === 'half' ? 'bg-brand-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            {t('plays.halfCourt')}
                        </button>
                        <button
                            type="button"
                            onClick={() => onCourtTypeChange('full')}
                            className={`px-3 py-1.5 text-sm font-medium ${courtType === 'full' ? 'bg-brand-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            {t('plays.fullCourt')}
                        </button>
                    </div>

                    <div className="mx-2 h-6 w-px bg-gray-300" />

                    {/* Add players */}
                    <button
                        type="button"
                        onClick={() => addPlayer('yellow')}
                        className="inline-flex items-center gap-1.5 rounded-md bg-yellow-400 px-3 py-1.5 text-sm font-medium text-black hover:bg-yellow-500"
                    >
                        <span className="h-3 w-3 rounded-full bg-yellow-600" />
                        + {t('plays.yellowTeam')}
                    </button>
                    <button
                        type="button"
                        onClick={() => addPlayer('red')}
                        className="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                    >
                        <span className="h-3 w-3 rounded-full bg-red-700" />
                        + {t('plays.redTeam')}
                    </button>

                    <div className="mx-2 h-6 w-px bg-gray-300" />

                    {/* Tool selection */}
                    <button
                        type="button"
                        onClick={() => setTool('select')}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${tool === 'select' ? 'bg-brand-black text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    >
                        <svg className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        Select
                    </button>
                    <button
                        type="button"
                        onClick={() => setTool('draw')}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${tool === 'draw' ? 'bg-brand-black text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    >
                        <svg className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        {t('plays.drawLine')}
                    </button>

                    {tool === 'draw' && (
                        <button
                            type="button"
                            onClick={() => setDashedLine(!dashedLine)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${dashedLine ? 'bg-gray-700 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                        >
                            {dashedLine ? t('plays.dashedLine') : t('plays.solidLine')}
                        </button>
                    )}

                    <div className="mx-2 h-6 w-px bg-gray-300" />

                    {/* Actions */}
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={!selectedId}
                        className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-600 border border-gray-300 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {t('plays.eraser')}
                    </button>
                    <button
                        type="button"
                        onClick={handleUndo}
                        disabled={undoStack.length === 0}
                        className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {t('plays.undo')}
                    </button>
                </div>
            )}

            {/* Canvas */}
            <div className="overflow-auto rounded-lg border-2 border-gray-300 bg-gray-200 inline-block">
                <Stage
                    ref={stageRef}
                    width={COURT_WIDTH}
                    height={courtHeight}
                    onMouseDown={handleStageMouseDown}
                    onMouseUp={handleStageMouseUp}
                    onClick={handleStageClick}
                    style={{ cursor: tool === 'draw' ? 'crosshair' : 'default' }}
                >
                    {/* Court background */}
                    <Layer>
                        <Court width={COURT_WIDTH} courtType={courtType} />
                    </Layer>

                    {/* Lines layer */}
                    <Layer>
                        {canvasData.lines.map((line) => (
                            <Arrow
                                key={line.id}
                                points={line.points}
                                stroke={selectedId === line.id ? '#3b82f6' : '#000000'}
                                strokeWidth={selectedId === line.id ? 4 : 3}
                                fill={selectedId === line.id ? '#3b82f6' : '#000000'}
                                pointerLength={10}
                                pointerWidth={8}
                                dash={line.dashed ? [10, 5] : undefined}
                                onClick={() => !readOnly && setSelectedId(line.id)}
                                onTap={() => !readOnly && setSelectedId(line.id)}
                                hitStrokeWidth={15}
                            />
                        ))}
                        {/* Drawing preview line */}
                        {drawingLine && (
                            <Arrow
                                points={drawingLine}
                                stroke="#666"
                                strokeWidth={2}
                                pointerLength={8}
                                pointerWidth={6}
                                dash={dashedLine ? [10, 5] : undefined}
                                listening={false}
                            />
                        )}
                    </Layer>

                    {/* Players layer */}
                    <Layer>
                        {canvasData.players.map((player) => (
                            <Group
                                key={player.id}
                                x={player.x}
                                y={player.y}
                                draggable={!readOnly && tool === 'select'}
                                onDragEnd={(e) => handlePlayerDragEnd(player.id, e.target.x(), e.target.y())}
                                onClick={() => !readOnly && setSelectedId(player.id)}
                                onTap={() => !readOnly && setSelectedId(player.id)}
                            >
                                {/* Selection ring */}
                                {selectedId === player.id && (
                                    <Circle
                                        radius={PLAYER_RADIUS + 4}
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                    />
                                )}
                                <Circle
                                    radius={PLAYER_RADIUS}
                                    fill={player.team === 'yellow' ? '#facc15' : '#ef4444'}
                                    stroke={player.team === 'yellow' ? '#a16207' : '#991b1b'}
                                    strokeWidth={2}
                                />
                                <Text
                                    text={player.label}
                                    fontSize={16}
                                    fontStyle="bold"
                                    fill={player.team === 'yellow' ? '#000' : '#fff'}
                                    align="center"
                                    verticalAlign="middle"
                                    width={PLAYER_RADIUS * 2}
                                    height={PLAYER_RADIUS * 2}
                                    offsetX={PLAYER_RADIUS}
                                    offsetY={PLAYER_RADIUS}
                                />
                            </Group>
                        ))}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}
