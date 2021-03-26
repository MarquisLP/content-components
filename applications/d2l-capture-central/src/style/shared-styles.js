import '@brightspace-ui/core/components/colors/colors';
import { css } from 'lit-element/lit-element.js';

export const sharedManageStyles = css`
	.d2l-capture-central-manage-container {
		display: flex;
		flex-direction: column;
		margin-bottom: 50px;
	}

	.d2l-capture-central-manage-header {
		align-items: center;
		border-bottom: 1px solid var(--d2l-color-mica);
		display: flex;
		justify-content: space-between;
	}

	.d2l-capture-central-manage-header .d2l-heading-2 {
		margin-right: 25px;
	}

	.d2l-capture-central-manage-num-selected {
		margin: 20px 0;
	}

	.d2l-capture-central-manage-options {
		display: flex;
	}

	.d2l-capture-central-manage-options d2l-input-search {
		margin-left: auto;
		width: 350px;
	}

	.d2l-capture-central-manage-options d2l-button {
		margin-right: 25px;
	}
`;

export const sharedTableStyles = css`
	d2l-table-wrapper {
		margin-top: 20px;
	}

	.d2l-capture-central-table-caption {
		display: none;
	}

	.d2l-capture-central-table-no-results {
		text-align: center !important;
	}

	.d2l-capture-central-th-container {
		align-items: center;
		display: flex;
		white-space: nowrap;
	}

	.d2l-capture-central-th-checkbox-container, .d2l-capture-central-th-more-options-container {
		width: 10px;
	}

	d2l-input-checkbox {
		margin: 0;
	}
`;

export const sharedEditStyles = css`
	.d2l-capture-central-edit-container {
		display: flex;
		flex-direction: column;
		margin-bottom: 50px;
		margin-top: 25px;
	}

	d2l-input-text,
	d2l-labs-accordion-collapse,
	.d2l-capture-central-edit-textarea-container,
	.d2l-input-select {
		margin-bottom: 25px;
		max-width: 575px;
	}

	.d2l-capture-central-edit-textarea-container textarea {
		resize: vertical;
	}

	d2l-labs-accordion-collapse div[slot=header] {
		border-bottom: 1px solid var(--d2l-color-mica);
	}

	.d2l-capture-central-edit-save-changes-button {
		margin-top: 25px;
		width: 150px;
	}
`;

