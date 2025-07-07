/**
 * ==============================================================================
 * # FILE: va_whack.web\src\shared\interfaces\va_moving.interface.ts
 * # ==============================================================================
 *
 * @format
 */

/** @format */

export interface IVAMovingGameConfig {
	moveSpeed?: number; // deg/s
	moveDirection?: 'left-to-right' | 'right-to-left';
	viewingDistanceCm?: number;
	brightness?: number; // 0–100%
	logMar: number;
	ratio: number;
	centralIntensity: number; // 0–100%
	surroundIntensity: number; // 0–100%
	spacingDeg?: number;
	outerColor: string;
	innerColor: string;
	bgColor: string;
}

export interface IVAGameSession {
	gameId: string;
	email: string;
	config: IVAMovingGameConfig;
	startTime: number; // optional: for session tracking
	endTime?: number;
}
