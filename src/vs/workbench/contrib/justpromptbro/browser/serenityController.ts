/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { mainWindow } from '../../../../base/browser/window.js';

/** List of encouragement video files */
const ENCOURAGEMENT_VIDEOS = [
	'encourage1.mp4',
	'encourage2.mp4',
	'encourage3.mp4',
	'encourage4.mp4',
];

/**
 * Controls the serenity mode - plays an encouragement video first,
 * then peaceful music when the user types in the AI chat input.
 */
export class SerenityController extends Disposable {

	private _audio: HTMLAudioElement | null = null;
	private _videoContainer: HTMLDivElement | null = null;
	private _video: HTMLVideoElement | null = null;
	private _isPlaying: boolean = false;

	constructor() {
		super();
	}

	/**
	 * Activate serenity mode - play encouragement video, then start music.
	 */
	activate(): void {
		console.log('JustPromptBro SerenityController: activate() called, isPlaying:', this._isPlaying);
		if (this._isPlaying) {
			return;
		}

		this._isPlaying = true;

		// Play encouragement video first
		this._showEncouragementVideo();
	}

	/**
	 * Show a random encouragement video in the center of the editor.
	 */
	private _showEncouragementVideo(): void {
		// Create container for the video (no backdrop)
		this._videoContainer = mainWindow.document.createElement('div');
		this._videoContainer.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			pointer-events: none;
			z-index: 999999;
		`;

		// Create video element
		this._video = mainWindow.document.createElement('video');
		this._video.style.cssText = `
			max-width: 80%;
			max-height: 80%;
			border-radius: 12px;
			box-shadow: 0 0 60px rgba(0, 204, 106, 0.5);
		`;
		this._video.autoplay = true;
		this._video.controls = false;

		// Pick a random encouragement video
		const randomVideo = ENCOURAGEMENT_VIDEOS[Math.floor(Math.random() * ENCOURAGEMENT_VIDEOS.length)];
		const videoUri = FileAccess.asBrowserUri(`vs/workbench/contrib/justpromptbro/browser/media/encouragement/${randomVideo}`);
		this._video.src = videoUri.toString(true);

		console.log('JustPromptBro SerenityController: Playing encouragement video:', randomVideo);

		// When video ends, remove it and start music
		this._video.addEventListener('ended', () => {
			this._removeEncouragementVideo();
			this._startMusic();
		});

		// Handle errors
		this._video.addEventListener('error', (e) => {
			console.warn('JustPromptBro SerenityController: Video error:', e);
			this._removeEncouragementVideo();
			this._startMusic();
		});

		this._videoContainer.appendChild(this._video);
		mainWindow.document.body.appendChild(this._videoContainer);

		// Start playing
		this._video.play().catch(err => {
			console.warn('JustPromptBro SerenityController: Could not play encouragement video:', err);
			this._removeEncouragementVideo();
			this._startMusic();
		});
	}

	/**
	 * Remove the encouragement video from DOM.
	 */
	private _removeEncouragementVideo(): void {
		if (this._video) {
			this._video.pause();
			this._video.src = '';
			this._video = null;
		}
		if (this._videoContainer) {
			this._videoContainer.remove();
			this._videoContainer = null;
		}
	}

	/**
	 * Start playing the serene background music.
	 */
	private _startMusic(): void {
		// Don't start music if serenity mode was deactivated while video was playing
		if (!this._isPlaying) {
			console.log('JustPromptBro SerenityController: Skipping music, serenity mode deactivated');
			return;
		}

		this._audio = this._createAudioElement();
		console.log('JustPromptBro SerenityController: Audio element created, src:', this._audio.src);
		this._audio.play().then(() => {
			console.log('JustPromptBro SerenityController: Audio playing successfully!');
		}).catch(err => {
			// Autoplay may be blocked by browser policy
			console.warn('JustPromptBro SerenityController: Could not autoplay serene music:', err);
		});
	}

	/**
	 * Deactivate serenity mode - stop the video and music.
	 */
	deactivate(): void {
		console.log('JustPromptBro SerenityController: deactivate() called, isPlaying:', this._isPlaying);

		if (!this._isPlaying) {
			console.log('JustPromptBro SerenityController: Already deactivated, skipping');
			return;
		}

		// Stop video if playing
		this._removeEncouragementVideo();

		// Stop audio
		if (this._audio) {
			console.log('JustPromptBro SerenityController: Stopping audio');
			this._audio.pause();
			this._audio.currentTime = 0;
			this._audio = null;
		}

		this._isPlaying = false;
		console.log('JustPromptBro SerenityController: Deactivated successfully');
	}

	private _createAudioElement(): HTMLAudioElement {
		const audio = new Audio();
		audio.loop = true;
		audio.volume = 0.5;

		// Set audio source using FileAccess for proper URI resolution
		const audioUri = FileAccess.asBrowserUri('vs/workbench/contrib/justpromptbro/browser/media/audio/serene.mp3');
		audio.src = audioUri.toString(true);

		return audio;
	}

	override dispose(): void {
		this.deactivate();
		super.dispose();
	}
}
