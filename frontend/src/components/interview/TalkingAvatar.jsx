import React from 'react';
import './talkingAvatar.css';

export default function TalkingAvatar({ interviewer, isSpeaking, isThinking }) {
  const photoAnimClass = isSpeaking ? 'is-speaking' : isThinking ? 'is-thinking' : 'is-idle';
  const tileStateClass = isSpeaking ? 'speaking-active' : isThinking ? 'thinking-active' : '';
  const dotClass = isSpeaking ? 'speaking' : isThinking ? 'thinking' : 'idle';

  return (
    <div className="talking-avatar-container">
      <div className={`speaking-waveform-ring ${isSpeaking ? 'active' : ''}`} />
      <div className={`talking-avatar-tile ${tileStateClass}`}>
        <img
          src={interviewer.avatarImg}
          alt={interviewer.name}
          className={`talking-avatar-photo ${photoAnimClass}`}
          draggable={false}
        />
        <div className="avatar-name-bar z-30">
          <span className={`status-dot ${dotClass}`} />
          <span className="avatar-name">{interviewer.name}</span>
          {isSpeaking && (
            <span className="flex items-center gap-0.5 ml-1 h-3 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:300ms]" />
              <span className="w-0.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:75ms]" />
            </span>
          )}
          <span className="avatar-badge">{interviewer.badge}</span>
        </div>
      </div>
    </div>
  );
}
