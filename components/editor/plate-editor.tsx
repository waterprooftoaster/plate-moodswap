'use client';
// from libraries
import * as React from 'react';
import { YjsPlugin } from '@udecode/plate-yjs/react';
import {
    Plate,
    usePlateEditor,
} from '@udecode/plate/react';
import { RefreshCw } from 'lucide-react';
import { SlashPlugin, SlashInputPlugin } from '@udecode/plate-slash-command/react';
import { AIPlugin, AIChatPlugin } from '@udecode/plate-ai/react';

// ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlashInputElement } from '@/components/ui/slash-input-element';
import { RemoteCursorOverlay } from '@/components/ui/remote-cursor-overlay';
import { AIMenu } from '@/components/ui/ai-menu';

// hook
import { useMounted } from '@/hooks/use-mounted';

// components
import { useCollaborationRoom,
         CollaborativeEditor,
         useCollaborationUser
} from './use-collaboration';
import { createAIEditor,
         PROMPT_TEMPLATES,
} from './use-ai-editor';

// start of the code
const INITIAL_VALUE = [
    {
        children: [{ text: 'write something' }],
        type: 'p',
    },
];

export function PlateEditor(): React.ReactNode {
    const mounted = useMounted();
    const { generateNewRoom, roomName, handleRoomChange } =
        useCollaborationRoom();
    const { cursorColor, username } = useCollaborationUser();
    const editor = usePlateEditor ({
            components : {
                // ...otherComponents,
                [SlashInputPlugin.key]: SlashInputElement,
                [AIPlugin.key]: AIMenu,
              },
            plugins: [ 
                // ...otherPlugins,
                SlashPlugin,
                AIPlugin,
                AIChatPlugin.configure({
                options: {
                createAIEditor,
                promptTemplate: ({ isBlockSelecting, isSelecting }) => {
                    return isBlockSelecting
                    ? PROMPT_TEMPLATES.userBlockSelecting
                    : isSelecting
                        ? PROMPT_TEMPLATES.userSelecting
                        : PROMPT_TEMPLATES.userDefault;
                },
                systemTemplate: ({ isBlockSelecting, isSelecting }) => {
                    return isBlockSelecting
                    ? PROMPT_TEMPLATES.systemBlockSelecting
                    : isSelecting
                        ? PROMPT_TEMPLATES.systemSelecting
                        : PROMPT_TEMPLATES.systemDefault;
                },
                },
    render: { afterEditable: () => <AIMenu /> },
  }),
                
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
            // hydrates editor from localStorage
            value: () => {
                if (typeof window !== 'undefined') {
                    const savedValue = localStorage.getItem(`doc-${roomName}`);
                    if (savedValue) {
                        return JSON.parse(savedValue);
                    }
                }
                return INITIAL_VALUE;
            },
            skipInitialization: true,
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
                        href={typeof window === 'undefined' ? '#' : window.location.href}
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
                    <strong>About this demo:</strong>
                    <ul className="mt-1 list-inside list-disc">
                        <li>
                            Share your Room ID with others to collaborate in the same document
                        </li>
                        <li>Limited to 10 concurrent participants per room</li>
                        <li>
                            Using WebRTC with public signaling servers - for demo purposes
                            only
                        </li>
                    </ul>
                </div>
            </div>
            <div className="flex-1 overflow-hidden border-t">
                <Plate
                    editor={editor}
                    // localStorage saves editor to survive reloads
                    onChange={({ value }) => {
                        localStorage.setItem(`doc-${roomName}`, JSON.stringify(value));
                    }}
                >
                    <CollaborativeEditor cursorColor={cursorColor} username={username} />
                </Plate>
            </div>
        </div>
    );
}

