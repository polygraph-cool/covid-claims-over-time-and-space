import { writable } from "svelte/store";

export const storyIndex = writable(0);
export const chapterIndex = writable(0);
export const chapter = writable({});
export const panel1 = writable(null);
export const panel1ActiveSubsectionIndex = writable(null);
export const doScrollToSubsection = writable(false);
export const panel2 = writable(null);
export const terms = writable([]);
export const asides = writable({});
export const references = writable({});
