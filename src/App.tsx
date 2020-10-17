import React, {useCallback, useEffect, useRef, useState} from 'react';

const CELL_SIZE = 15;

const ops = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0]
];

type CellProps = { c: number, setLife: (n: number) => void };

function Cell({c, setLife}: CellProps) {
    return <div style={{
        width: CELL_SIZE + 'px',
        height: CELL_SIZE + 'px',
        border: "1pt solid black",
        backgroundColor: c ? "#000" : "",
    }} onClick={() => c ? setLife(0) : setLife(1)}/>;
}

function App() {
    const [gridSize, setGriSize] = useState(30);
    const [grid, setGrid] = useState(() => {
        return Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    });

    useEffect(() => {
        setGrid(Array(gridSize).fill(0).map(() => Array(gridSize).fill(0)))
    }, [gridSize]);

    const [running, setRunning] = useState(false);

    const runningRef = useRef(running);
    runningRef.current = running;

    const runSimulation = useCallback(() => {
        if (!runningRef.current) {
            return;
        }

        setGrid(grid => {
            const gridCopy = grid.slice();

            gridCopy.forEach((r, ri) => r.forEach((c, ci) => {
                let n = 0;
                ops.forEach(([x, y]) => {
                    const newRi = ri + x;
                    const newCi = ci + y;
                    if (newRi >= 0 && newRi < gridSize && newCi >= 0 && newCi < gridSize) {
                        n += gridCopy[newRi][newCi];
                    }
                });

                if (n < 2 || n > 3) {
                    gridCopy[ri][ci] = 0;
                } else if (gridCopy[ri][ci] === 0 && n === 3) {
                    gridCopy[ri][ci] = 1;
                }

            }));

            return gridCopy;
        });

        setTimeout(runSimulation, 1000);
    }, []);

    return (
        <div>
            <div>
                <button style={{margin: '10px 10px'}} onClick={() => {
                    setRunning(!running);
                    runningRef.current = !running;
                    runSimulation();
                }}>
                    {running ? 'Stop Simulation' : 'Start Simulation'}
                </button>
                <input disabled={running} type="range" value={gridSize} min={30} max={60}
                       onChange={e => setGriSize(parseInt(e.target.value))}/>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, ${CELL_SIZE}px)`,
                gap: '1px 4px'
            }}>
                {grid.map((r, ri) => r.map((c, ci) => <Cell
                    key={`${ri}-${ci}`}
                    c={c}
                    setLife={(v: number) => setGrid(grid => {
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
