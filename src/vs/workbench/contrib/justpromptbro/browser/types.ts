/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Configuration constants for JustPromptBro chaos system
 */
export const CHAOS_CONFIG = {
	/** Number of keystrokes required to spawn one video popup */
	KEYSTROKES_PER_POPUP: 5,
	/** Maximum number of video popups that can be displayed at once */
	MAX_POPUPS: 20,
	/** Video popup dimensions in pixels */
	POPUP_WIDTH: 450,
	POPUP_HEIGHT: 300,
} as const;

/**
 * State of the chaos system
 */
export interface IChaosState {
	/** Total keystrokes since last reset */
	keystrokeCount: number;
	/** Number of currently active video popups */
	activePopupCount: number;
	/** Whether serenity mode is currently active */
	isSerenityMode: boolean;
}

/**
 * Result from processing a keystroke event
 */
export interface IKeystrokeResult {
	/** Whether a new popup should be spawned */
	shouldSpawnPopup: boolean;
	/** Current number of active popups */
	popupCount: number;
}
