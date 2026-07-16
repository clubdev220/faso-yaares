import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import { COLORS } from './theme';

const messages = [
  { me: false, text: 'Bonjour, votre iPhone 13 est toujours disponible ?', time: '14:02' },
  { me: true, text: 'Oui ! Il est en très bon état. Vous êtes à Ouaga ?', time: '14:03' },
  { me: false, text: 'Oui, je suis à Ouaga 2000. On peut se voir demain ?', time: '14:04' },
  { me: true, text: 'Parfait, je vous envoie ma localisation 📍', time: '14:05' },
];

export const WhatsAppStory: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [5, 25], [20, 0], { extrapolateRight: 'clamp' });

  const badgeOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  const footerOpacity = interpolate(frame, [170, 185], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(170deg, #075E54 0%, #054C44 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10% 8%',
      }}
    >
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.12)',
            padding: '10px 28px',
            borderRadius: 100,
            fontSize: 18,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            opacity: badgeOpacity,
          }}
        >
          💬 Fonctionnalité
        </div>
        <div
          style={{
            color: COLORS.white,
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.2,
            marginTop: 30,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Contactez les vendeurs
          <br />
          via <span style={{ color: '#25D366' }}>WhatsApp</span>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          zIndex: 1,
        }}
      >
        {messages.map((msg, i) => {
          const startFrame = 40 + i * 30;
          const opacity = interpolate(frame, [startFrame, startFrame + 12], [0, 1], { extrapolateRight: 'clamp' });
          const y = interpolate(frame, [startFrame, startFrame + 15], [15, 0], { extrapolateRight: 'clamp' });

          return (
            <div
              key={i}
              style={{
                maxWidth: '80%',
                padding: '18px 24px',
                borderRadius: 18,
                fontSize: 22,
                lineHeight: 1.4,
                opacity,
                transform: `translateY(${y}px)`,
                alignSelf: msg.me ? 'flex-end' : 'flex-start',
                background: msg.me ? '#005C4B' : '#1A3A34',
                color: 'rgba(255,255,255,0.95)',
                borderBottomLeftRadius: msg.me ? 18 : 5,
                borderBottomRightRadius: msg.me ? 5 : 18,
              }}
            >
              {msg.text}
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6, textAlign: 'right' }}>
                {msg.time}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', opacity: footerOpacity, zIndex: 1 }}>
        <div style={{ fontSize: 38, fontWeight: 800, color: COLORS.white }}>
          Yaar<span style={{ color: COLORS.gold }}>é</span>
        </div>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
          yaarer.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
