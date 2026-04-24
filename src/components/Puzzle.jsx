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
  const [isOpen, setIsOpen] = useState(false);
  const [bestTime, setBestTime] = useState(localStorage.getItem('puzzle-best-time') || null);

  // Timer logic
  useEffect(() => {
    let interval;
    if (gameStarted && !isSolved && isOpen) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isSolved, isOpen]);

  // Format time
  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const newTiles = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    setTiles(newTiles);
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
      if (!bestTime || seconds < parseInt(bestTime)) {
        setBestTime(seconds.toString());
        localStorage.setItem('puzzle-best-time', seconds.toString());
      }
    }
  };

  const getTileStyle = (tileValue, currentIndex) => {
    if (tileValue === TOTAL_TILES - 1 && !isSolved) return { opacity: 0 };
    const row = Math.floor(tileValue / GRID_SIZE);
    const col = tileValue % GRID_SIZE;
    return {
      backgroundImage: `url('/engage.jpeg')`,
      backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
      backgroundPosition: `${(col * 100) / (GRID_SIZE - 1)}% ${(row * 100) / (GRID_SIZE - 1)}%`,
      border: tileValue === currentIndex && gameStarted && !isSolved ? '2px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255,255,255,0.1)'
    };
  };

  return (
    <section className={`section puzzle-section ${isOpen ? 'is-modal-open' : ''}`} id="puzzle">
      <div className="section-header reveal">
        <h2 className="gold-text">Solve our Memory</h2>
        <div className="divider"></div>
        <p className="subtitle">Relive our special moment with an interactive puzzle ✨</p>
      </div>

      <div className="puzzle-teaser reveal">
        <div className="teaser-card glass-card">
            <div className="teaser-image-wrapper">
                <img src="/engage.jpeg" alt="Engagement Preview" className="teaser-image" />
                <div className="teaser-overlay">
                    <button className="btn-gold play-trigger-btn" onClick={() => setIsOpen(true)}>
                        PLAY PUZZLE
                    </button>
                </div>
            </div>
            <p className="teaser-hint">Click to launch the game and piece together our engagement photo!</p>
        </div>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="puzzle-modal-overlay">
          <div className="puzzle-modal-content glass-card">
            <button className="modal-close-btn" onClick={() => setIsOpen(false)}>×</button>
            
            <div className="puzzle-modal-header">
                <h3>Engagement Memory</h3>
                <div className="game-status-bar">
                    <div className="stat-item">
                        <span className="stat-label">MOVES</span>
                        <span className="stat-value">{moves}</span>
                    </div>
                    <button className="game-btn shuffle-btn" onClick={shuffle}>
                        {gameStarted && !isSolved ? 'RESET' : 'START'}
                    </button>
                    <div className="stat-item">
                        <span className="stat-label">TIME</span>
                        <span className="stat-value">{formatTime(seconds)}</span>
                    </div>
                </div>
            </div>

            {!gameStarted && (
              <p className="game-instruction">
                💡 Click <strong>"START"</strong> to begin! Slide the pieces to complete the picture.
              </p>
            )}

            <div className={`puzzle-board ${isSolved ? 'solved' : ''} ${gameStarted && !isSolved ? 'in-progress' : ''}`}>
              {tiles.map((tile, index) => (
                <div
                  key={index}
                  className={`puzzle-tile ${tile === TOTAL_TILES - 1 ? 'empty' : ''}`}
                  style={getTileStyle(tile, index)}
                  onClick={() => handleTileClick(index)}
                />
              ))}
            </div>

            <div className="puzzle-modal-footer">
              <div className="puzzle-hint-container">
                <p className="hint-label">Goal Image</p>
                <img src="/engage.jpeg" alt="Engagement Hint" className="hint-image" />
              </div>
              {isSolved && gameStarted && (
                <div className="puzzle-success-message">
                  <h3 className="gold-text">SOLVED! 🎉</h3>
                  <p>Stats: {moves} moves in {formatTime(seconds)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Puzzle;
