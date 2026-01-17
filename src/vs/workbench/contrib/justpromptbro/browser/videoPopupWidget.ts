/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { CHAOS_CONFIG } from './types.js';

/**
 * A single video popup that appears anywhere in the IDE.
 * Displays a meme video at a random position on screen.
 */
export class VideoPopupWidget extends Disposable {

	private readonly _id: string;
	private readonly _domNode: HTMLElement;

	constructor(
		private readonly _videoFile: string,
		initialPosition: { top: number; left: number }
	) {
		super();

		this._id = `justpromptbro-video-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
		console.log('JustPromptBro: VideoPopupWidget constructor, id:', this._id);
		console.log('JustPromptBro: Initial position:', initialPosition);

		this._domNode = this._createDomNode(initialPosition);

		// Add to document body
		mainWindow.document.body.appendChild(this._domNode);

		console.log('JustPromptBro: Popup added to body!');

		// Clean up when disposed
		this._register({
			dispose: () => {
				console.log('JustPromptBro: Removing popup:', this._id);
				if (this._domNode.parentNode) {
					this._domNode.parentNode.removeChild(this._domNode);
				}
			}
		});
	}

	private _createDomNode(position: { top: number; left: number }): HTMLElement {
		const container = mainWindow.document.createElement('div');
		container.className = 'justpromptbro-video-popup';
		container.style.cssText = `
			position: fixed;
			top: ${position.top}px;
			left: ${position.left}px;
			width: ${CHAOS_CONFIG.POPUP_WIDTH}px;
			height: ${CHAOS_CONFIG.POPUP_HEIGHT}px;
			background-color: black;
			border-radius: 8px;
			overflow: hidden;
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
			pointer-events: none;
			z-index: 999999;
		`;

		// Create video element
		const video = mainWindow.document.createElement('video');
		video.style.cssText = `
			width: 100%;
			height: 100%;
			object-fit: cover;
		`;
		video.autoplay = true;
		video.loop = true;
		video.muted = false;
		video.volume = 0.5;

		// Set video source using FileAccess for proper URI resolution
		const videoUri = FileAccess.asBrowserUri(`vs/workbench/contrib/justpromptbro/browser/media/videos/${this._videoFile}`);
		video.src = videoUri.toString(true);

		// Play video
		video.play().catch(err => {
			console.warn('JustPromptBro: Could not autoplay video:', err);
		});

		container.appendChild(video);

		console.log('JustPromptBro: Created video popup:', this._videoFile);

		return container;
	}
}

/**
 * Manages multiple video popup widgets.
 * Handles spawning, positioning, and clearing all popups.
 */
export class VideoPopupController extends Disposable {

	private readonly _popups: VideoPopupWidget[] = [];
	private readonly _videoFiles = [
		'meme1.mp4',
		'meme2.mp4',
		'meme3.mp4',
		'meme4.mp4',
		'meme5.mp4',
	];

	constructor() {
		super();
	}

	/**
	 * Spawn a new video popup anywhere in the IDE.
	 * @returns The created popup, or undefined if max popups reached
	 */
	spawnPopup(): VideoPopupWidget | undefined {
		console.log('JustPromptBro: spawnPopup called, current count:', this._popups.length);

		if (this._popups.length >= CHAOS_CONFIG.MAX_POPUPS) {
			console.log('JustPromptBro: Max popups reached');
			return undefined;
		}

		const videoFile = this._videoFiles[this._popups.length % this._videoFiles.length];
		const position = this._getRandomPosition();

		console.log('JustPromptBro: Creating popup at position:', position);

		const popup = new VideoPopupWidget(videoFile, position);
		this._popups.push(popup);

		console.log('JustPromptBro: Popup created successfully');
		return popup;
	}

	/**
	 * Clear all video popups.
	 */
	clearAllPopups(): void {
		console.log('JustPromptBro VideoController: clearAllPopups() called, count:', this._popups.length);
		for (const popup of this._popups) {
			popup.dispose();
		}
		this._popups.length = 0;
		console.log('JustPromptBro VideoController: All popups cleared');
	}

	private _getRandomPosition(): { top: number; left: number } {
		// Use full window dimensions
		const maxTop = Math.max(0, mainWindow.innerHeight - CHAOS_CONFIG.POPUP_HEIGHT);
		const maxLeft = Math.max(0, mainWindow.innerWidth - CHAOS_CONFIG.POPUP_WIDTH);

		return {
			top: Math.floor(Math.random() * maxTop),
			left: Math.floor(Math.random() * maxLeft),
		};
	}

	override dispose(): void {
		this.clearAllPopups();
		super.dispose();
	}
}
