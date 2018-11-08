import { SFC } from 'react';
import { createSubType } from './typescript';

// This helper allows us to restrict a value to a SFC without specifying the props type, so they can be inferred.
export const createSFC = createSubType<SFC<any>>();
