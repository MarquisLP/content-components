import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';

import { css, html } from 'lit-element/lit-element.js';
import { DependencyRequester } from '../../mixins/dependency-requester-mixin.js';
import { InternalLocalizeMixin } from '../../mixins/internal-localize-mixin';
import { PageViewElement } from '../../components/page-view-element';

class D2LCaptureCentralApps extends InternalLocalizeMixin(DependencyRequester(PageViewElement)) {
	static get properties() {
		return {
			_encoderDownloads: { type: Array, attribute: false },
		};
	}

	static get styles() {
		return css`
			#d2l-capture-central-apps-page {
				margin-top: 30px;
				width: 100%;
			}

			#d2l-capture-central-apps-loading-container {
				display: flex;
				justify-content: center;
				width: 100%;
			}

			#d2l-capture-central-encoder-downloads-container {
				display: flex;
				flex-direction: column;
				margin-left: 30px;
			}
		`;
	}

	async connectedCallback() {
		super.connectedCallback();
		this.captureServiceClient = this.requestDependency('capture-service-client');
		this._encoderDownloads = await this.captureServiceClient.getEncoderUpdates();
	}

	render() {
		let content;
		if (!this._encoderDownloads) {
			content = html`
				<div id='d2l-capture-central-apps-loading-container'>
					<d2l-loading-spinner size="100"></d2l-loading-spinner>
				</div>
			`;
		} else if (this._encoderDownloads.length === 0) {
			content = html`
				<p class="d2l-body-standard">${this.localize('noAppsAvailable')}</p>
			`;
		} else {
			content = html`
				<div id='d2l-capture-central-encoder-downloads-container'>
					${this._encoderDownloads.map(encoderDownload => html`
						<p><a href="${encoderDownload.url}">${this.localize('captureEncoderFor', { platform: this._getFullPlatformName(encoderDownload.platform) })}</a></p>
					`)}
				</div>
			`;
		}

		return html`
			<div id="d2l-capture-central-apps-page">
				${content}
			</div>
		`;
	}

	_getFullPlatformName(shortPlatformName) {
		switch (shortPlatformName.toLowerCase()) {
			case 'mac':
				return this.localize('mac');
			case 'win':
				return this.localize('windows');
		}
	}
}

customElements.define('d2l-capture-central-apps', D2LCaptureCentralApps);
