/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { getCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ChaosController } from './chaosController.js';
import { VideoPopupController } from './videoPopupWidget.js';
import { SerenityController } from './serenityController.js';
import { mainWindow } from '../../../../base/browser/window.js';

/**
 * JustPromptBro - The AI-First IDE that punishes manual coding.
 *
 * When users type in the code editor:
 * - Meme video popups progressively appear
 * - Videos have sound, creating layered audio chaos
 * - Popups cannot be closed manually
 *
 * When users type in the AI chat (Kilo Code):
 * - All video popups instantly vanish
 * - Serene music starts playing
 */
class JustPromptBroContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.justpromptbro';

	private readonly _chaosController: ChaosController;
	private readonly _videoController: VideoPopupController;
	private readonly _serenityController: SerenityController;
	private readonly _editorListeners = this._register(new DisposableStore());

	constructor(
		@IEditorService private readonly _editorService: IEditorService,
	) {
		super();

		// Initialize controllers
		this._chaosController = this._register(new ChaosController());
		this._videoController = this._register(new VideoPopupController());
		this._serenityController = this._register(new SerenityController());

		// Wire up chaos events
		this._register(this._chaosController.onSpawnPopup(() => {
			this._videoController.spawnPopup();
			// Mark that a meme video was played so encouragement video shows on serenity
			this._serenityController.onMemeVideoPlayed();
		}));

		this._register(this._chaosController.onEnterSerenity(() => {
			this._videoController.clearAllPopups();
			this._serenityController.activate();
		}));

		this._register(this._chaosController.onExitSerenity(() => {
			this._serenityController.deactivate();
		}));

		// Listen for active editor changes
		this._register(this._editorService.onDidActiveEditorChange(() => {
			this._onActiveEditorChanged();
		}));

		// Detect Kilo Code panel visibility/focus
		this._setupKiloCodeDetection();

		// Initialize with current editor
		this._onActiveEditorChanged();

		console.log('JustPromptBro: Initialized - Prepare for chaos!');
	}

	private _setupKiloCodeDetection(): void {
		// Simple approach: serenity mode when sidebar/auxiliarybar is focused
		// (excluding editor, terminal, and panel areas)

		// Helper to check if element is in sidebar area
		const isInSidebarArea = (element: Element | null): boolean => {
			if (!element) {
				return false;
			}
			return element.closest('.sidebar') !== null ||
				element.closest('.auxiliarybar') !== null;
		};

		// Helper to check if element is in excluded areas
		const isInExcludedArea = (element: Element | null): boolean => {
			if (!element) {
				return false;
			}
			return element.closest('.monaco-editor') !== null ||
				element.closest('.editor-instance') !== null ||
				element.closest('.terminal') !== null ||
				element.closest('.xterm') !== null ||
				(element.closest('.panel') !== null && !isInSidebarArea(element));
		};

		// Focus handler
		const focusHandler = (e: FocusEvent) => {
			const target = e.target as HTMLElement;
			if (!target) {
				return;
			}

			const inSidebar = isInSidebarArea(target);
			const inExcluded = isInExcludedArea(target);

			console.log('JustPromptBro: Focus - sidebar:', inSidebar, 'excluded:', inExcluded);

			if (inExcluded) {
				// Focused on editor/terminal - exit serenity mode and enable chaos
				console.log('JustPromptBro: Editor/terminal focused - EXITING SERENITY MODE!');
				this._chaosController.setChaosEnabled(true);
				this._chaosController.onLeaveSidebar();
				return;
			}

			if (inSidebar) {
				// Disable chaos when sidebar is focused (prevents memes during AI code generation)
				console.log('JustPromptBro: Sidebar focused - ENTERING SERENITY MODE!');
				this._chaosController.setChaosEnabled(false);
				this._chaosController.onAIInputTyping();
			}
		};

		mainWindow.document.addEventListener('focusin', focusHandler, true);
		this._register({
			dispose: () => mainWindow.document.removeEventListener('focusin', focusHandler, true)
		});

		// Polling fallback for webview focus (webviews don't bubble focus events)
		let pollInterval: ReturnType<typeof setInterval> | null = null;
		let wasInSidebar = false;

		const pollHandler = () => {
			const active = mainWindow.document.activeElement;

			// Check if active element or any ancestor is in sidebar
			const inSidebar = isInSidebarArea(active);
			const inExcluded = isInExcludedArea(active);

			// Also check if a webview in sidebar has focus
			const webviewInSidebar = active?.tagName?.toLowerCase() === 'webview' ||
				active?.tagName?.toLowerCase() === 'iframe';

			if (!inExcluded && (inSidebar || webviewInSidebar)) {
				if (!wasInSidebar) {
					console.log('JustPromptBro: Poll detected sidebar focus - ENTERING SERENITY MODE!');
					this._chaosController.setChaosEnabled(false);
					this._chaosController.onAIInputTyping();
					wasInSidebar = true;
				}
			} else {
				if (wasInSidebar) {
					console.log('JustPromptBro: Poll detected leaving sidebar - EXITING SERENITY MODE!');
					this._chaosController.setChaosEnabled(true);
					this._chaosController.onLeaveSidebar();
				}
				wasInSidebar = false;
			}
		};

		pollInterval = mainWindow.setInterval(pollHandler, 100);
		this._register({
			dispose: () => {
				if (pollInterval) {
					mainWindow.clearInterval(pollInterval);
				}
			}
		});
	}

	private _onActiveEditorChanged(): void {
		// Clear previous editor listeners
		this._editorListeners.clear();

		// Get the new active code editor
		const editor = getCodeEditor(this._editorService.activeTextEditorControl);

		console.log('JustPromptBro: Active editor changed, editor:', editor ? 'found' : 'null');

		if (!editor) {
			return;
		}

		console.log('JustPromptBro: Attaching listener to editor');

		// Listen for text changes in this editor
		this._editorListeners.add(
			editor.onDidChangeModelContent((event) => {
				// Calculate total characters changed
				let totalChars = 0;
				for (const change of event.changes) {
					totalChars += change.text.length;
				}

				console.log('JustPromptBro: Text changed, chars:', totalChars);

				// Only trigger chaos if text was added (not deleted)
				if (totalChars > 0) {
					const result = this._chaosController.onEditorKeystroke(totalChars);
					console.log('JustPromptBro: Keystroke result:', result);
				}
			})
		);
	}
}

// Register the contribution to start after the workbench is restored
registerWorkbenchContribution2(
	JustPromptBroContribution.ID,
	JustPromptBroContribution,
	WorkbenchPhase.AfterRestored
);
