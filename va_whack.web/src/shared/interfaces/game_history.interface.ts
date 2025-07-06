/** ==============================================================================
# FILE: va_whack.web\src\shared\interfaces\game_history.interface.ts
# ==============================================================================
 */

/** @format */

import type { IEnagementGameSession, IScaleGameSession } from '..';

export interface IGameHistory {
	scaleGames: IScaleGameSession[];
	engagementGames: IEnagementGameSession[];
}
