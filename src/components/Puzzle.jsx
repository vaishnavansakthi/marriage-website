import React, { useState, useEffect } from 'react';
import './Puzzle.css';

const GRID_SIZE = 3; // 3x3 grid
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

const Puzzle = () => {
  const [tiles, setTiles] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestTime, setBestTime] = useState(localStorage.getItem('puzzle-best-time') || null);

  // Timer logic
  useEffect(() => {
    let interval;
    if (gameStarted && !isSolved) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isSolved]);

  // Format time
  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize ordered tiles
  const initTiles = () => {
    const newTiles = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    setTiles(newTiles);
    setIsSolved(true);
    setMoves(0);
    setSeconds(0);
    setGameStarted(false);
  };

  useEffect(() => {
    initTiles();
  }, []);

  const shuffle = () => {
    let newTiles = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    
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
    setSeconds(0);
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
      // Save best time
      if (!bestTime || seconds < parseInt(bestTime)) {
        setBestTime(seconds.toString());
        localStorage.setItem('puzzle-best-time', seconds.toString());
      }
    }
  };

  const getTileStyle = (tileValue, currentIndex) => {
    const isCorrect = tileValue === currentIndex;
    
    if (tileValue === TOTAL_TILES - 1 && !isSolved) {
      return { opacity: 0 };
    }

    const row = Math.floor(tileValue / GRID_SIZE);
    const col = tileValue % GRID_SIZE;

    return {
      backgroundImage: `url('/engage.jpeg')`,
      backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
      backgroundPosition: `${(col * 100) / (GRID_SIZE - 1)}% ${(row * 100) / (GRID_SIZE - 1)}%`,
      border: isCorrect && gameStarted && !isSolved ? '2px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255,255,255,0.1)'
    };
  };

  return (
    <section className="section puzzle-section" id="puzzle">
      <div className="section-header reveal">
        <h2 className="gold-text">Our Engagement Puzzle</h2>
        <div className="divider"></div>
        <p className="subtitle">Relive our special moment by completing the picture! ✨</p>
      </div>

      <div className="puzzle-container reveal">
        <div className="game-status-bar">
          <div className="stat-item">
            <span className="stat-label">MOVES</span>
            <span className="stat-value">{moves}</span>
          </div>
          <button className="game-btn shuffle-btn" onClick={shuffle}>
            {gameStarted && !isSolved ? 'RESET GAME' : 'START PLAYING'}
          </button>
          <div className="stat-item">
            <span className="stat-label">TIME</span>
            <span className="stat-value">{formatTime(seconds)}</span>
          </div>
        </div>

        {bestTime && (
          <div className="best-score">
            🏆 Best Time: {formatTime(parseInt(bestTime))}
          </div>
        )}

        <div className={`puzzle-board ${isSolved ? 'solved' : ''} ${gameStarted && !isSolved ? 'in-progress' : ''}`}>
          {tiles.map((tile, index) => (
            <div
              key={index}
              className={`puzzle-tile ${tile === TOTAL_TILES - 1 ? 'empty' : ''} ${tile === index && gameStarted && !isSolved ? 'correct' : ''}`}
              style={getTileStyle(tile, index)}
              onClick={() => handleTileClick(index)}
            />
          ))}
        </div>

        <div className="puzzle-meta">
          <div className="puzzle-hint-container">
            <p className="hint-label">Final Image Preview</p>
            <img src="/engage.jpeg" alt="Engagement Hint" className="hint-image" />
          </div>
        </div>

        {isSolved && gameStarted && (
          <div className="puzzle-success-message">
            <h3>LEGENDARY! 🎉</h3>
            <p>You completed the memory in {moves} moves and {formatTime(seconds)}!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Puzzle;
