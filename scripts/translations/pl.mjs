/** The Polish translation table, assembled per subject. */
import { python } from './pl-python.mjs';
import { typescript } from './pl-typescript.mjs';
import { playwright } from './pl-playwright.mjs';
import { english } from './pl-english.mjs';

export const pl = { ...python, ...typescript, ...playwright, ...english };
