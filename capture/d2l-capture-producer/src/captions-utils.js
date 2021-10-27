import parseSRT from 'parse-srt/src/parse-srt.js';
import { compile as compileWebVTT } from './node-vtt-compiler.js';

/**
 * Takes JSON output from parse-srt and formats each cue object into
 * a JSON VTT cue object.
 * @param {array} jsonSrtCues An array of captions cues JSON objects from parse-srt
 * @returns An array of JSON objects containing the following VTT cue properties: start, end, text, identifier
 */
function _convertJsonSrtCuesToVttJsonCues(jsonSrtCues) {
	return jsonSrtCues.map(jsonSrtCue => {
		// parse-srt inserts <br /> for line breaks, but WebVTT uses \n.
		const convertedText = jsonSrtCue.text.replace('<br />', '\n');
		return {
			start: jsonSrtCue.start,
			end: jsonSrtCue.end,
			text: convertedText,
			identifier: '',
			styles: ''
		};
	});
}

/**
 * Converts SRT text into WebVTT text.
 * @param {string} srtText Valid SRT text data
 * @returns A WebVTT string, containing the cues from the SRT text sorted by ascending timestamp
 */
function convertSrtTextToVttText(srtText) {
	let jsonSrtCues;
	try {
		jsonSrtCues = parseSRT(srtText);
	} catch (error) {
		throw new Error('srtParseError');
	}

	jsonSrtCues.sort((cue1, cue2) => cue1.start - cue2.start);
	const vttCues = _convertJsonSrtCuesToVttJsonCues(jsonSrtCues);
	return compileWebVTT({ cues: vttCues, valid: true });
}

/**
 * Converts an array of VTTCues into raw WebVTT text
 * @param {Array} cueArray An array of VTTCue objects
 * @returns A WebVTT string containing the data from the cue array
 */
function convertVttCueArrayToVttText(cueArray) {
	const jsonCues = cueArray.map(cue => {
		return {
			start: cue.startTime,
			end: cue.endTime,
			text: cue.text,
			identifier: '',
			styles: ''
		};
	});
	return compileWebVTT({ cues: jsonCues, valid: true });
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
 * Converts a TextTrackCueList into an array of VTTCues.
 * @param {TextTrackCueList} textTrackCueList The TextTrackCueList to convert
 * @returns An array containing the VTTCue objects from textTrackCueList.cues
 */
function textTrackCueListToArray(textTrackCueList) {
	const cueArray = [];
	for (let i = 0; i < textTrackCueList.length; i++) {
		cueArray.push(textTrackCueList[i]);
	}
	return cueArray;
}

export {
	formatTimestampText,
	convertSrtTextToVttText,
	convertVttCueArrayToVttText,
	textTrackCueListToArray,
};
