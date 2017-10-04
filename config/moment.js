const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

module.exports = {

    // modified addition for two ranges
    // unlike built-in function, this adds adjacent ranges as well as overlapping ones
    addTwo: function (range1, range2) {
        if (range1.overlaps(range2, {adjacent: true})) {
            var start = moment.min(range1.start, range2.start);
            var end = moment.max(range1.end, range2.end);
            var sum = moment.range(start, end);
            return sum;
        } else {
            return null;
        }
    },

    //takes array of moment-ranges, adds them all together, returns array of moment-ranges
    addArray: function (ranges) {
        var origRanges = ranges;
        var newRanges = [];
        var overlap = false;
        for (var i = 0; i < origRanges.length; i += 1) {
            for (var j = i + 1; j < origRanges.length; j++) {
                if (origRanges[i].overlaps(origRanges[j], {adjacent: true})) {
                    overlap = true;
                    newRanges.push(this.addTwo(origRanges[i], origRanges[j]));
                    origRanges.splice(j, 1);
                    origRanges.splice(i, 1);
                    if (i != 0) {
                        i--;
                        j -= 2;
                    }
                    else {
                        j--;
                    }
                }
            }
        }
        if (overlap) {
            return this.addArray(newRanges.concat(origRanges));
        } else {
            return origRanges;
        }
    },

    // takes two arrays of ranges
    // subtracts second array ranges from first array ranges
    // returns array of ranges.
    subtractArrays: function (arr1, arr2) {
        var condensed1 = this.addArray(arr1);
        var condensed2 = this.addArray(arr2);
        var subtracted = [];
        for (var i = 0; i < condensed1.length; i++) {
            subtracted = subtracted.concat(this.subtractArrFromSingle(condensed1[i], condensed2));
        }
        return subtracted;
    },

    // subtracts array of moment-ranges from a single moment-range
    // returns array of moment-ranges
    subtractArrFromSingle: function (single, array) {
        var subtracted = [];
        for (var i = 0; i < array.length; i++) {
            if (!(single.overlaps(array[i]))) {
                continue;
            }
            else if (single.isSame(array[i])) {
                return subtracted;
            } else {
                subtracted = single.subtract(array[i]);
                if (subtracted.length === 2) {
                    return this.subtractArrFromSingle(subtracted[0], array.slice(i + 1))
                        .concat(this.subtractArrFromSingle(subtracted[1], array.slice(i + 1)));
                } else {
                    return this.subtractArrFromSingle(subtracted[0], array.slice(i + 1));
                }
            }
        }
        return [single];
    }

};