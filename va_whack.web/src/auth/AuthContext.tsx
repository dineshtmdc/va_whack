/** @format */

import { createContext } from 'react';
import type { IAuthContext } from '../shared';

export const AuthContext = createContext<IAuthContext | undefined>(undefined);
