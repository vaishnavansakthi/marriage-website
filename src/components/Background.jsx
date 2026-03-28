import React, { useEffect, useRef } from 'react';

const Background = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Romantic color palette
    const colors = ['#FF6B6B', '#FF8E8B', '#FF4B91', '#D4AF37'];

    const generateParticles = () => {
      const p = [];
      const particleCount = Math.floor(width * height / 12000); // Slightly fewer for hearts
      
      for (let i = 0; i < particleCount; i++) {
        p.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1, // varied sizes
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 - 0.5, // Float upwards more
          opacity: Math.random() * 0.6 + 0.2, // brighter
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: (Math.random() - 0.5) * 0.2 // slight rotation
        });
      }
      return p;
    };

    let particles = generateParticles();

    const drawHeart = (ctx, x, y, size, color, opacity, rotate) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotate);
      ctx.scale(size, size);
      ctx.globalAlpha = opacity;
      
      ctx.beginPath();
      // Start at the top center cleft
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-1.5, -1.5, -4, 1.5, 0, 4);
      ctx.bezierCurveTo(4, 1.5, 1.5, -1.5, 0, 0);
      
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        drawHeart(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
      });

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = generateParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default Background;
