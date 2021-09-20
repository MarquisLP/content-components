import * as querystring from '@chaitin/querystring';
import auth from 'd2l-fetch-auth/src/unframed/index.js';
import { d2lfetch } from 'd2l-fetch/src/index.js';

d2lfetch.use({ name: 'auth', fn: auth });

export default class ContentServiceClient {
	constructor({
		endpoint,
		tenantId,
		onUploadProgress
	}) {
		this.endpoint = endpoint;
		this.tenantId = tenantId;
		this.onUploadProgress = onUploadProgress;
	}

	deleteMetadata({ contentId, revisionId, draft = false }) {
		return this._fetch({
			path: `/api/${this.tenantId}/content/${contentId}/revisions/${revisionId}/metadata`,
			method: 'DELETE',
			query: { draft }
		});
	}

	deleteRevision({ contentId, revisionId }) {
		return this._fetch({
			path: `/api/${this.tenantId}/content/${contentId}/revisions/${revisionId}`,
			method: 'DELETE'
		});
	}

	get dump() {
		return `Content Service Client: ${this.endpoint}`;
	}

	async getCaptions({ contentId, revisionId, locale, draft = false }) {
		const headers = new Headers();
		headers.append('pragma', 'no-cache');
		headers.append('cache-control', 'no-cache');
		const { captionsUrl } = await this._fetch({
			path: `/api/${this.tenantId}/content/${contentId}/revisions/${revisionId}/captions/${locale}`,
			query: { draft, urlOnly: true },
			headers
		});

		// The direct download URL to the captions file is already signed,
		// so if we include the Authorization header from d2l-fetch-auth,
		// AWS will reject saying there are too many authorization mechanisms.
		// https://stackoverflow.com/q/31514336
		const response = await d2lfetch
			.removeTemp('auth')
			.fetch(new Request(captionsUrl));
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		return response;

	}

	getContent(id) {
		return this._fetch({
			path: `/api/${this.tenantId}/content/${id}`
		});
	}

	getMetadata({ contentId, revisionId, draft = false }) {
		const headers = new Headers();
		headers.append('pragma', 'no-cache');
		headers.append('cache-control', 'no-cache');
		return this._fetch({
			path: `/api/${this.tenantId}/content/${contentId}/revisions/${revisionId}/metadata`,
			query: { draft },
			headers
		});
	}

	getRevision({ contentId, revisionId }) {
		return this._fetch({
			path: `/api/${this.tenantId}/content/${contentId}/revisions/${revisionId}`
		});
	}

	getSignedUrl(contentId) {
		return this._fetch({
			path: `/api/${this.tenantId}/content/${contentId}/signedUrl`
		});
	}

	getSignedUrlForRevision({ contentId, revisionId }) {
		return this._fetch({
			path: `/api/${this.tenantId}/content/${contentId}/revisions/${revisionId}/signedUrl`
		});
	}

	processRevision({
		contentId,
		revisionId,
		body,
	}) {
		return this._fetch({
			path: `/api/${this.tenantId}/content/${contentId}/revisions/${revisionId}/process`,
			method: 'POST',
			body,
		});
	}

	updateContent({id, body}) {
		return this._fetch({
			path: `/api/${this.tenantId}/content/${id}`,
			method: 'PUT',
			body
		});
	}

	updateMetadata({ contentId, revisionId, draft = false, metadata }) {
		return this._fetch({
			path: `/api/${this.tenantId}/content/${contentId}/revisions/${revisionId}/metadata`,
			method: 'PUT',
			query: { draft },
			body: metadata,
			extractJsonBody: false // The PUT metadata route returns no content (status 204)
		});
	}

	updateRevision({ contentId, revisionId, revision }) {
		return this._fetch({
			path: `/api/${this.tenantId}/content/${contentId}/revisions/${revisionId}`,
			method: 'PUT',
			body: revision
		});
	}

	async _fetch({
		path,
		method = 'GET',
		query,
		body,
		extractJsonBody = true,
		headers = new Headers()
	}) {
		if (body) {
			headers.append('Content-Type', 'application/json');
		}

		const requestInit = {
			method,
			...body && {
				body: JSON.stringify(body)
			},
			headers
		};
		const request = new Request(this._url(path, query), requestInit);

		const response = await d2lfetch.fetch(request);
		if (!response.ok) {
			throw new Error(response.statusText);
		}

		if (extractJsonBody) {
			return response.json();
		}

		return response;
	}

	_url(path, query) {
		const qs = query ? `?${querystring.stringify(query)}` : '';
		return `${this.endpoint}${path}${qs}`;
	}
}
