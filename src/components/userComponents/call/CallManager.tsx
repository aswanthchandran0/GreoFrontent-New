// src/components/call/CallManager.tsx
import React from 'react';
import IncomingCallModal from './IncomingCallModal';
import OutgoingCallModal from './OutgoingCallModal';
import ActiveCallScreen from './ActiveCallScreen';
import { useCall } from '../../../context/CallContext';

const CallManager: React.FC = () => {
  const { 
    isIncomingCall, 
    isOutgoingCall, 
    isCallActive 
  } = useCall();

  
  if (isCallActive) {
    return <ActiveCallScreen />;
  }
  
  if (isIncomingCall) {
    return <IncomingCallModal />;
  }
  
  if (isOutgoingCall) {
    return <OutgoingCallModal />;
  }
  
  return null;
};

export default CallManager;