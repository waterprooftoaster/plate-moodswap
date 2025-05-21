'use client';
import * as React from 'react';
import { YjsPlugin } from '@udecode/plate-yjs/react';
import {
    useEditorRef,
    usePluginOption,
} from '@udecode/plate/react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Editor, EditorContainer } from '@/components/ui/editor';

export function CollaborativeEditor({
                                        cursorColor,
                                        username,
                                    }: {
    cursorColor: string;
    username: string;
}): React.ReactNode {
    const editor = useEditorRef();
    const providers = usePluginOption(YjsPlugin, '_providers');
    const isConnected = usePluginOption(YjsPlugin, '_isConnected');
    const toggleConnection = () => {
        if (editor.getOptions(YjsPlugin)._isConnected) {
            return editor.getApi(YjsPlugin).yjs.disconnect();
        }
        editor.getApi(YjsPlugin).yjs.connect();
    };
    return (
        <>
            <div className="bg-muted px-4 py-2 font-medium">
                Connected as <span style={{ color: cursorColor }}>{username}</span>
                <div className="mt-1 flex items-center gap-2 text-xs">
                    {providers.map((provider) => (
                        <span
                            key={provider.type}
                            className={`rounded px-2 py-0.5 ${
                                provider.isConnected
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
              {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}:{' '}
                            {provider.isConnected ? 'Connected' : 'Disconnected'}
            </span>
                    ))}
                    <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        onClick={toggleConnection}
                    >
                        {isConnected ? 'Disconnect' : 'Connect'}
                    </Button>
                </div>
            </div>
            <EditorContainer variant="demo">
                <Editor autoFocus />
            </EditorContainer>
        </>
    );
}

// Hook for managing room state
export function useCollaborationRoom() {
    const [roomName, setRoomName] = React.useState(() => {
        if (typeof window === 'undefined') return '';
        const storedRoomId = localStorage.getItem('demo-room-id');
        if (storedRoomId) return storedRoomId;
        const newRoomId = nanoid();
        localStorage.setItem('demo-room-id', newRoomId);
        return newRoomId;
    });
    const handleRoomChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newRoomId = e.target.value;
            localStorage.setItem('demo-room-id', newRoomId);
            setRoomName(newRoomId);
        },
        []
    );
    const generateNewRoom = React.useCallback(() => {
        const newRoomId = nanoid();
        localStorage.setItem('demo-room-id', newRoomId);
        setRoomName(newRoomId);
    }, []);
    return {
        generateNewRoom,
        roomName,
        handleRoomChange,
    };
}

// Hook for managing user/cursor state
export function useCollaborationUser() {
    const [username, setUsername]     = React.useState('');
    const [cursorColor, setCursorColor] = React.useState('');

    React.useEffect(() => {
        setUsername(`user-${Math.floor(Math.random() * 1000)}`);
        setCursorColor(getRandomColor());
    }, []);

    return { cursorColor, username };
}

const getRandomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};