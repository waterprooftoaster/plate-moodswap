'use client';

import * as React from 'react';
import type { TSlashInputElement } from '@udecode/plate-slash-command';
import { PlateElement, type PlateElementProps } from '@udecode/plate/react';
import { useLocalStorageChat } from '../editor/use-ai';
import {
  InlineCombobox,
  InlineComboboxInput,
  InlineComboboxContent,
  InlineComboboxItem,
} from './inline-combobox';
import { SparklesIcon } from 'lucide-react';

export function SlashInputElement(
  props: PlateElementProps<TSlashInputElement>
) {
  const { editor, element } = props;
  const { sendLocalStorage } = useLocalStorageChat(editor.id);
  return (
    <PlateElement {...props} as="span" data-slate-value={element.value}>
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxItem
            value="AI"
            onClick={() => { console.log("on click happened"); sendLocalStorage(); }} 
            focusEditor={false}
          >
            <div className="mr-2 text-muted-foreground">
              <SparklesIcon />
            </div>
            flip the mood
          </InlineComboboxItem>
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}

