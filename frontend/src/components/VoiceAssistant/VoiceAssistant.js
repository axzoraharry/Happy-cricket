import React from 'react';
import AdvancedVoiceAssistant from './AdvancedVoiceAssistant';

// Wrapper component to maintain backward compatibility
const VoiceAssistant = () => {
  return <AdvancedVoiceAssistant />;
};

export default VoiceAssistant;