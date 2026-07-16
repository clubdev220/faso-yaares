import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion';
import { COLORS } from './theme';

const steps = [
  { num: '1', title: 'Créez votre compte', desc: 'Inscrivez-vous avec votre numéro en 30 secondes' },
  { num: '2', title: 'Publiez votre annonce', desc: 'Ajoutez photos, description et prix — c\'est gratuit' },
  { num: '3', title: 'Recevez des contacts', desc: 'Les acheteurs vous contactent sur WhatsApp' },
  { num: '4', title: 'Vendez !', desc: 'Rencontrez l\'acheteur et concluez la vente' },
];

export const HowToStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, from: 0.8, to: 1, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  const ctaOpacity = interpolate(frame, [160, 175], [0, 1], { extrapolateRight: 'clamp' });
  const ctaY = interpolate(frame, [160, 180], [20, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${COLORS.greenDeep} 0%, ${COLORS.greenDark} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10% 8%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: COLORS.gold,
          opacity: 0.04,
          top: '15%',
          right: -80,
        }}
      />

      <div
        style={{
          color: COLORS.white,
          fontSize: 52,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: 'center',
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
          zIndex: 1,
        }}
      >
        Comment vendre
        <br />
        sur <span style={{ color: COLORS.gold }}>Yaaré</span> ?
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          width: '100%',
          zIndex: 1,
        }}
      >
        {steps.map((step, i) => {
          const startFrame = 30 + i * 30;
          const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], { extrapolateRight: 'clamp' });
          const x = interpolate(frame, [startFrame, startFrame + 20], [-30, 0], { extrapolateRight: 'clamp' });

          return (
            <React.Fragment key={step.num}>
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  opacity,
                  transform: `translateX(${x}px)`,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: COLORS.gold,
                    color: COLORS.greenDark,
                    fontWeight: 800,
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <div style={{ color: COLORS.white, fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}>
                    {step.title}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 20, marginTop: 4, lineHeight: 1.4 }}>
                    {step.desc}
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: 3,
                    height: 16,
                    background: 'rgba(252,209,22,0.3)',
                    marginLeft: 23,
                    opacity,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div
        style={{
          background: COLORS.gold,
          color: COLORS.greenDark,
          fontWeight: 800,
          fontSize: 28,
          padding: '24px 56px',
          borderRadius: 100,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          zIndex: 1,
        }}
      >
        Commencez maintenant →
      </div>
    </AbsoluteFill>
  );
};
