class Timeline {
	constructor(durationSeconds, widthPixels, cuts = [], zoomMultiplier = 1, pixelsAlongTimelineToZoomAround = Math.round(widthPixels / 2)) {
		this.durationSeconds = durationSeconds;
		this.widthPixels = widthPixels;
		this.zoomMultiplier = zoomMultiplier;
		this.pixelsAlongTimelineToZoomAround = pixelsAlongTimelineToZoomAround;

		this._cuts = {};
		this._marks = {};

		this._setCuts(cuts);
	}

	/**
	 * Adds a cut at the specified point. If one already exists for the determined time, does nothing.
	 * @param {number} pixelsAlongTimeline Point on the timeline.
	 * @returns {Cut} Newly created cut. If one already existed at the time, returns null.
	 */
	addCutToTimelineAtPoint(pixelsAlongTimeline) {
		const leftBoundingMark = this._getLatestMarkAtOrBeforePoint(pixelsAlongTimeline);
		const inSeconds = leftBoundingMark ? leftBoundingMark.seconds : 0;

		const rightBoundingMark = this._getEarliestMarkAfterPoint(pixelsAlongTimeline);
		const outSeconds = rightBoundingMark ? rightBoundingMark.seconds : this.durationSeconds;

		if (this._getCutStartingAtTime(inSeconds)) return null;

		const cut = new Cut(inSeconds, outSeconds, this);

		this._cuts[inSeconds] = cut;

		return cut;
	}

	/**
	 * Adds a mark at a point on the timeline. If a cut existed over the time represented by the point, it is reduced to
	 * end at the new mark. If a mark already exists at the time represented by the point, nothing happens.
	 * @param {number} pixelsAlongTimeline Point on the timeline.
	 * @returns {[Mark, Cut]} If the mark is added, returns the newly added mark and the cut (if it existed) that was reduced. If a mark already
	 * existed at the time represented by the point, returns null.
	 */
	addMarkToTimelineAtPoint(pixelsAlongTimeline) {
		const time = this.getTimeFromPixelsAlongTimeline(pixelsAlongTimeline);

		const existingMark = this._getMarkAtTime(time);

		if (existingMark) return null;

		const mark = new Mark(time, this);

		this._marks[mark.seconds] = mark;

		const cutOverTime = this._getCutOverTime(mark.seconds);

		if (cutOverTime) { // need to end cut at mark
			cutOverTime.out = mark.seconds;
		}

		return [mark, cutOverTime];
	}

	/**
	 * Gets the pixel bounds of the marks around a point.
	 * @param {*} pixelsAlongTimeline Point on the timeline.
	 * @returns {[number, number]} The upper and lower bounds of the marks around the point.
	 */
	getPixelBoundsAtPoint(pixelsAlongTimeline) {
		const leftBoundMark = this._getLatestMarkAtOrBeforePoint(pixelsAlongTimeline);

		const leftBoundPixels = leftBoundMark ? leftBoundMark.getPixelsAlongTimeline() : 0;

		const rightBoundMark = this._getEarliestMarkAfterPoint(pixelsAlongTimeline);

		const rightBoundPixels = rightBoundMark ? rightBoundMark.getPixelsAlongTimeline() : this.widthPixels;

		return [leftBoundPixels, rightBoundPixels];
	}

	/**
	 * Gets a list of all the cuts.
	 * @returns {Cut[]} The list of all the cuts, including those that are not displayed on
	 * the timeline.
	 */
	getCuts() {
		return Object.values(this._cuts).sort((a, b) => a.in - b.in);
	}

	/**
	 * Gets a list of all the cuts on the timeline.
	 * @returns {Cut[]} The list of all the cuts that are displayed on the timeline.
	 */
	getCutsOnTimeline() {
		return Object.values(this._cuts).filter(cut => cut.isOnTimeline()).sort((a, b) => a.in - b.in);
	}

	/**
	 * Gets a list of all the marks.
	 * @returns {Mark[]} The list of all the marks, including those that are not displayed on the timeline.
	 */
	getMarks() {
		return Object.values(this._marks).sort((a, b) => a.seconds - b.seconds);
	}

	/**
	 * Gets a list of all the marks on the timeline.
	 * @returns {Mark[]} The list of all the marks that are displayed on the timeline.
	 */
	getMarksOnTimeline() {
		return Object.values(this._marks).filter(mark => mark.isOnTimeline()).sort((a, b) => a.seconds - b.seconds);
	}

