import 'file-drop-element';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import { formatFileSize } from '@brightspace-ui/intl/lib/fileSize.js';
import { bodyCompactStyles, bodySmallStyles, bodyStandardStyles, heading2Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';
import { inputLabelStyles } from '@brightspace-ui/core/components/inputs/input-label-styles.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { css, html, LitElement } from 'lit-element';
import { RequesterMixin } from '@brightspace-ui/core/mixins/provider-mixin.js';
import { InternalLocalizeMixin } from '../mixins/internal-localize-mixin';
import { getSupportedExtensions, isSupported } from '../util/media-type-util';

export class Upload extends RtlMixin(RequesterMixin(InternalLocalizeMixin(LitElement))) {
	static get properties() {
		return {
			errorMessage: { type: String, attribute: 'error-message', reflect: true },
			maxFileSizeInBytes: { type: Number, attribute: 'max-file-size' },
		};
	}

	static get styles() {
		return [ bodySmallStyles,
			bodyStandardStyles,
			heading2Styles,
			bodyCompactStyles,
			selectStyles,
			inputLabelStyles, css`
			file-drop {
				display: block;
				border: 2px dashed var(--d2l-color-corundum);
			}
			@media screen and (max-width: 480px) {
				#no-file-drop-container {
					display: block;
					padding: 30vh 20px 10px 20px;
				}
			}
			@media screen and (min-width: 481px) {
				#no-file-drop-container {
					display: block;
					padding: 8vh 20px 10px 20px;
				}
			}
			file-drop.drop-valid {
				background-color: var(--d2l-color-gypsum);
				border: 2px dashed var(--d2l-color-feedback-action);
			}
			file-drop.drop-invalid {
				background-color: var(--d2l-color-gypsum);
				border: 2px dashed var(--d2l-color-feedback-error);
			}
			.file-drop-content-container {
				text-align: center;
				margin: 1.5rem 0;
			}
			#file-select {
				display: none;
			}
			#file-size-limit {
				margin-top: 20px;
			}
			#error-message {
				color: var(--d2l-color-feedback-error);
			}
			.upload-container {
				display: flex;
				flex-direction: column;
			}
			.upload-options-container {
				height: 0px;
				padding-top: 0.5rem;
			}
			table {
				border-collapse: collapse;
			}
		`];
	}

	constructor() {
		super();
		this._supportedTypes = getSupportedExtensions();
		this.enableFileDrop = false;
	}

	async connectedCallback() {
		super.connectedCallback();

		this.client = this.requestInstance('content-service-client');

		this.userBrightspaceClient = this.requestInstance('user-brightspace-client');
	}

	render() {
		return html`
			<div class="upload-container">
				<file-drop @filedrop=${this.onFileDrop}>
					<div class="file-drop-content-container">
						<h2 class="d2l-heading-2">${this.localize('dropAudioVideoFile')}</h2>
						<p class="d2l-body-standard">${this.localize('or')}</p>
						<d2l-button
							description=${this.localize('browseForFile')}
							@click=${this.onBrowseClick}
						>
							${this.localize('browse')}
							<input
								id="file-select"
								type="file"
								accept=${this._supportedTypes.join(',')}
								@change=${this.onFileInputChange}
							/>
						</d2l-button>
						${this.errorMessage ? html`<p id="error-message" class="d2l-body-compact">${this.errorMessage}&nbsp;</p>` : ''}
					</div>
				</file-drop>
				<p>${this.localize('fileSizeLimitMessage', {localizedMaxFileSize: formatFileSize(this.maxFileSizeInBytes)})}</p>
			</div>
		`;
	}

	onBrowseClick() {
		this.shadowRoot.getElementById('file-select').click();
	}

	onFileDrop(event) {
		this.processFiles(event.files);
	}

	onFileInputChange(event) {
		this.processFiles(event.target.files);
	}

	processFiles(files) {
		if (files.length !== 1) {
			this.dispatchEvent(new CustomEvent('file-drop-error', {
				detail: {
					message: this.localize('mayOnlyUpload1File')
				},
				bubbles: true,
				composed: true
			}));
			return;
		}

		const file = files[0];
		if (!isSupported(file.name)) {
			this.dispatchEvent(new CustomEvent('file-error', {
				detail: {
					message: this.localize('invalidFileType')
				},
				bubbles: true,
				composed: true
			}));
			return;
		}
		if (file.size > this.maxFileSizeInBytes) {
			this.dispatchEvent(new CustomEvent('file-error', {
				detail: {
					message: this.localize('fileTooLarge', {localizedMaxFileSize: formatFileSize(this.maxFileSizeInBytes)})
				},
				bubbles: true,
				composed: true
			}));
			return;
		}

		this.dispatchEvent(new CustomEvent('file-change', {
			detail: { file },
			bubbles: true,
			composed: true
		}));
	}
}

customElements.define('d2l-content-uploader-upload', Upload);
