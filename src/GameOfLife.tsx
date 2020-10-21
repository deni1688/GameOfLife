import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

enum cell { ALIVE = 1, DEAD = 0 };
const cellSize = 20;

function createGridWith(gridSize: number, cellState: number) {
    return Array(gridSize*gridSize).fill(cellState);
}

function countLiving(grid: number[], ci: number, gridSize: number) {
    return [1, -1, gridSize, -gridSize, gridSize+1, gridSize-1, -gridSize+1, -gridSize-1].reduce((living, pos) => {
        const nPos = pos + ci;

        const isInGrid = grid[nPos] >= 0 && grid[nPos] < (gridSize*gridSize);

        return isInGrid ? living += grid[nPos]: living;
    }, 0);
}

function deepCopy(grid: number[]): number[] {
    return JSON.parse(JSON.stringify(grid));
}

function Cell({ isAlive, toggleCellState }: { isAlive: boolean, toggleCellState: (n: number) => void }) {
    return <div style={{
        width: cellSize + 'px',
        height: cellSize + 'px',
        border: `1pt solid ${isAlive ? "#e83e8c" : "#ccc"}`,
        backgroundColor: isAlive ? "#e83e8c" : undefined,
    }} onClick={() => isAlive ? toggleCellState(cell.DEAD) : toggleCellState(cell.ALIVE)} />
}

function GameOfLife() {
    const [gridSize, setGriSize] = useState(30);
    const [grid, setGrid] = useState(() => {
        return createGridWith(gridSize, cell.DEAD);
    });

    const [generation, setGeneration] = useState(cell.DEAD);
    const [running, setRunning] = useState(false);

    const generationRef = useRef(generation);
    const runningRef = useRef(running);

    runningRef.current = running;
    generationRef.current = generation;

    useEffect(() => {
        setGrid(createGridWith(gridSize, cell.DEAD));
        setGeneration(0);
    }, [gridSize]);

    const startGameOfLife = useCallback(() => {
        if (!runningRef.current) { return; }

        setGrid(g => {
            const gc = deepCopy(g);
            const gridSizeSquared = gridSize * gridSize;

            for (let ci = 0; ci < gridSizeSquared; ci++) {
                const living = countLiving(g, ci, gridSize);
                

                if (living < 2 || living > 3) {
                    gc[ci] = cell.DEAD;
                    continue;
                }

                if (g[ci] === cell.DEAD && living === 3) {
                    gc[ci] = cell.ALIVE;
                    continue;
                }
            }

            return gc;
        });

        setGeneration(++generationRef.current);
        setTimeout(startGameOfLife, 100);
    }, []);

    const toggleCellState = useCallback((ci: number) => (v: number) => setGrid(g => {
        const gc = deepCopy(g);
        gc[ci] = v;

        return gc;
    }), []);

    return (
        <div className="p-3">
            <div className="d-flex align-item-center pb-3">
                <button className="btn btn-primary" onClick={() => {
                    setRunning(!running);
                    runningRef.current = !running;
                    startGameOfLife();
                }}>
                    {running ? 'Stop Simulation' : 'Start Simulation'}
                </button>
                <button className="btn btn-primary ml-2" disabled={running} onClick={() => {
                    setGrid(createGridWith(gridSize, cell.DEAD));
                    setGeneration(0);
                }}>
                    Reset
                </button>
                <button className="btn btn-primary ml-2" disabled={running} onClick={() => setGrid(
                    Array.from(Array(gridSize*gridSize), () => (Math.random() > .8 ? 1 : 0))
                )}>
                    Random
                </button>
                <div className="d-flex align-item-center p-2">
                    <input disabled={running} type="range" value={gridSize} min={36} max={64}
                        onChange={e => setGriSize(parseInt(e.target.value))} />
                    <label className="ml-2 mt-2">{gridSize}&times;{gridSize}</label>
                </div>
                <div className="p-3 border border-dark rounded">Generation: {generation}</div>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
            }}>
                {grid.map((c, ci) => <Cell key={ci} isAlive={!!c} toggleCellState={toggleCellState(ci)}/>)}
            </div>
        </div>
    );
}

ReactDOM.render(<GameOfLife />, document.getElementById('root'));