	/**
	 * Gets the upper and lower bounds of the time in seconds of the timeline.
	 * @returns {[number, number]} The upper and lower bounds of the time in seconds on the timeline.
	 */
	getTimeBoundsOnTimeline() {
		const zoomedDuration = Math.round(this.durationSeconds / this.zoomMultiplier);

		const halfZoomedDuration = Math.ceil(zoomedDuration / 2);

		const timeToZoomAround = Math.round(this.durationSeconds * this.pixelsAlongTimelineToZoomAround / this.widthPixels);

		if (timeToZoomAround < halfZoomedDuration) return [0, zoomedDuration];
		else if (timeToZoomAround + halfZoomedDuration > this.durationSeconds) return [Math.round(this.durationSeconds - zoomedDuration), Math.ceil(this.durationSeconds)];
		else return [timeToZoomAround - halfZoomedDuration, timeToZoomAround + halfZoomedDuration];
	}

	/**
	 * Gets the mark at a time.
	 * @param {number} seconds Time in seconds.
	 * @returns {Mark} Mark at the time. If none exist, returns null.
	 */
	getMarkAtTime(seconds) {
		const mark = this._marks[seconds];

		return mark ? mark : null;
	}

	/**
	 * Gets the pixels along the timeline that represent the time.
	 * @param {number} seconds Time in seconds.
	 * @returns {number} Point along the timeline that represents the time.
	 */
	getPixelsAlongTimelineFromTime(seconds) {
		const [lowerBoundSeconds, upperBoundSeconds] = this.getTimeBoundsOnTimeline();

		if (seconds < lowerBoundSeconds || seconds > upperBoundSeconds) return null;

		const totalTimeOnTimeline = upperBoundSeconds - lowerBoundSeconds;

		const progress = (seconds - lowerBoundSeconds) / totalTimeOnTimeline;

		return progress * this.widthPixels;
	}

	/**
	 * Gets the time represented by the point along the timeline.
	 * @param {number} pixelsAlongTimeline Point along the timeline.
	 * @returns {number} Gets the time in seconds represented by the point along the timeline.
	 */
	getTimeFromPixelsAlongTimeline(pixelsAlongTimeline) {
		const [lowerBoundSeconds, upperBoundSeconds] = this.getTimeBoundsOnTimeline();

		return Math.round((upperBoundSeconds - lowerBoundSeconds) * pixelsAlongTimeline / this.widthPixels) + lowerBoundSeconds;
	}

	/**
	 * Gets the cut that ends at the time.
	 * @param {number} seconds Time in seconds.
	 * @returns {Cut} Cut that ends at the time. If none exist, returns null.
	 */
	_getCutEndingAtTime(seconds) {
		for (const cut of Object.values(this._cuts)) {
			if (cut.out === seconds) return cut;
		}

		return null;
	}

	/**
	 * Gets the cut that is over the time.
	 * @param {number} seconds Time in seconds.
	 * @returns {Cut} Cut that is over the time. If none exist, returns null.
	 */
	_getCutOverTime(seconds) {
		for (const cut of Object.values(this._cuts)) {
			if (cut.isOverTime(seconds)) return cut;
		}

		return null;
	}

	/**
	 * Gets the cut that starts at a time.
	 * @param {number} seconds Time in seconds.
	 * @returns {Cut} Cut that starts at the time. If none exist, returns null.
	 */
	_getCutStartingAtTime(seconds) {
		const cut = this._cuts[seconds];

		return cut ? cut : null;
	}

	/**
	 * Gets the earliest mark after a point on the timeline.
	 * @param {number} pixelsAlongTimeline Point on the timeline.
	 * @returns {Mark} Earliest mark after the point on the timeline. If none exist, returns null.
	 */
	_getEarliestMarkAfterPoint(pixelsAlongTimeline) {
		let earliestSeconds = null;
		let closestMark = null;

		for (const mark of Object.values(this._marks)) {
			const pixelsAlongTimelineOfMark = mark.getPixelsAlongTimeline();

			if (pixelsAlongTimelineOfMark > pixelsAlongTimeline) {
				if (earliestSeconds === null) earliestSeconds = mark.seconds;

				if (mark.seconds <= earliestSeconds) {
					earliestSeconds = mark.seconds;
					closestMark = mark;
				}
			}
		}

		return closestMark;
	}

	/**
	 * Gets the mark at a time, or the closest previous mark.
	 * @param {number} seconds Time in seconds.
	 * @returns {Mark} Mark at the time, or the closest previous mark. If none exist, returns null.
	 */
	_getMarkAtTimeOrPrevious(seconds) {
		let previousMark = null;
		let closestTime = null;

		for (const mark of Object.values(this._marks)) {
			if (mark.seconds === seconds) return mark;
			else if (mark.seconds < seconds) {
				if (closestTime === null) closestTime = mark.seconds;

				if (mark.seconds >= closestTime) {
					closestTime = mark.seconds;
					previousMark = mark;
				}
			}
		}

		return previousMark;
	}

