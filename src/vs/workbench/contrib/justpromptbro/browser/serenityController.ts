/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { mainWindow } from '../../../../base/browser/window.js';

/**
 * Controls the serenity mode - plays an encouragement video first, then peaceful music.
 */
export class SerenityController extends Disposable {

	private _audio: HTMLAudioElement | null = null;
	private _video: HTMLVideoElement | null = null;
	private _videoContainer: HTMLElement | null = null;
	private _isActive: boolean = false;
	private _musicDelayTimeout: ReturnType<typeof setTimeout> | null = null;
	private _memeVideoPlayed: boolean = false;

	private readonly _encouragementVideos = [
		'encourage1.mp4',
		'encourage2.mp4',
		'encourage3.mp4',
		'encourage4.mp4',
	];

	private readonly _sereneAudios = [
		'serene1.mp3',
		'serene2.mp3',
		'serene3.mp3',
		'serene4.mp3',
	];

	constructor() {
		super();
	}

	/**
	 * Call this when a meme video is played to enable encouragement video on next serenity.
	 */
	onMemeVideoPlayed(): void {
		this._memeVideoPlayed = true;
		console.log('JustPromptBro SerenityController: Meme video played flag set to true');
	}

	/**
	 * Activate serenity mode - play encouragement video (if meme was played), then start music.
	 */
	activate(): void {
		console.log('JustPromptBro SerenityController: activate() called, isActive:', this._isActive, 'memeVideoPlayed:', this._memeVideoPlayed);
		if (this._isActive) {
			return;
		}

		this._isActive = true;

		// Only show encouragement video if a meme video was played before
		if (this._memeVideoPlayed) {
			// Reset the flag since we're now showing encouragement
			this._memeVideoPlayed = false;

			// Pick a random encouragement video
			const videoFile = this._encouragementVideos[Math.floor(Math.random() * this._encouragementVideos.length)];
			console.log('JustPromptBro SerenityController: Playing encouragement video:', videoFile);

			// Create and show the encouragement video
			this._showEncouragementVideo(videoFile);
		} else {
			// No meme video was played, just start music directly
			console.log('JustPromptBro SerenityController: No meme video played, starting music directly');
			this._startMusic();
		}
	}

	private _showEncouragementVideo(videoFile: string): void {
		// Create container for centered video
		this._videoContainer = mainWindow.document.createElement('div');
		this._videoContainer.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: rgba(0, 0, 0, 0.8);
			z-index: 999999;
			pointer-events: none;
		`;

		// Create video element
		this._video = mainWindow.document.createElement('video');
		this._video.style.cssText = `
			max-width: 80%;
			max-height: 80%;
			border-radius: 12px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		`;
		this._video.autoplay = true;
		this._video.muted = false;
		this._video.volume = 0.7;

		const videoUri = FileAccess.asBrowserUri(`vs/workbench/contrib/justpromptbro/browser/media/encouragement/${videoFile}`);
		this._video.src = videoUri.toString(true);

		// When video ends, remove it and start music
		this._video.onended = () => {
			console.log('JustPromptBro SerenityController: Encouragement video ended, starting music');
			this._removeVideo();
			this._startMusic();
		};

		// Fallback: if video metadata loads, set a timeout based on duration
		this._video.onloadedmetadata = () => {
			if (this._video) {
				const duration = this._video.duration * 1000; // Convert to ms
				console.log('JustPromptBro SerenityController: Video duration:', duration, 'ms');

				// Set fallback timeout in case onended doesn't fire
				this._musicDelayTimeout = mainWindow.setTimeout(() => {
					if (this._isActive && !this._audio) {
						console.log('JustPromptBro SerenityController: Fallback timeout - starting music');
						this._removeVideo();
						this._startMusic();
					}
				}, duration + 500); // Add small buffer
			}
		};

		// Handle video load error
		this._video.onerror = () => {
			console.warn('JustPromptBro SerenityController: Video failed to load, starting music immediately');
			this._removeVideo();
			this._startMusic();
		};

		this._videoContainer.appendChild(this._video);
		mainWindow.document.body.appendChild(this._videoContainer);

		this._video.play().catch(err => {
			console.warn('JustPromptBro SerenityController: Could not autoplay video:', err);
			this._removeVideo();
			this._startMusic();
		});
	}

	private _removeVideo(): void {
		if (this._musicDelayTimeout) {
			mainWindow.clearTimeout(this._musicDelayTimeout);
			this._musicDelayTimeout = null;
		}
		if (this._video) {
			this._video.pause();
			this._video.onended = null;
			this._video.onloadedmetadata = null;
			this._video.onerror = null;
			this._video = null;
		}
		if (this._videoContainer && this._videoContainer.parentNode) {
			this._videoContainer.parentNode.removeChild(this._videoContainer);
			this._videoContainer = null;
		}
	}

	private _startMusic(): void {
		if (!this._isActive) {
			return;
		}
		this._audio = this._createAudioElement();
		console.log('JustPromptBro SerenityController: Audio element created, src:', this._audio.src);
		this._audio.play().then(() => {
			console.log('JustPromptBro SerenityController: Audio playing successfully!');
		}).catch(err => {
			console.warn('JustPromptBro SerenityController: Could not autoplay serene music:', err);
		});
	}

	/**
	 * Deactivate serenity mode - stop video and music.
	 */
	deactivate(): void {
		console.log('JustPromptBro SerenityController: deactivate() called, isActive:', this._isActive);

		if (!this._isActive) {
			console.log('JustPromptBro SerenityController: Already deactivated, skipping');
			return;
		}

		// Stop any pending music start
		if (this._musicDelayTimeout) {
			mainWindow.clearTimeout(this._musicDelayTimeout);
			this._musicDelayTimeout = null;
		}

		// Remove video if still playing
		this._removeVideo();

		// Stop audio
		if (this._audio) {
			console.log('JustPromptBro SerenityController: Stopping audio');
			this._audio.pause();
			this._audio.currentTime = 0;
			this._audio = null;
		}

		this._isActive = false;
		console.log('JustPromptBro SerenityController: Deactivated successfully');
	}

	private _createAudioElement(): HTMLAudioElement {
		const audio = new Audio();
		audio.loop = true;
		audio.volume = 0.5;

		// Pick a random serene audio file
		const audioFile = this._sereneAudios[Math.floor(Math.random() * this._sereneAudios.length)];
		const audioUri = FileAccess.asBrowserUri(`vs/workbench/contrib/justpromptbro/browser/media/audio/${audioFile}`);
		audio.src = audioUri.toString(true);

		return audio;
	}

	override dispose(): void {
		this.deactivate();
		super.dispose();
	}
}
