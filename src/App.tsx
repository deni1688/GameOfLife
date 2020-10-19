import React, { useCallback, useEffect, useRef, useState } from 'react';

const cellSize = 25;

type CellProps = { cellState: number, toggleCellState: (n: number) => void };

enum cell { ALIVE = 1, DEAD = 0 };

function Cell({ cellState, toggleCellState }: CellProps) {
    return <div style={{
        width: cellSize + 'px',
        height: cellSize + 'px',
        border: "1pt solid black",
        backgroundColor: cellState ? "black" : undefined,
    }} onClick={() => cellState ? toggleCellState(cell.DEAD) : toggleCellState(cell.ALIVE)} />
}

function gridWith(gridSize: number, cellState: number) {
    return [...Array(gridSize).keys()].map(() => Array(gridSize).fill(cellState));
}

function countLiving(grid: any[][], row: number, col: number, gridSize: number) {
    return [[0, 1], [0, -1], [1, -1], [-1, 1], [1, 1], [-1, -1], [1, 0], [-1, 0]].reduce((living, [x, y]) => {
        const nRow = x + row;
        const nCol = y + col;

        const isRowInGrid = nRow >= 0 && nRow < gridSize;
        const isColInGrid = nCol >= 0 && nCol < gridSize;
        const isInGrid = isRowInGrid && isColInGrid;

        return isInGrid ? living += grid[nRow][nCol] : living;
    }, 0);
}

function deepCopy(g: number[][]): number[][] {
    return JSON.parse(JSON.stringify(g));
}

function App() {
    const [gridSize, setGriSize] = useState(32);
    const [grid, setGrid] = useState(() => {
        return gridWith(gridSize, cell.DEAD);
    });

    const [generation, setGeneration] = useState(cell.DEAD);
    const [running, setRunning] = useState(false);

    const generationRef = useRef(generation);
    const runningRef = useRef(running);

    runningRef.current = running;
    generationRef.current = generation;

    useEffect(() => {
        setGrid(gridWith(gridSize, cell.DEAD));
        setGeneration(0);
    }, [gridSize]);

    const runSimulation = useCallback(() => {
        if (!runningRef.current) {
            return;
        }

        setGrid(g => {
            const gc = deepCopy(g);

            gc.forEach((r, row) => r.forEach((_, col) => {
                const living = countLiving(g, row, col, gridSize);

                if (living < 2 || living > 3) {
                    gc[row][col] = cell.DEAD;
                    return;
                }

                if (g[row][col] === cell.DEAD && living === 3) {
                    gc[row][col] = cell.ALIVE;
                    return;
                }
            }));

            return gc;
        });

        setGeneration(++generationRef.current);
        setTimeout(runSimulation, 100);
    }, []);

    return (
        <div>
            <div className="d-flex align-item-center p-2">
                <button className="btn btn-primary" onClick={() => {
                    setRunning(!running);
                    runningRef.current = !running;
                    runSimulation();
                }}>
                    {running ? 'Stop Simulation' : 'Start Simulation'}
                </button>
                <button className="btn btn-primary ml-2" disabled={running} onClick={() => {
                    setGrid(gridWith(gridSize, 0));
                    setGeneration(0);
                }}>
                    Clear
                </button>
                <div className="d-flex align-item-center p-2">
                    <input disabled={running} type="range" value={gridSize} min={32} max={64}
                        onChange={e => setGriSize(parseInt(e.target.value))} />
                    <label className="ml-2 mt-2">{gridSize}&times;{gridSize}</label>
                </div>
                <div className="p-3 border border-dark rounded">Generation: {generation}</div>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                gap: '1px 2px'
            }}>
                {grid.map((r, ri) => r.map((c, ci) => <Cell
                    key={`${ri}-${ci}`}
                    cellState={c}
                    toggleCellState={(v: number) => setGrid(g => {
                        const gc = deepCopy(g);
                        gc[ri][ci] = v;

                        return gc;
                    })}
                />))}
            </div>
        </div>
    );
}

export default App;

