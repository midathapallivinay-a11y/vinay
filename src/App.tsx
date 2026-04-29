/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, Trophy, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Constants
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 150;

const TRACKS = [
  { id: 1, title: "Neon Pulse", artist: "SynthWave AI", duration: "2:45", color: "from-purple-500 to-pink-500" },
  { id: 2, title: "Grid Runner", artist: "ElectroCore", duration: "3:12", color: "from-cyan-500 to-blue-500" },
  { id: 3, title: "Laser Nights", artist: "RetroFuture", duration: "2:58", color: "from-yellow-500 to-red-500" },
];

export default function App() {
  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random food
  const generateFood = useCallback((currentSnake: { x: number, y: number }[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure food doesn't spawn on snake
      const onSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  // Reset Game
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  // Game Logic
  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setIsPaused(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, score, highScore, generateFood]);

  // Handle Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          if (isGameOver) resetGame();
          else setIsPaused((p) => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameOver]);

  // Game Interval
  useEffect(() => {
    const speed = Math.max(BASE_SPEED - Math.floor(score / 50) * 5, 80);
    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, score]);

  // Music Progress Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMusicPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isMusicPlaying]);

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Dynamic Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Info & Score */}
        <div className="md:col-span-3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">High Score</span>
            </div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              {highScore}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Current Score</span>
            </div>
            <div className="text-4xl font-black text-white">
              {score}
            </div>
          </motion.div>

          <div className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold leading-relaxed">
            Controls:<br />
            Arrows to Move<br />
            Space to Pause/Restart
          </div>
        </div>

        {/* Center: Game Window */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div className="relative p-1 rounded-2xl bg-gradient-to-b from-white/20 to-transparent shadow-[0_0_40px_rgba(168,85,247,0.15)]">
            <div 
              className="relative bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-inner"
              style={{
                width: GRID_SIZE * 20,
                height: GRID_SIZE * 20,
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              }}
            >
              <AnimatePresence>
                {/* Snake Rendering */}
                {snake.map((segment, i) => (
                  <motion.div
                    key={`${i}-${segment.x}-${segment.y}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute w-5 h-5 rounded-sm ${
                      i === 0 
                        ? 'bg-gradient-to-br from-purple-400 to-purple-600 z-20 shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                        : 'bg-purple-500/40 z-10'
                    }`}
                    style={{
                      left: segment.x * 20,
                      top: segment.y * 20,
                      borderRadius: i === 0 ? '4px' : '2px'
                    }}
                  />
                ))}

                {/* Food Rendering */}
                <motion.div
                  key={`food-${food.x}-${food.y}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute w-5 h-5 flex items-center justify-center z-30"
                  style={{
                    left: food.x * 20,
                    top: food.y * 20,
                  }}
                >
                  <div className="w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.8)] animate-bounce" />
                </motion.div>
              </AnimatePresence>

              {/* Game Over / Pause Overlays */}
              <AnimatePresence mode="wait">
                {(isGameOver || isPaused) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-[#050505]/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                  >
                    {isGameOver ? (
                      <>
                        <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                          SYSTEM ERROR
                        </h2>
                        <p className="text-white/60 text-sm font-medium mb-8 uppercase tracking-widest">Connection Lost. Snake Terminated.</p>
                        <button 
                          onClick={resetGame}
                          className="group flex items-center gap-3 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-purple-400 transition-all active:scale-95 shadow-[0_0_20px_white/20]"
                        >
                          <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                          REBOOT
                        </button>
                      </>
                    ) : (
                      <>
                        <h2 className="text-4xl font-black mb-8 text-white tracking-tight">STASIS MODE</h2>
                        <button 
                          onClick={() => setIsPaused(false)}
                          className="group flex items-center gap-3 px-8 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-500 transition-all active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        >
                          <Play className="w-4 h-4" />
                          RESUME
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: Music Player */}
        <div className="md:col-span-3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden relative"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 bg-gradient-to-br ${currentTrack.color}`}></div>
            
            <div className="flex items-center gap-3 mb-6">
              <Music className="w-4 h-4 text-white/50" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Now Playing</span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold truncate mb-1">{currentTrack.title}</h3>
              <p className="text-sm text-white/40 mb-4">{currentTrack.artist}</p>
              
              {/* Visualizer Mockup */}
              <div className="flex items-end gap-[2px] h-8 mb-6">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: isMusicPlaying ? [4, 24, 8, 20, 4] : 4
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5 + Math.random() * 0.5,
                      delay: i * 0.05
                    }}
                    className={`flex-1 rounded-full bg-gradient-to-t ${currentTrack.color}`}
                  />
                ))}
              </div>

              {/* Progress Bar */}
              <div className="relative h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                <motion.div 
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${currentTrack.color}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-white/30">
                <span>0:45</span>
                <span>{currentTrack.duration}</span>
              </div>
            </div>

            {/* Music Controls */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setCurrentTrackIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {isMusicPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
              <button 
                onClick={() => setCurrentTrackIndex((i) => (i + 1) % TRACKS.length)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-between group">
            <Volume2 className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            <div className="flex-1 mx-4 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-white/20 group-hover:bg-purple-500 transition-colors"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Text */}
      <div className="fixed bottom-8 left-8 text-[12vw] font-black text-white/[0.02] pointer-events-none select-none uppercase tracking-tighter">
        SynthSnake
      </div>
    </div>
  );
}
