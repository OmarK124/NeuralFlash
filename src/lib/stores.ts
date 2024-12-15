import { load } from '@tauri-apps/plugin-store';
import { writable } from 'svelte/store';
import { unpack, pack } from 'msgpackr';

export interface FlashcardSide {
  text?: string;
  image?: Uint8Array;
}

export interface Flashcard {
  id: string;
  front: FlashcardSide;
  back: FlashcardSide;
  difficulty: 'hard' | 'easy';
}

export interface Subject {
  id: string;
  name: string;
  flashcards: Flashcard[];
}

export interface Settings {
  colorMode: 'system' | 'light' | 'dark';
  alwaysAskBeforeDelete: boolean;
  googleAIStudioKey?: string;
}

//non-persistant stores
export const selectedSubject = writable<Subject | null>(null);
export const selectedFlashcard = writable<Flashcard | null>(null);
export const isEditMode = writable(false);

//persistant stores
export const subjects = writable<Subject[]>([]);
export const settings = writable<Settings>({ 
  colorMode: 'light', 
  alwaysAskBeforeDelete: true,
  googleAIStudioKey: '' 
});

(async () => {
  // Load the subjects store
  const subjectsStore = await load('store.bin', { autoSave: false });
  // Load the settings store
  const settingsStore = await load('settings.json', { autoSave: false });

  // Load existing subjects data
  const packedDataBase64 = await subjectsStore.get<string>('subjects');

  if (packedDataBase64) {
    const packedData = Uint8Array.from(
      atob(packedDataBase64),
      (c) => c.charCodeAt(0)
    );
    const data = unpack(packedData);
    subjects.set(data as Subject[]);
  }

  // Load existing settings
  const savedSettings = await settingsStore.get<Settings>('settings');
  if (savedSettings) {
    settings.set(savedSettings);
  }

  // Save subjects whenever they change
  subjects.subscribe(async (value) => {
    console.log("Cards changed", value);

    const packedData = pack(value);
    const packedDataBase64 = btoa(String.fromCharCode(...packedData));
    await subjectsStore.set('subjects', packedDataBase64);
    await subjectsStore.save();
    console.log("Cards saved");

  });

  // Save settings whenever they change
  settings.subscribe(async (value) => {
    console.log("Settings changed", value);
    await settingsStore.set('settings', value);
    await settingsStore.save();
    console.log("Settings saved");
  });
})();