	/**
	 * Gets the latest mark at or before a point on the timeline.
	 * @param {number} pixelsAlongTimeline Point on the timeline.
	 * @returns {Mark} Latest mark at or before the point on the timeline. If none exist, returns null.
	 */
	_getLatestMarkAtOrBeforePoint(pixelsAlongTimeline) {
		let latestSeconds = null;
		let closestMark = null;

		for (const mark of Object.values(this._marks)) {
			const pixelsAlongTimelineOfMark = mark.getPixelsAlongTimeline();

			if (pixelsAlongTimelineOfMark === pixelsAlongTimeline) return mark;
			else if (pixelsAlongTimelineOfMark < pixelsAlongTimeline) {
				if (latestSeconds === null) latestSeconds = mark.seconds;

				if (mark.seconds >= latestSeconds) {
					latestSeconds = mark.seconds;
					closestMark = mark;
				}
			}
		}

		return closestMark;
	}

	/**
	 * Gets the mark at a time;
	 * @param {number} seconds Time in seconds.
	 * @returns {Mark} Mark that starts at the time. If none exist, returns null.
	 */
	_getMarkAtTime(seconds) {
		const mark = this._marks[seconds];

		return mark ? mark : null;
	}

	/**
	 * Gets the marks at a point on the timeline.
	 * @param {number} pixelsAlongTimeline Point on the timeline.
	 * @returns {Mark[]} Marks at the point on the timeline.
	 */
	_getMarksAtPoint(pixelsAlongTimeline) {
		const marks = [];
		for (const mark of Object.values(this._marks)) {
			if (mark.getPixelsAlongTimeline() === pixelsAlongTimeline) marks.push(mark);
		}

		return marks;
	}

	/**
	 * Gets the next mark after a time.
	 * @param {number} seconds Time in seconds.
	 * @returns {Mark} Next mark after the time. If none exist, returns null.
	 */
	_getNextMarkFromTime(seconds) {
		let nextMark = null;
		let closestTime = null;

		for (const mark of Object.values(this._marks)) {
			if (mark.seconds === (seconds + 1)) return mark;
			else if (mark.seconds > (seconds + 1)) {
				if (closestTime === null) closestTime = mark.seconds;

				if (mark.seconds <= closestTime) {
					closestTime = mark.seconds;
					nextMark = mark;
				}
			}
		}

		return nextMark;
	}

	/**
	 * Sets the cuts.
	 * @param {{ in: number, out: number }[]} cuts Cuts to add.
	 */
	_setCuts(cuts) {
		for (const cut of cuts) {
			if (cut.in > 0) {
				const markAtStartOfCut = this._getCutStartingAtTime(cut.in);

				if (!markAtStartOfCut) {
					const mark = new Mark(cut.in, this);
					this._marks[cut.in] = mark;
				}
			}

			if (cut.out < this.durationSeconds) {
				const markAtEndOfCut = this._getCutEndingAtTime(cut.out);

				if (!markAtEndOfCut) {
					const mark = new Mark(cut.out, this);
					this._marks[cut.out] = mark;
				}
			}

			const newCut = new Cut(cut.in, cut.out, this);

			this._cuts[cut.in] = newCut;
		}
	}
}

class Cut {
	constructor(inSeconds, outSeconds, timeline) {
		this.in = inSeconds;
		this.out = outSeconds;
		this.timeline = timeline;
		this.displayObject = null;
	}

	/**
	 * Determines if the cut is on the timeline.
	 * @returns {boolean} Returns true if the cut is on the timeline. Otherwise, false.
	 */
	isOnTimeline() {
		const [lowerBoundSeconds, upperBoundSeconds] = this.timeline.getTimeBoundsOnTimeline();

		return this.in <= upperBoundSeconds && this.out > lowerBoundSeconds;
	}

	/**
	 * Determines if the cut is over the time.
	 * @param {number} seconds Time in seconds.
	 * @returns {boolean} True if the cut is over the time. Otherwise, false.
	 */
	isOverTime(seconds) {
		return this.in <= seconds && this.out > seconds;
	}

	/**
	 * Determines the pixels along the timeline that this cut begins and ends at.
	 * @returns {[number, number]} If the cut is on the timeline, returns an array. Otherwise, returns null.
	 * 								[0]: Pixels along the timeline of the start of the cut. If the cut actually starts before the timeline, it will be the start of the timeline.
	 * 								[1]: Pixels along the timeline of the end of the cut. If the cut actually ends after the timeline, it will be the end of the timeline.
	 */
	getPixelsAlongTimeline() {
		if (!this.isOnTimeline()) return null;

		const actualInPixels = this.timeline.getPixelsAlongTimelineFromTime(this.in);
		const inPixels = actualInPixels !== null ? actualInPixels : 0;

		const actualOutPixels = this.timeline.getPixelsAlongTimelineFromTime(this.out);
		const outPixels = actualOutPixels !== null ? actualOutPixels : this.timeline.widthPixels;

		return [inPixels, outPixels];
	}

