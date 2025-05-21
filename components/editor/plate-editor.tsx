'use client';
// plugins
import * as React from 'react';
import { YjsPlugin } from '@udecode/plate-yjs/react';
import {
    Plate,
    usePlateEditor,
} from '@udecode/plate/react';
import { SlashPlugin, SlashInputPlugin } from '@udecode/plate-slash-command/react';
import { subscribeToAIResponse } from '@/components/editor/use-ai';

// ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlashInputElement } from '@/components/ui/slash-input-element';
import { RemoteCursorOverlay } from '@/components/ui/remote-cursor-overlay';
import { RefreshCw } from 'lucide-react';

// hook
import { useMounted } from '@/hooks/use-mounted';

// components
import { useCollaborationRoom,
         CollaborativeEditor,
         useCollaborationUser
} from './use-collaboration';

// start of the code
//allow editor to know its mood
let mood: 'happy' | 'sad' = 'happy';
export function setMood(newMood: 'happy' | 'sad') {
  mood = newMood;
}

const INITIAL_VALUE = [
    {
        children: [{ text: 'write something' }],
        type: 'p'
    },
];

export function PlateEditor(): React.ReactNode {
    const mounted = useMounted();
    const { generateNewRoom, roomName, handleRoomChange } =
        useCollaborationRoom();
    const { cursorColor, username } = useCollaborationUser();
    const currentHref = mounted ? window.location.href : '#';

    const editor = usePlateEditor ({
            id: mood,
            skipInitialization: true,
            components : {
                // ...otherComponents,
                [SlashInputPlugin.key]: SlashInputElement,
              },
            plugins: [
                // ...otherPlugins,
                SlashPlugin,
                YjsPlugin.configure({
                    options: {
                        cursors: {
                            data: { color: cursorColor, name: username },
                        },
                        providers: [
                            {
                                options: {
                                    name: roomName,
                                    url: 'ws://localhost:8888',
                                },
                                type: 'hocuspocus',
                            },
                            {
                                options: {
                                    maxConns: 9, // Limit to 10 total participants
                                    roomName: roomName,
                                    signaling: [
                                        process.env.NODE_ENV === 'production'
                                            ? // Use public signaling server just for demo purposes
                                            'wss://signaling.yjs.dev'
                                            : 'ws://localhost:4444',
                                    ],
                                },
                                type: 'webrtc',
                            },
                        ],
                    },
                    render: {
                        afterEditable: RemoteCursorOverlay,
                    },
                }),
            ],
            
        },
        [roomName]
    );
    React.useEffect(() => {
        if (!mounted) return;
        const saved = localStorage.getItem(`doc-${roomName}`);
        const initial = saved ? JSON.parse(saved) : INITIAL_VALUE;
        editor.getApi(YjsPlugin).yjs.init({
            id: roomName,
            autoSelect: 'end',
            value: initial,
        });
        return () => {
            editor.getApi(YjsPlugin).yjs.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, mounted]);

        React.useEffect(() => {
        const unsubscribe = subscribeToAIResponse((newContent) => {
            if (!newContent || !editor) return;
            // 1. Delete entire content
            editor.tf.delete({
            at: [], // delete entire document
            unit: 'block',
            voids: true,
            });

            // 2. Insert the new content as a single paragraph node
            editor.tf.insertNodes({
            type: 'p',
            children: [{ text: newContent }],
            }, {
            at: [0],
            select: true,
            });
        });

        return unsubscribe;
        }, [editor]);

    return (
        <div className="flex flex-col">
            <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium" htmlFor="room-id">
                            Room ID (share this to collaborate)
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="room-id"
                                className="h-[28px] bg-background px-1.5 py-1"
                                value={roomName}
                                onChange={handleRoomChange}
                                type="text"
                            />
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={generateNewRoom}
                                title="Generate new room"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <p className="mt-2">
                    You can{' '}
                    <a
                        className="underline underline-offset-4 transition-colors hover:text-primary"
                        href={currentHref}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        open this page in another tab
                    </a>{' '}
                    or share your Room ID with others to test real-time collaboration.
                    Each instance will have a different cursor color for easy
                    identification.
                </p>
                <div className="mt-2">
                    <strong>Type "/" for mood change:</strong>
                    <ul className="mt-1 list-inside list-disc"> </ul>
                </div>
            </div>
            <div className="flex-1 overflow-hidden border-t">
                <Plate
                    editor={editor}
                    // localStorage saves editor to survive reloads
                    onChange={({ value }) => {
                        localStorage.setItem(mood, JSON.stringify(value));
                    }}
                >
                    <CollaborativeEditor cursorColor={cursorColor} username={username} />
                </Plate>
            </div>
        </div>
    );
}

