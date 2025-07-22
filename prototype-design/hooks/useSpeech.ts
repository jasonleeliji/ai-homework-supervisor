
import { useCallback } from 'react';

export const useSpeech = () => {
  const speak = useCallback((text: string, lang = 'zh-CN') => {
    if ('speechSynthesis' in window && text) {
      // Cancel any ongoing speech to prevent overlap
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported in this browser or text is empty.');
    }
  }, []);

  return { speak };
};