	/**
	 * Removes this cut from the timeline.
	 */
	removeFromTimeline() {
		delete this.timeline._cuts[this.in];
	}
}

class Mark {
	constructor(seconds, timeline) {
		this.seconds = seconds;
		this.timeline = timeline;
		this.displayObject = null;
	}

	/**
	 * Determines if the mark is on the timeline.
	 * @returns {boolean} Returns true if the mark is on the timeline. Otherwise, false.
	 */
	isOnTimeline() {
		const [lowerBoundSeconds, upperBoundSeconds] = this.timeline.getTimeBoundsOnTimeline();

		return this.seconds >= lowerBoundSeconds && this.seconds <= upperBoundSeconds;
	}

	/**
	 * Determines the pixels along the timeline that this marker is at.
	 * @returns {number} The pixels along the timeline that this marker is at. Returns null if it is not on the timeline.
	 */
	getPixelsAlongTimeline() {
		return this.timeline.getPixelsAlongTimelineFromTime(this.seconds);
	}

	/**
	 * Removes this mark from the timeline.
	 * @returns {[Cut, Cut]} Two cuts that were affected by the removal of this mark.
	 * 							[0]: The cut that ended at this mark, which needed to be extended. If none existed, is null.
	 * 							[1]: The cut that started at thsi mark, which needed to be removed. If none existed, is null.
	 */
	removeFromTimeline() {
		const cutStartingAtMark = this.timeline._getCutStartingAtTime(this.seconds);

		// Need to remove cut starting here
		if (cutStartingAtMark) delete this.timeline._cuts[cutStartingAtMark.in];

		const cutEndingAtMark = this.timeline._getCutEndingAtTime(this.seconds);

		// Need to extend cut to the next mark, or the very end
		if (cutEndingAtMark) {
			const nextMark = this.timeline._getNextMarkFromTime(this.seconds);

			const outSeconds = nextMark ? nextMark.seconds : this.timeline.durationSeconds;

			cutEndingAtMark.out = outSeconds;
		}

		delete this.timeline._marks[this.seconds];

		return [cutEndingAtMark, cutStartingAtMark];
	}

	/**
	 * Moves this mark to another point.
	 *
	 * Any cuts that start or end at the mark will be compressed or stretched (depending on direction of move).
	 *
	 * Cannot move past the end of the timeline or any other mark.
	 * @param {number} pixelsAlongTimelineToMoveTo Point along the timeline to move this mark to.
	 * @returns {[Cut, Cut]} Cuts that were affected by the move. If the move did not happen, returns null.
	 * 							[0]: Cut ending at the mark that was stretched or compressed.
	 * 							[1]: Cut starting at the mark that was stretched or compressed.
	 */
	move(pixelsAlongTimelineToMoveTo) {
		const timeToMoveTo = this.timeline.getTimeFromPixelsAlongTimeline(pixelsAlongTimelineToMoveTo);

		if (timeToMoveTo === this.seconds) return null;
		else if (timeToMoveTo > this.seconds) { // moving mark forward
			for (const mark of this.timeline.getMarks()) {
				// Other mark exists between this mark and the time to move to
				if (mark !== this && mark.seconds > this.seconds && mark.seconds <= timeToMoveTo) return null;
			}
		} else { // moving mark backward
			for (const mark of this.timeline.getMarks()) {
				// Other mark exists between this mark and the time to move to
				if (mark !== this && mark.seconds < this.seconds && mark.seconds >= timeToMoveTo) return null;
			}
		}

		const cutStartingAtMark = this.timeline._getCutStartingAtTime(this.seconds);

		if (cutStartingAtMark) {
			delete this.timeline._cuts[cutStartingAtMark.in];

			cutStartingAtMark.in = timeToMoveTo;
			this.timeline._cuts[timeToMoveTo] = cutStartingAtMark;
		}

		const cutEndingAtMark = this.timeline._getCutEndingAtTime(this.seconds);

		if (cutEndingAtMark) {
			cutEndingAtMark.out = timeToMoveTo;
		}

		delete this.timeline._marks[this.seconds];

		this.seconds = timeToMoveTo;

		this.timeline._marks[timeToMoveTo] = this;

		return [cutEndingAtMark, cutStartingAtMark];
	}
}

export {
	Cut,
	Mark,
	Timeline,
};
