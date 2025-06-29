/** @format */

import type { ResponseOption, ScaleMethod } from '..';

export interface IVAScaleGameConfig {
	holeSize: number;
	minHoleSize: number;
	maxHoleSize: number;
	ratio: number;
	innerColor: string;
	outerColor: string;
	bgColor: string;
	holeGap: number;
	verticalPadding: number;
	horizontalPadding: number;
	viewingDistanceCm: number;
}

export interface IScaleLogEntry {
	timestamp: number;
	outerDiameter: number;
	innerDiameter: number;
	ratio: number;
	scaleMethod: ScaleMethod;
	logmar: number;
	userResponse?: ResponseOption;
}

export interface IScaleGameSession {
	gameId: string;
	email: string;
	startTime: number;
	endTime?: number;
	config: IVAScaleGameConfig;
	logEntries: IScaleLogEntry[];
	score: IScaleGameScore;
}

export interface IScaleGameScore {
	// Derived stats
	bestVA: number; // minimum logMAR
	n: number; // total number of entries
	b: number; // count of 'I can see' responses
	finalVA: number; // last logMAR
}
