import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Sequence,
} from 'remotion';
import { COLORS } from './theme';

const WovenPattern: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      opacity: 0.06,
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(255,255,255,0.5) 18px, rgba(255,255,255,0.5) 20px),
        repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.5) 18px, rgba(255,255,255,0.5) 20px),
        repeating-linear-gradient(45deg, transparent, transparent 24px, rgba(252,209,22,0.4) 24px, rgba(252,209,22,0.4) 26px)
      `,
    }}
  />
);

export const BrandAwareness: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 12 } });
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const taglineY = interpolate(frame, [20, 45], [40, 0], { extrapolateRight: 'clamp' });
  const taglineOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });

  const barY = interpolate(frame, [50, 70], [30, 0], { extrapolateRight: 'clamp' });
  const barOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateRight: 'clamp' });

  const patternOffset = interpolate(frame, [0, 300], [0, 50]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, ${COLORS.green} 0%, ${COLORS.greenDeep} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12%',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${patternOffset}px)` }}>
        <WovenPattern />
      </div>

      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          fontSize: 120,
          fontWeight: 800,
          color: COLORS.white,
          letterSpacing: '-0.02em',
          zIndex: 1,
        }}
      >
        Yaar<span style={{ color: COLORS.gold }}>é</span>
      </div>

      <div
        style={{
          transform: `translateY(${taglineY}px)`,
          opacity: taglineOpacity,
          color: 'rgba(255,255,255,0.95)',
          fontSize: 48,
          fontWeight: 600,
          lineHeight: 1.35,
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        Le march<span style={{ color: COLORS.gold }}>é</span> en ligne
        <br />
        du <span style={{ color: COLORS.gold }}>Burkina Faso</span>
      </div>

      <div
        style={{
          transform: `translateY(${barY}px)`,
          opacity: barOpacity,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          background: 'rgba(0,0,0,0.2)',
          padding: '20px 40px',
          borderRadius: 100,
          zIndex: 1,
        }}
      >
        {['Achetez', 'Vendez', 'Gratuitement'].map((text, i) => (
          <React.Fragment key={text}>
            {i > 0 && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: COLORS.gold,
                }}
              />
            )}
            <span
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: 26,
                fontWeight: 500,
              }}
            >
              {text}
            </span>
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};
