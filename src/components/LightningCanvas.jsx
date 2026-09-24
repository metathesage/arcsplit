import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Zap, Volume2, VolumeX } from 'lucide-react';

export function LightningCanvas({ intensity = 'storm' }) {
  const canvasRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef(null);

  // Synthesize realistic electric zap using Web Audio API
  const playZapSound = useCallback(() => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // White noise buffer for crackle
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Filter for electric snap
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 2.5;

      // Gain envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {
      // Audio not permitted or failed
    }
  }, [audioEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles (electric sparks)
    const sparks = [];
    const createSpark = (x, y, count = 12) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          alpha: 1,
          size: Math.random() * 2.5 + 1,
          color: Math.random() > 0.3 ? '#00f0ff' : '#a855f7',
        });
      }
    };

    // Lightning bolt definition
    let activeBolts = [];
    let skyFlashAlpha = 0;

    const generateBolt = (startX, startY, endX, endY, branches = 2, maxOffset = 45) => {
      const segments = [];
      const steps = Math.floor(Math.hypot(endX - startX, endY - startY) / 18);
      let curX = startX;
      let curY = startY;

      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const targetX = startX + (endX - startX) * progress;
        const targetY = startY + (endY - startY) * progress;

        const offset = (Math.random() - 0.5) * maxOffset * (1 - Math.abs(progress - 0.5));
        const nextX = i === steps ? endX : targetX + offset;
        const nextY = i === steps ? endY : targetY + (Math.random() - 0.5) * 10;

        segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

        // Branching
        if (branches > 0 && Math.random() < 0.2 && i > 3 && i < steps - 2) {
          const branchAngle = (Math.random() - 0.5) * 1.2;
          const branchDist = (Math.random() * 80 + 40);
          const bEndX = nextX + Math.sin(branchAngle) * branchDist;
          const bEndY = nextY + Math.cos(branchAngle) * branchDist;
          generateBolt(nextX, nextY, bEndX, bEndY, branches - 1, maxOffset * 0.6);
        }

        curX = nextX;
        curY = nextY;
      }

      activeBolts.push({
        segments,
        life: 1.0,
        decay: Math.random() * 0.08 + 0.05,
        width: Math.random() * 2.5 + 2,
      });

      skyFlashAlpha = Math.min(0.28, skyFlashAlpha + 0.15);
      createSpark(endX, endY, 14);
      playZapSound();
    };

    // Trigger strike manually or programmatically
    const triggerStrike = (targetX = null, targetY = null) => {
      const startX = Math.random() * width * 0.8 + width * 0.1;
      const startY = 0;
      const endX = targetX !== null ? targetX : Math.random() * width * 0.8 + width * 0.1;
      const endY = targetY !== null ? targetY : Math.random() * height * 0.6 + height * 0.2;

      generateBolt(startX, startY, endX, endY, 2, 60);
    };

    // Interactive click strike
    const handleCanvasClick = (e) => {
      triggerStrike(e.clientX, e.clientY);
    };
    window.addEventListener('click', handleCanvasClick);

    // Periodic ambient strikes
    let lastAmbientTime = Date.now();
    const strikeInterval = intensity === 'supercharge' ? 1800 : intensity === 'storm' ? 3600 : 7000;

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Sky flash glow
      if (skyFlashAlpha > 0.005) {
        const grad = ctx.createRadialGradient(width / 2, height * 0.2, 50, width / 2, height * 0.2, width);
        grad.addColorStop(0, `rgba(14, 165, 233, ${skyFlashAlpha})`);
        grad.addColorStop(0.5, `rgba(121, 40, 202, ${skyFlashAlpha * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        skyFlashAlpha *= 0.88;
      }

      // Draw lightning bolts
      for (let b = activeBolts.length - 1; b >= 0; b--) {
        const bolt = activeBolts[b];
        bolt.life -= bolt.decay;

        if (bolt.life <= 0) {
          activeBolts.splice(b, 1);
          continue;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer glow
        ctx.shadowBlur = 24 * bolt.life;
        ctx.shadowColor = '#00f0ff';
        ctx.strokeStyle = `rgba(0, 240, 255, ${bolt.life * 0.8})`;
        ctx.lineWidth = bolt.width + 3;

        ctx.beginPath();
        bolt.segments.forEach((seg) => {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        });
        ctx.stroke();

        // Inner white hot core
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.life})`;
        ctx.lineWidth = Math.max(1, bolt.width * 0.5);

        ctx.beginPath();
        bolt.segments.forEach((seg) => {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        });
        ctx.stroke();

        ctx.restore();
      }

      // Draw and update sparks
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.15; // gravity
        sp.alpha -= 0.025;

        if (sp.alpha <= 0) {
          sparks.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = sp.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Check ambient strike
      const now = Date.now();
      if (now - lastAmbientTime > strikeInterval) {
        lastAmbientTime = now + (Math.random() * 1000 - 500);
        triggerStrike();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, playZapSound]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* Sound Toggle Pill */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(10, 16, 30, 0.85)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          backdropFilter: 'blur(12px)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 14px',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAudioEnabled(!audioEnabled);
            if (!audioEnabled) playZapSound();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: audioEnabled ? '#00f0ff' : 'var(--text-dim)',
            fontSize: '0.78rem',
            fontWeight: '600',
          }}
          title={audioEnabled ? 'Mute Electric SFX' : 'Enable Electric Zap Sound Effects'}
        >
          {audioEnabled ? <Volume2 size={15} color="#00f0ff" /> : <VolumeX size={15} />}
          <span>{audioEnabled ? 'Electric SFX ON' : 'Audio SFX'}</span>
        </button>
      </div>
    </>
  );
}
