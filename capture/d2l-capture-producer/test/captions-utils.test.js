import { formatTimestampText, parseSrtFile, parseWebVttFile } from '../src/captions-utils.js';
import { assert } from '@open-wc/testing';
import sinon from 'sinon';

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

	describe('parseSrtFile', () => {
		it('parses a valid SRT file into an array of JSON captions cue objects, sorted by start timestamp', () => {
			const srtFileData = `1
00:00:00,000 --> 00:00:02,000
Lorem ipsum dolor sit amet, consectetur adipiscing
elit.

2
00:00:03,000 --> 00:01:02,321
Etiam ac lorem at dolor egestas
ultricies non at lacus.

3
00:00:02,000 --> 00:00:03,000
Nulla massa ante, suscipit nec
suscipit in, tincidunt et tellus.

4
00:01:02,321 --> 00:01:02,600
Praesent sollicitudin ac urna sed porttitor.`;
			const expected = [
				new VTTCue(0, 2, 'Lorem ipsum dolor sit amet, consectetur adipiscing\nelit.'),
				new VTTCue(2, 3, 'Nulla massa ante, suscipit nec\nsuscipit in, tincidunt et tellus.'),
				new VTTCue(3, 62.321, 'Etiam ac lorem at dolor egestas\nultricies non at lacus.'),
				new VTTCue(62.321, 62.600, 'Praesent sollicitudin ac urna sed porttitor.')
			];
			const actual = parseSrtFile(srtFileData);
			for (let i = 0; i < expected.length; i++) {
				assert.equal(actual[i].constructor.name, 'VTTCue', `Incorrect object class for cue at index ${i}`);
				assert.equal(actual[i].startTime, expected[i].startTime, `Incorrect start time for cue at index ${i}`);
				assert.equal(actual[i].endTime, expected[i].endTime, `Incorrect end time for cue at index ${i}`);
				assert.equal(actual[i].text, expected[i].text, `Incorrect text for cue at index ${i}`);
			}
		});

		it('when given invalid SRT data, throws an error containing the name of a localized error string', () => {
			const invalidSrtData = `1
00:00:00,000|00:00:02,000
Lorem ipsum dolor sit amet, consectetur adipiscing
elit.`;
			try {
				parseSrtFile(invalidSrtData);
				assert.fail('Did not throw an error');
			} catch (error) {
				assert.equal(error.message, 'srtParseError');
			}
		});
	});

	describe('parseWebVttFile', () => {
		it('parses a valid WebVTT file into an array of JSON captions cue objects, sorted by start timestamp', () => {
			const vttFileData = `WEBVTT

00:01.000 --> 00:03.000
<v Roger Bingham>We are
in New York City

00:06.000 --> 00:08.000
<v Roger Bingham>from the American Museum of Natural History

00:03.000 --> 00:06.000
<v Roger Bingham>We’re actually at the Lucern Hotel, just down the street

00:08.000 --> 00:10.000
<v Roger Bingham>And with me is Neil deGrasse Tyson`;

			const vttParserMock = {};
			vttParserMock.parse = sinon.spy();
			vttParserMock.flush = sinon.stub();
			vttParserMock.flush.callsFake(() => {
				if (vttParserMock.parse.calledWith(vttFileData)) {
					const unsortedCues = [
						new VTTCue(1, 3, '<v Roger Bingham>We are\nin New York City'),
						new VTTCue(6, 8, '<v Roger Bingham>from the American Museum of Natural History'),
						new VTTCue(3, 6, '<v Roger Bingham>We’re actually at the Lucern Hotel, just down the street'),
						new VTTCue(8, 10, '<v Roger Bingham>And with me is Neil deGrasse Tyson'),
					];
					unsortedCues.forEach(cue => {
						vttParserMock.oncue(cue);
					});
				}
			});

			const expected = [
				new VTTCue(1, 3, '<v Roger Bingham>We are\nin New York City'),
				new VTTCue(3, 6, '<v Roger Bingham>We’re actually at the Lucern Hotel, just down the street'),
				new VTTCue(6, 8, '<v Roger Bingham>from the American Museum of Natural History'),
				new VTTCue(8, 10, '<v Roger Bingham>And with me is Neil deGrasse Tyson'),
			];
			const actual = parseWebVttFile(vttParserMock, vttFileData);
			for (let i = 0; i < expected.length; i++) {
				assert.equal(actual[i].constructor.name, 'VTTCue', `Incorrect object class for cue at index ${i}`);
				assert.equal(actual[i].startTime, expected[i].startTime, `Incorrect start time for cue at index ${i}`);
				assert.equal(actual[i].endTime, expected[i].endTime, `Incorrect end time for cue at index ${i}`);
				assert.equal(actual[i].text, expected[i].text, `Incorrect text for cue at index ${i}`);
			}
		});

		it('when given invalid WebVTT data, throws an error containing the name of a localized error string', () => {
			const invalidVttFileData = `00:01.000 --> 00:03.000
<v Roger Bingham>We are
in New York City`;

			const vttParserMock = {};
			vttParserMock.parse = sinon.spy();
			vttParserMock.flush = sinon.stub();
			vttParserMock.flush.callsFake(() => {
				if (vttParserMock.parse.calledWith(invalidVttFileData)) {
					vttParserMock.onerror();
				}
			});

			try {
				parseWebVttFile(vttParserMock, invalidVttFileData);
				assert.fail('Did not throw an error');
			} catch (error) {
				assert.equal(error.message, 'vttParseError');
			}
		});
	});
});
