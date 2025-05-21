// useLocalStorageChat.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useCallback } from 'react';

// global listener for editor to know when the AI response is ready
let listeners: ((value: string) => void)[] = [];
export function subscribeToAIResponse(listener: (value: string) => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function useLocalStorageChat(mood: string) {

  const { messages, status, append } = useChat({
    api: '/api/chat',
    initialMessages: [{
    id: 'initialMessage',
    role: 'system',
    content: systemPrompt,
    },],
  });

    useEffect(() => {
        const assistantMsgs = messages.filter(m => m.role === 'assistant');
        if (assistantMsgs.length > 0) {
            const value = assistantMsgs[assistantMsgs.length - 1].content;
            setLastMessage(value);
            // notify listeners for editor
            listeners.forEach(fn => fn(value));
        }
    }, [messages]);

  const [lastMessage, setLastMessage] = useState<string>('');

  const sendLocalStorage = useCallback(() => {
    const value = localStorage.getItem(mood) || '';
    const userPrompt = buildUserPrompt(mood, value);

    append({
      role: 'user',
      content: userPrompt,
    });
  }, [append, mood]);

  const isLoading = status === 'submitted'

  return { sendLocalStorage, lastMessage, isLoading };
}

export function buildUserPrompt(mood: string, text: string): string {
  return `Transform this text to be more ${mood}:\n"${text}"`;
}

const systemPrompt = `\
You are a precise text mood transformer. Your ONLY task is to adjust the emotional tone of input text.

Rules:
- If the requested mood is "sad", convert the input into a sadder emotional version.
- If the requested mood is "happy", convert the input into a happier emotional version.
- If the input is emotionally neutral, adjust it subtly toward the target mood.
- If the input is already strongly aligned with the target mood, intensify it naturally.
- If the input is nonsensical, symbolic, or meaningless (e.g., "???!@#@"), respond with exactly:
  I cannot flip the mood with gibberish.

Strict output rules:
- DO NOT include any greetings, acknowledgments, or labels (e.g., "Here you go:", "Sure!").
- DO NOT include metadata, formatting tags, or response explanations.
- DO NOT preserve or mention the original input.
- Your response MUST be:
  - A single, coherent sentence or phrase.
  - Emotionally aligned with the requested mood.
  - Grammatically correct.
  - Free of any markup, extra punctuation, or commentary.
- If the input is empty or pure symbols, return:
  I cannot flip the mood with gibberish.
`;