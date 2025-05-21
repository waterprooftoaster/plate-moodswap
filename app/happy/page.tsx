'use client';
import { useEffect } from 'react';
import {PlateEditor,
        setMood
} from '@/components/editor/plate-editor';

export default function HappyPage() {
  useEffect(() => {
    setMood('happy'); // Or however your setMood function works
  }, []);

  return (
    <main className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Happy Editor</h1>
      <PlateEditor />
    </main>
  );
}