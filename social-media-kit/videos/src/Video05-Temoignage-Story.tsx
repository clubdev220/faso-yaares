import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS } from './theme';

const stats = [
  { val: '3', desc: 'jours pour vendre' },
  { val: '12', desc: 'contacts reçus' },
  { val: '0', desc: 'FCFA de frais' },
  { val: '5★', desc: 'satisfaction' },
];

export const TemoignageStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const quoteOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' });
  const quoteY = interpolate(frame, [10, 35], [30, 0], { extrapolateRight: 'clamp' });

  const avatarScale = spring({ frame: Math.max(0, frame - 50), fps, from: 0, to: 1, config: { damping: 10 } });

  const ctaOpacity = interpolate(frame, [160, 175], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${COLORS.sand} 0%, ${COLORS.white} 40%, ${COLORS.greenPale} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10% 8%',
      }}
    >
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 90, lineHeight: 1, color: COLORS.green, opacity: 0.25, fontWeight: 900 }}>
          &ldquo;
        </div>
        <div
          style={{
            fontSize: 38,
            fontWeight: 600,
            color: COLORS.charcoal,
            lineHeight: 1.4,
            fontStyle: 'italic',
            marginTop: 12,
            opacity: quoteOpacity,
            transform: `translateY(${quoteY}px)`,
          }}
        >
          J'ai vendu ma moto en 3 jours grâce à Yaaré. J'ai reçu 12 messages WhatsApp le premier jour !
        </div>
        <div
          style={{
            marginTop: 36,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            transform: `scale(${avatarScale})`,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: COLORS.green,
              color: COLORS.white,
              fontWeight: 700,
              fontSize: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            AB
          </div>
          <div style={{ fontWeight: 700, fontSize: 24, color: COLORS.charcoal }}>Abdoul B.</div>
          <div style={{ fontSize: 18, color: COLORS.slate }}>Ouagadougou</div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          width: '100%',
          zIndex: 1,
        }}
      >
        {stats.map((stat, i) => {
          const startFrame = 80 + i * 15;
          const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], { extrapolateRight: 'clamp' });
          const scale = spring({ frame: Math.max(0, frame - startFrame), fps, from: 0.8, to: 1, config: { damping: 12 } });

          return (
            <div
              key={stat.desc}
              style={{
                background: 'rgba(0,155,77,0.06)',
                border: '1px solid rgba(0,155,77,0.12)',
                borderRadius: 18,
                padding: '24px 14px',
                textAlign: 'center',
                opacity,
                transform: `scale(${scale})`,
              }}
            >
              <div style={{ fontSize: 44, fontWeight: 800, color: COLORS.green, lineHeight: 1 }}>
                {stat.val}
              </div>
              <div style={{ fontSize: 16, color: COLORS.slate, marginTop: 6, fontWeight: 500 }}>
                {stat.desc}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: ctaOpacity, zIndex: 1 }}>
        <div
          style={{
            background: COLORS.green,
            color: COLORS.white,
            padding: '20px 50px',
            borderRadius: 100,
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          Essayez Yaaré
        </div>
        <div style={{ fontSize: 18, color: COLORS.slate }}>yaarer.com</div>
      </div>
    </AbsoluteFill>
  );
};
