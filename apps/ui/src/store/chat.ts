import { atom } from 'jotai';
import { Message, type Channel } from '@pubnub/chat';

export const chatModeAtom = atom<'global' | 'alerts'>('global');
export const chatMessagesAtom = atom<Message[]>([]);
export const chatChannelsAtom = atom<{ general?: Channel; user?: Channel }>({});
