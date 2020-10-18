import React, {useCallback, useEffect, useRef, useState} from 'react';

const CELL_SIZE = 15;

const coords = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0]
];

type CellPrcoords = { c: number, setCellState: (n: number) => void };

function Cell({c, setCellState}: CellPrcoords) {
    return <div style={{
        width: CELL_SIZE + 'px',
        height: CELL_SIZE + 'px',
        border: "1pt solid black",
        backgroundColor: c ? "black" : undefined,
    }} onClick={() => c ? setCellState(0) : setCellState(1)}/>
}

function mapGrid(gridSize: number, cellState: number) {
    return [...Array(gridSize).keys()].map(() => Array(gridSize).fill(cellState));
}

function App() {
    const [gridSize, setGriSize] = useState(32);
    const [grid, setGrid] = useState(() => {
        return mapGrid(gridSize, 0);
    });


    useEffect(() => {
        setGrid(mapGrid(gridSize, 0));
    }, [gridSize]);

    const [generation, setEvolutions] = useState(0);
    const [running, setRunning] = useState(false);

    const generationRef = useRef(generation);
    const runningRef = useRef(running);

    runningRef.current = running;
    generationRef.current = generation;

    const runSimulation = useCallback(() => {
        if (!runningRef.current) {
            return;
        }

        setGrid(grid => {
            const gridCopy = grid.slice();

            gridCopy.forEach((r, ri) => r.forEach((c, ci) => {
                let nSum = 0;
                coords.forEach(([x, y]) => {
                    const nRi = ri + x;
                    const nCi = ci + y;

                    const rowInBounds = nRi >= 0 && nRi < gridSize;
                    const columnInBounds = nCi >= 0 && nCi < gridSize;

                    if (rowInBounds && columnInBounds) {
                        nSum += gridCopy[nRi][nCi];
                    }
                });

                if (nSum < 2 || nSum > 3) {
                    gridCopy[ri][ci] = 0;
                    return;
                }

                if (gridCopy[ri][ci] === 0 && nSum === 3) {
                    gridCopy[ri][ci] = 1;
                    return;
                }
            }));

            return gridCopy;
        });
        setEvolutions(generationRef.current + 1);
        setTimeout(runSimulation, 150);
    }, [/* do not update ever */]);

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
                <div className="d-flex align-item-center p-2">
                    <input disabled={running} type="range" value={gridSize} min={32} max={64}
                           onChange={e => setGriSize(parseInt(e.target.value))}/>
                    <label className="ml-2 mt-2">{gridSize}&times;{gridSize}</label>
                </div>
                <div className="p-3 border border-dark rounded">Generation: {generation}</div>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, ${CELL_SIZE}px)`,
                gap: '1px 2px'
            }}>
                {grid.map((r, ri) => r.map((c, ci) => <Cell
                    key={`${ri}-${ci}`}
                    c={c}
                    setCellState={(v: number) => setGrid(grid => {
                        const gridCopy = grid.slice();

                        gridCopy[ri][ci] = v;

                        return gridCopy;
                    })}
                />))}
            </div>
        </div>
    );
}

export default App;
