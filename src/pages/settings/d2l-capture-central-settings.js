import '@brightspace-ui/core/components/breadcrumbs/breadcrumb.js';
import '@brightspace-ui/core/components/breadcrumbs/breadcrumb-current-page.js';
import '@brightspace-ui/core/components/breadcrumbs/breadcrumbs.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui-labs/accordion/accordion-collapse.js';

import { bodyStandardStyles, heading2Styles, labelStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html } from 'lit-element/lit-element.js';
import { sharedEditStyles, sharedManageStyles } from '../../components/shared-styles.js';
import { DependencyRequester } from '../../mixins/dependency-requester-mixin.js';
import { PageViewElement } from '../../components/page-view-element.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';

class D2lCaptureSettings extends DependencyRequester(PageViewElement) {

	static get styles() {
		return [ bodyStandardStyles, heading2Styles, labelStyles, selectStyles, sharedEditStyles, sharedManageStyles, css`
			.d2l-capture-central-manage-header {
				border-bottom: none;
			}

			d2l-labs-accordion-collapse {
				margin-top: 25px;
			}
			.d2l-capture-central-settings-pre-post-roll-settings-container {
				display: flex;
				flex-direction: column;
			}

			.d2l-capture-central-edit-save-changes-button {
				margin-top: 0;
			}
		`];
	}

	constructor() {
		super();
		this._prerollClips = [{
			name: 'None',
		}, {
			name: 'Pre-roll Clip 1',
		}];

		this._postrollClips = [{
			name: 'None',
		}, {
			name: 'Post-roll Clip 1',
		}];
	}

	render() {
		return html`
			<div class="d2l-capture-central-manage-container">
				<d2l-breadcrumbs>
					<d2l-breadcrumb
						@click=${this._goTo('/admin')}
						href="#"
						text="${this.localize('captureCentral')}"
					></d2l-breadcrumb>
					<d2l-breadcrumb-current-page text="${this.localize('settings')}"></d2l-breadcrumb-current-page>
				</d2l-breadcrumbs>
				<div class="d2l-capture-central-manage-header">
					<h2 class="d2l-heading-2">${this.localize('prepostRollClipSettings')}</h2>
				</div>
				<d2l-labs-accordion-collapse class="d2l-capture-central-settings-pre-post-roll-settings" disabled opened flex no-icons>
					<div slot="header">${this.localize('liveEventSettings')}</div>
					<div class="d2l-capture-central-settings-pre-post-roll-settings-container">
						<label for="d2l-capture-central-settings-pre-roll-clip" class="d2l-label-styles">
							${this.localize('preRollClip')}
						</label>
						<select id="d2l-capture-central-settings-pre-roll-clip" class="d2l-input-select">
							${this._prerollClips.map(clip => (html`<option>${clip.name}</option>`))}
						</select>
						<label for="d2l-capture-central-settings-post-roll-clip" class="d2l-label-styles">
							${this.localize('postRollClip')}
						</label>
						<select id="d2l-capture-central-settings-post-roll-clip" class="d2l-input-select">
							${this._postrollClips.map(clip => (html`<option>${clip.name}</option>`))}
						</select>
						<d2l-input-checkbox>${this.localize('usersCanSkipPrepostRollClips')}</d2l-input-checkbox>
					</div>
				</d2l-labs-accordion-collapse>
				<d2l-button
					class="d2l-capture-central-edit-save-changes-button"
					primary
				>${this.localize('saveChanges')}
			</div>
		`;
	}
}

window.customElements.define('d2l-capture-central-settings', D2lCaptureSettings);
