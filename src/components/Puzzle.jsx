import React, { useState, useEffect } from 'react';
import './Puzzle.css';

const GRID_SIZE = 3; // 3x3 grid
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

const Puzzle = () => {
  const [tiles, setTiles] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize ordered tiles
  const initTiles = () => {
    const newTiles = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    setTiles(newTiles);
    setIsSolved(true);
    setMoves(0);
    setGameStarted(false);
  };

  useEffect(() => {
    initTiles();
  }, []);

  const shuffle = () => {
    let newTiles = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    
    // Perform random valid moves to ensure solvability
    // Just shuffling would sometimes result in unsolvable puzzles
    for (let i = 0; i < 200; i++) {
      const emptyIndex = newTiles.indexOf(TOTAL_TILES - 1);
      const possibleMoves = [];
      const row = Math.floor(emptyIndex / GRID_SIZE);
      const col = emptyIndex % GRID_SIZE;

      if (row > 0) possibleMoves.push(emptyIndex - GRID_SIZE);
      if (row < GRID_SIZE - 1) possibleMoves.push(emptyIndex + GRID_SIZE);
      if (col > 0) possibleMoves.push(emptyIndex - 1);
      if (col < GRID_SIZE - 1) possibleMoves.push(emptyIndex + 1);

      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      [newTiles[emptyIndex], newTiles[randomMove]] = [newTiles[randomMove], newTiles[emptyIndex]];
    }

    setTiles(newTiles);
    setIsSolved(false);
    setMoves(0);
    setGameStarted(true);
  };

  const handleTileClick = (index) => {
    if (isSolved || !gameStarted) return;

    const emptyIndex = tiles.indexOf(TOTAL_TILES - 1);
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
    const emptyCol = emptyIndex % GRID_SIZE;

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(moves + 1);
      checkSolved(newTiles);
    }
  };

  const checkSolved = (currentTiles) => {
    const solved = currentTiles.every((tile, index) => tile === index);
    if (solved) {
      setIsSolved(true);
    }
  };

  const getTileStyle = (tileValue) => {
    if (tileValue === TOTAL_TILES - 1 && !isSolved) {
      return { opacity: 0 }; // Hidden tile
    }

    const row = Math.floor(tileValue / GRID_SIZE);
    const col = tileValue % GRID_SIZE;

    return {
      backgroundImage: `url('/engage.jpeg')`,
      backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
      backgroundPosition: `${(col * 100) / (GRID_SIZE - 1)}% ${(row * 100) / (GRID_SIZE - 1)}%`,
    };
  };

  return (
    <section className="section puzzle-section" id="puzzle">
      <div className="section-header reveal">
        <h2 className="gold-text">Solve our Memory</h2>
        <div className="divider"></div>
        <p className="subtitle">Piece together our journey in this engagement puzzle!</p>
      </div>

      <div className="puzzle-container reveal">
        <div className="puzzle-stats">
          <span>Moves: {moves}</span>
          <button className="btn-gold shuffle-btn" onClick={shuffle}>
            {gameStarted && !isSolved ? 'Reset' : 'Start Puzzle'}
          </button>
        </div>

        <div className={`puzzle-board ${isSolved ? 'solved' : ''}`}>
          {tiles.map((tile, index) => (
            <div
              key={index}
              className={`puzzle-tile ${tile === TOTAL_TILES - 1 ? 'empty' : ''}`}
              style={getTileStyle(tile)}
              onClick={() => handleTileClick(index)}
            />
          ))}
        </div>

        <div className="puzzle-hint-container">
          <p className="hint-label">Reference Image:</p>
          <img src="/engage.jpeg" alt="Engagement Hint" className="hint-image" />
        </div>

        {isSolved && gameStarted && (
          <div className="puzzle-success-message">
            <h3>You solved it! 🎉</h3>
            <p>Our beautiful engagement memory is complete.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Puzzle;
