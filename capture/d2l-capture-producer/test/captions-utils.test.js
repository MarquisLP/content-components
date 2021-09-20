import { convertSrtTextToVttText, formatTimestampText } from '../src/captions-utils.js';
import { assert } from '@open-wc/testing';

describe('captions-utils.js', () => {
	describe('formatTimestampText', () => {
		it('works for timestamps < 1 minute', () => {
			const expected = '00:00:37.000';
			const actual = formatTimestampText(37);
			assert.equal(actual, expected);
		});

		it('works for timestamps > 1 minute and < 1 hour', () => {
			const expected = '00:28:06.000';
			const actual = formatTimestampText(1686);
			assert.equal(actual, expected);
		});

		it('works for timestamps > 1 hour', () => {
			const expected = '01:41:05.000';
			const actual = formatTimestampText(6065);
			assert.equal(actual, expected);
		});

		it('works for timestamps that contain milliseconds', () => {
			const expected = '01:41:05.456';
			const actual = formatTimestampText(6065.456);
			assert.equal(actual, expected);
		});
	});

	describe('convertSrtTextToVttText', () => {
		it('converts valid SRT text to WebVTT text, with cues sorted by start timestamp', () => {
			const srtFileData = `1
00:00:00.000 --> 00:00:02.000
Lorem ipsum dolor sit amet, consectetur adipiscing
elit.

2
00:00:03.000 --> 00:01:02.321
Etiam ac lorem at dolor egestas
ultricies non at lacus.

4
00:01:02.321 --> 00:01:02.600
Praesent sollicitudin ac urna sed porttitor.

3
00:00:02.000 --> 00:00:03.000
Nulla massa ante, suscipit nec
suscipit in, tincidunt et tellus.`;

			const expected = `WEBVTT

00:00:00.000 --> 00:00:02.000
Lorem ipsum dolor sit amet, consectetur adipiscing
elit.

00:00:02.000 --> 00:00:03.000
Nulla massa ante, suscipit nec
suscipit in, tincidunt et tellus.

00:00:03.000 --> 00:01:02.321
Etiam ac lorem at dolor egestas
ultricies non at lacus.

00:01:02.321 --> 00:01:02.600
Praesent sollicitudin ac urna sed porttitor.
`;

			const actual = convertSrtTextToVttText(srtFileData);
			assert.equal(actual, expected);
		});

		it('when given invalid SRT data, throws an error containing the name of a localized error string', () => {
			const invalidSrtData = `1
00:00:00,000|00:00:02,000
Lorem ipsum dolor sit amet, consectetur adipiscing
elit.`;
			try {
				convertSrtTextToVttText(invalidSrtData);
				assert.fail('Did not throw an error');
			} catch (error) {
				assert.equal(error.message, 'srtParseError');
			}
		});
	});
});
