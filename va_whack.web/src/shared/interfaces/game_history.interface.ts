/** @format */

import type { IEnagementGameSession, IScaleGameSession } from '..';

export interface IGameHistory {
	scaleGames: IScaleGameSession[];
	enagementGames: IEnagementGameSession[];
}
