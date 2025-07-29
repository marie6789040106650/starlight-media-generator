/**
 * Core business stream state management
 * Extracted from use-business-stream.ts to maintain <500 line limit
 */

import { useState, useCallback, useRef } from 'react';
import type {
  Module1Data,
  Module2OutputFull,
  Module3Output,
  Module2StreamState
} from '../lib/business-types';

// ==================== Types ====================

export interface Module1State {
  data: Module1Data | null;
  isLoading: boolean;
  error: string | null;
}

export interface Module2State {
  streamState: Module2StreamState;
  isStreaming: boolean;
  error: string | null;
  finalData: Module2OutputFull | null;
}

export interface Module3State {
  data: Module3Output | null;
  isLoading: boolean;
  error: string | null;
}

export interface BusinessStreamState {
  module1: Module1State;
  module2: Module2State;
  module3: Module3State;
  currentStep: 'module1' | 'module2' | 'module3' | 'completed';
  requestId: string | null;
}

export interface BusinessStreamOptions {
  onModule1Complete?: (data: Module1Data) => void;
  onModule2Complete?: (data: Module2OutputFull) => void;
  onModule3Complete?: (data: Module3Output) => void;
  onError?: (error: string, module: string) => void;
  onStepChange?: (step: string) => void;
}

// ==================== Initial State ====================

const initialModule2StreamState: Module2StreamState = {
  ipTags: { content: [], isComplete: false },
  brandSlogan: { content: '', isComplete: false },
  contentColumns: { content: [], isComplete: false },
  goldenSentences: { content: [], isComplete: false }
};

export const initialState: BusinessStreamState = {
  module1: {
    data: null,
    isLoading: false,
    error: null
  },
  module2: {
    streamState: initialModule2StreamState,
    isStreaming: false,
    error: null,
    finalData: null
  },
  module3: {
    data: null,
    isLoading: false,
    error: null
  },
  currentStep: 'module1',
  requestId: null
};

// ==================== Core State Hook ====================

export function useBusinessStreamState() {
  const [state, setState] = useState<BusinessStreamState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);

  // State update helpers
  const updateModule1State = useCallback((updates: Partial<Module1State>) => {
    setState(prev => ({
      ...prev,
      module1: { ...prev.module1, ...updates }
    }));
  }, []);

  const updateModule2State = useCallback((updates: Partial<Module2State>) => {
    setState(prev => ({
      ...prev,
      module2: { ...prev.module2, ...updates }
    }));
  }, []);

  const updateModule3State = useCallback((updates: Partial<Module3State>) => {
    setState(prev => ({
      ...prev,
      module3: { ...prev.module3, ...updates }
    }));
  }, []);

  const setCurrentStep = useCallback((step: BusinessStreamState['currentStep']) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const resetState = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(initialState);
    retryCountRef.current = 0;
  }, []);

  // Computed properties
  const canProceedToModule2 = state.module1.data !== null && !state.module1.error;
  const canProceedToModule3 = canProceedToModule2 && state.module2.finalData !== null && !state.module2.error;
  const isCompleted = state.currentStep === 'completed' && state.module3.data !== null;

  const getProgress = useCallback(() => {
    let completed = 0;
    const total = 3;
    
    if (state.module1.data) completed++;
    if (state.module2.finalData) completed++;
    if (state.module3.data) completed++;
    
    return { completed, total, percentage: (completed / total) * 100 };
  }, [state]);

  return {
    state,
    setState,
    abortControllerRef,
    retryCountRef,
    updateModule1State,
    updateModule2State,
    updateModule3State,
    setCurrentStep,
    resetState,
    canProceedToModule2,
    canProceedToModule3,
    isCompleted,
    getProgress
  };
}