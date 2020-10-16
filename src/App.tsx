import React, {useEffect, useState} from 'react';

const CELL_SIZE = 15

type CellProps = { c: number, setLife: (n: number) => void };

function Cell({c, setLife}: CellProps) {
    return <div style={{
        width: CELL_SIZE + 'px',
        height: CELL_SIZE + 'px',
        backgroundColor: c ? "green" : "",
        border: "1pt solid green",
    }} onClick={() => c ? setLife(0) : setLife(1)}/>;
}

function App() {
    const [grid, setGrid] = useState([] as Array<number[]>);
    const [rows] = useState(40);
    const [cols] = useState(80);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        setGrid(Array(rows).fill(0).map(() => Array(cols).fill(0)));
    }, [rows, cols, setGrid]);



    return (
        <div>
            <div>
                <button style={{margin: '10px 10px'}} onClick={() => setRunning(!running)}>
                    {running ? 'Stop Simulation' : 'Start Simulation'}
                </button>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
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
