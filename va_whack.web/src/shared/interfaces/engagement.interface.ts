/**
 * ==============================================================================
 * # FILE: va_whack.web\src\shared\interfaces\engagement.interface.ts
 * # ==============================================================================
 *
 * @format
 */

import type { IUserDetails } from '..';

export interface IMole {
	id: number;
	row: number;
	col: number;
	mole_type: 'mole' | 'fake-mole';
	appearTime: number;
}

export interface IEnagementGameConfig {
	mouseSize: number;
	holeSize: number;
	holeGap: number;
	fakeCount: number;
	spawnInterval: number;
	holeColor: string;
	bgColor: string;
}

export interface IEnagementGameSession {
	gameId: string;
	email: string;
	config: IEnagementGameConfig;
	events: IAppearanceEvent[];
	startTime: number; // optional: for session tracking
	endTime?: number;
	scores: IEnagementScoreSummary;
	masterSessionId: string;
}

export interface IAppearanceEvent {
	id: number; // zero-based index within this session
	targetType: 'mole' | 'fake-mole';
	mouseSize: number; // px
	row: number;
	col: number;
	quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';

	appearTime: number; // ms timestamp
	clicked: boolean; // true if user clicked at all during this appearance
	clickTime?: number; // ms timestamp of click
	clickX?: number; // any coordinate system you choose
	clickY?: number;
	// outcome flags (computed in front end)
	wasHit?: boolean; // true if clicked inside the mole’s area
	wasDistractorClicked?: boolean; // true if targetType==='rabbit' and user clicked
	distanceFromCenter?: number;
}

// End-of-session summary interface
export interface IEnagementScoreSummary {
	SS1_detectionSpeed?: number; // in ms
	SS2_detectionAccuracy?: number; // in px
	SS3_spatialUniformity?: number; // 0–100
	SS4_sensitivityThreshold?: number; // 0–100
	SS5_falsePositiveRate?: number; // percentage
	SS6_missRate?: number; // percentage
	SS7_clickValidity?: number; // percentage
	SS8_trialConsistency?: number; // sum of std devs
	SS9_maxHitStreak?: number; // count
	SS10_coordinationProxy?: number; // 0–100
	SS11_targetDiscrimination?: number; // percentage

	VAfinal?: number; // logMAR

	totalTrials: number;
	totalMoleTrials: number;
	totalFakeTrials: number;
}

export interface IVAGameSession {
	gameId: string;
	user: IUserDetails;
	config: IEnagementGameConfig;
	events: IAppearanceEvent[];
	startTime: number; // optional: for session tracking
	endTime?: number;
}
