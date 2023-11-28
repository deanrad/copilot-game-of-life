// @ts-nocheck
import React, {useEffect, useState} from 'react';
import {render, Box, Text} from 'ink';
import {interval} from 'rxjs';
import {startWith, scan} from 'rxjs/operators';

// Initialize a 20x20 grid with random values
const grid = Array.from({length: 20}, () =>
	Array.from({length: 20}, () => (Math.random() > 0.5 ? 1 : 0)),
);

// Function to calculate the next generation of the grid
function calculateNextGeneration(grid) {
	const newGrid = grid.map((row, i) =>
		row.map((cell, j) => {
			const aliveNeighbors = countAliveNeighbors(grid, i, j);
			if (cell === 1 && (aliveNeighbors < 2 || aliveNeighbors > 3)) {
				return 0;
			} else if (cell === 0 && aliveNeighbors === 3) {
				return 1;
			} else {
				return cell;
			}
		}),
	);
	return newGrid;
}

// Function to count the number of alive neighbors for a cell
function countAliveNeighbors(grid, i, j) {
	let aliveNeighbors = 0;
	for (let x = -1; x <= 1; x++) {
		for (let y = -1; y <= 1; y++) {
			if (x === 0 && y === 0) continue;
			const newI = i + x;
			const newJ = j + y;
			if (
				newI >= 0 &&
				newI < grid.length &&
				newJ >= 0 &&
				newJ < grid[0].length &&
				grid[newI][newJ] === 1
			) {
				aliveNeighbors++;
			}
		}
	}
	return aliveNeighbors;
}

// Create an observable of the board state
const boardState$ = interval(750).pipe(
	startWith(grid),
	scan(grid => calculateNextGeneration(grid)),
);

// React component to render the grid
const GameOfLife = () => {
	const [grid, setGrid] = useState([[]]);

	useEffect(() => {
		const subscription = boardState$.subscribe(board => {
			setGrid(board);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return (
		<Box flexDirection="column">
			{grid.map((row, i) => (
				<Box key={i}>
					{row.map((cell, j) => (
						<Text key={j}>{cell === 1 ? '■' : '□'}</Text>
					))}
				</Box>
			))}
		</Box>
	);
};

// Render the game
render(<GameOfLife />);
