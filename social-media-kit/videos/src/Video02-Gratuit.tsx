import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS } from './theme';

export const Gratuit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const priceOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });
  const strikeWidth = interpolate(frame, [25, 45], [0, 100], { extrapolateRight: 'clamp' });

  const freeScale = spring({ frame: Math.max(0, frame - 40), fps, from: 0.3, to: 1, config: { damping: 8, mass: 0.8 } });
  const freeOpacity = interpolate(frame, [40, 50], [0, 1], { extrapolateRight: 'clamp' });

  const feat1 = interpolate(frame, [65, 80], [0, 1], { extrapolateRight: 'clamp' });
  const feat2 = interpolate(frame, [75, 90], [0, 1], { extrapolateRight: 'clamp' });
  const feat3 = interpolate(frame, [85, 100], [0, 1], { extrapolateRight: 'clamp' });
  const feats = [feat1, feat2, feat3];

  const ctaOpacity = interpolate(frame, [110, 125], [0, 1], { extrapolateRight: 'clamp' });
  const ctaY = interpolate(frame, [110, 130], [20, 0], { extrapolateRight: 'clamp' });

  const features = [
    'Publiez vos annonces sans frais',
    'Contactez les vendeurs via WhatsApp',
    'En moins de 2 minutes',
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.cream,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6%',
        padding: '10%',
      }}
    >
      <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: COLORS.green, opacity: 0.08 }} />
      <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: COLORS.gold, opacity: 0.08 }} />

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ position: 'relative', display: 'inline-block', opacity: priceOpacity }}>
          <span style={{ fontSize: 56, color: '#ccc', fontWeight: 700 }}>5 000 FCFA</span>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: `${strikeWidth}%`,
              height: 4,
              background: COLORS.red,
              transform: 'translateY(-50%)',
            }}
          />
        </div>
        <div
          style={{
            fontSize: 140,
            fontWeight: 900,
            color: COLORS.green,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            transform: `scale(${freeScale})`,
            opacity: freeOpacity,
            marginTop: 10,
          }}
        >
          GRATUIT
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', zIndex: 1 }}>
        {features.map((text, i) => (
          <div
            key={text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 28,
              color: COLORS.slate,
              fontWeight: 500,
              opacity: feats[i],
              transform: `translateX(${interpolate(feats[i], [0, 1], [-20, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: COLORS.green,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: COLORS.white,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            {text}
          </div>
        ))}
      </div>

      <div
        style={{
          background: COLORS.green,
          color: COLORS.white,
          padding: '22px 60px',
          borderRadius: 100,
          fontSize: 30,
          fontWeight: 700,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          zIndex: 1,
        }}
      >
        Commencez sur yaarer.com
      </div>
    </AbsoluteFill>
  );
};
