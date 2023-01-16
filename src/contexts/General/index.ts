import { createContext } from 'react';
import { defaultGeneralContext } from './GeneralDefaults';

export * from './GeneralDefaults';
export * from './GeneralTypes';

export const GeneralContext = createContext(defaultGeneralContext);
