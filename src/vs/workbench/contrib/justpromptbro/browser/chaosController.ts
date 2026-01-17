/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { CHAOS_CONFIG, IChaosState, IKeystrokeResult } from './types.js';

/**
 * Manages the chaos state machine for JustPromptBro.
 * Tracks keystrokes and determines when to spawn video popups.
 */
export class ChaosController extends Disposable {

	private readonly _onSpawnPopup = this._register(new Emitter<void>());
	/** Fired when a new video popup should be spawned */
	readonly onSpawnPopup: Event<void> = this._onSpawnPopup.event;

	private readonly _onEnterSerenity = this._register(new Emitter<void>());
	/** Fired when serenity mode should be activated */
	readonly onEnterSerenity: Event<void> = this._onEnterSerenity.event;

	private readonly _onExitSerenity = this._register(new Emitter<void>());
	/** Fired when serenity mode should be deactivated */
	readonly onExitSerenity: Event<void> = this._onExitSerenity.event;

	private readonly _state: IChaosState = {
		keystrokeCount: 0,
		activePopupCount: 0,
		isSerenityMode: false,
	};

	constructor() {
		super();
	}

	/**
	 * Process keystrokes from the editor.
	 * Call this when the user types in the code editor.
	 * @param characterCount Number of characters typed (for paste events, this can be > 1)
	 */
	onEditorKeystroke(characterCount: number = 1): IKeystrokeResult {
		// Exit serenity mode if we were in it
		if (this._state.isSerenityMode) {
			this._exitSerenityMode();
		}

		// Count keystrokes (for paste: 1 keystroke per 10 characters)
		const keystrokesToAdd = characterCount > 10
			? Math.ceil(characterCount / 10)
			: 1;

		this._state.keystrokeCount += keystrokesToAdd;

		// Calculate how many popups we should have
		const targetPopups = Math.min(
			Math.floor(this._state.keystrokeCount / CHAOS_CONFIG.KEYSTROKES_PER_POPUP),
			CHAOS_CONFIG.MAX_POPUPS
		);

		// Spawn new popup if needed
		if (targetPopups > this._state.activePopupCount) {
			this._state.activePopupCount = targetPopups;
			this._onSpawnPopup.fire();
			return { shouldSpawnPopup: true, popupCount: this._state.activePopupCount };
		}

		return { shouldSpawnPopup: false, popupCount: this._state.activePopupCount };
	}

	/**
	 * Called when the user types in the AI chat input (Kilo Code).
	 * Triggers serenity mode.
	 */
	onAIInputTyping(): void {
		if (!this._state.isSerenityMode) {
			this._enterSerenityMode();
		}
	}

	private _enterSerenityMode(): void {
		console.log('JustPromptBro ChaosController: _enterSerenityMode() called');
		this._state.isSerenityMode = true;
		this._state.keystrokeCount = 0;
		this._state.activePopupCount = 0;
		console.log('JustPromptBro ChaosController: Firing onEnterSerenity event');
		this._onEnterSerenity.fire();
	}

	/**
	 * Called when user leaves the sidebar/AI area.
	 * Exits serenity mode if active.
	 */
	onLeaveSidebar(): void {
		if (this._state.isSerenityMode) {
			console.log('JustPromptBro ChaosController: onLeaveSidebar() - exiting serenity');
			this._exitSerenityMode();
		}
	}

	private _exitSerenityMode(): void {
		console.log('JustPromptBro ChaosController: _exitSerenityMode() called');
		this._state.isSerenityMode = false;
		this._onExitSerenity.fire();
	}
}
