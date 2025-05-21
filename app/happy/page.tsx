'use client';
import { useEffect } from 'react';
import { setMood } from '@/components/editor/plate-editor';
import dynamic from 'next/dynamic';

const PlateEditor = dynamic(
    () => import('@/components/editor/plate-editor').then(mod => mod.PlateEditor),
    { ssr: false }
);

export default function HappyPage() {
  useEffect(() => {
    setMood('happy');
  }, []);

  return (
    <main className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Make Words Happy :)</h1>
      <PlateEditor />
    </main>
  );
}