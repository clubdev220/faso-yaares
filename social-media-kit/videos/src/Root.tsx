import React from 'react';
import { Composition } from 'remotion';
import { BrandAwareness } from './Video01-BrandAwareness';
import { Gratuit } from './Video02-Gratuit';
import { HowToStory } from './Video03-HowTo-Story';
import { WhatsAppStory } from './Video04-WhatsApp-Story';
import { TemoignageStory } from './Video05-Temoignage-Story';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Posts carrés — Instagram / Facebook / TikTok */}
      <Composition
        id="BrandAwareness"
        component={BrandAwareness}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1080}
      />
      <Composition
        id="Gratuit"
        component={Gratuit}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1080}
      />

      {/* Stories / Reels — Instagram, Facebook, TikTok (9:16) */}
      <Composition
        id="HowTo-Story"
        component={HowToStory}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="WhatsApp-Story"
        component={WhatsAppStory}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Temoignage-Story"
        component={TemoignageStory}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
