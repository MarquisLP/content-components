import parseSRT from 'parse-srt/src/parse-srt.js';
import { VttParser } from './vtt';

/**
 * Takes JSON output from parse-srt and formats each cue object into
 * a VTTCue object.
 * @param {array} jsonSrtCues An array of captions cues JSON objects from parse-srt
 * @returns An array of VTTCue objects
 */
function _convertJsonSrtCuesToVttCues(jsonSrtCues) {
	return jsonSrtCues.map(jsonSrtCue => {
		// parse-srt inserts <br /> for line breaks, but WebVTT uses \n.
		const convertedText = jsonSrtCue.text.replace('<br />', '\n');
		return new VTTCue(jsonSrtCue.start, jsonSrtCue.end, convertedText);
	});
}

/**
 * Converts VTTCueShims from vtt.js into real VTTCue objects.
 * @param {array} vttCueShims An array of VTTCueShims from vtt.js
 * @returns An array of VTTCue objects
 */
function _convertVttCuesShimToVttCues(vttCueShims) {
	return vttCueShims.map(vttCueShim => new VTTCue(vttCueShim.startTime, vttCueShim.endTime, vttCueShim.text));
}

/**
 * Takes a number of seconds and formats into a timestamp string of the form hh:mm:ss.sss
 * @param {number} timestampInSeconds The timestamp value that will be formatted, in seconds
 * @returns A timestamp string formatted as hh:mm:ss.sss
 */
function formatTimestampText(timestampInSeconds) {
	const hours = Math.floor(timestampInSeconds / 3600);
	const minutes = Math.floor(timestampInSeconds / 60) % 60;
	const seconds = Math.floor(timestampInSeconds % 60);
	const milliseconds = Math.round((timestampInSeconds % 1) * 1000);

	const hoursMinutesSecondsString = [ hours, minutes, seconds ]
		.map(number => (number < 10 ? `0${number}` : number))
		.join(':');
	let millisecondsString = milliseconds.toString();
	if (milliseconds < 10) {
		millisecondsString = `00${milliseconds}`;
	} else if (milliseconds < 100) {
		millisecondsString = `0${milliseconds}`;
	}
	return `${hoursMinutesSecondsString}.${millisecondsString}`;
}

/**
 * Parses SRT text data into WebVTT objects.
 * @param {string} rawSrtData The text data from an SRT file
 * @returns An array of VTTCue objects, sorted by ascending timestamp
 */
function parseSrtFile(rawSrtData) {
	let jsonSrtCues;
	try {
		jsonSrtCues = parseSRT(rawSrtData);
	} catch (error) {
		throw new Error('srtParseError');
	}
	const vttCues = _convertJsonSrtCuesToVttCues(jsonSrtCues);
	vttCues.sort((cue1, cue2) => cue1.startTime - cue2.startTime);
	return vttCues;
}

/**
 * Parses WebVTT text data into VTTCue objects.
 * @param {string} rawVttData The text data from an WebVTT file
 * @returns An array of VTTCue objects, sorted by ascending timestamp
 */
function parseWebVttFile(rawVttData) {
	const cues = [];
	const vttParser = new VttParser();
	vttParser.oncue = function(cue) {
		cues.push(cue);
	};
	vttParser.onparsingerror = function() {
		throw new Error('vttParseError');
	};
	vttParser.parse(rawVttData);
	vttParser.flush();
	console.log('.');
	console.log(cues);
	console.log('.');

	cues.sort((cue1, cue2) => cue1.startTime - cue2.startTime);
	return _convertVttCuesShimToVttCues(cues);
}

export {
	formatTimestampText,
	parseSrtFile,
	parseWebVttFile,
};
