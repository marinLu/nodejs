var buildIn = function (strs) {
    if (strs == null || strs.length == 0) {
        return '()';
    }

    if (typeof (strs[0]) == 'number' ||
        typeof (strs[0]) == 'boolean') {
        var paramString = '';
        for (let i = 0; i < strs.length; i++) {
            const element = strs[i];
            if (i == strs.length - 1) {
                paramString += element;
            } else {
                paramString += element + ",";
            }
        }
        return "(" + paramString + ")";
    } else {
        var paramString = '';
        for (let i = 0; i < strs.length; i++) {
            const element = strs[i];
            if (i == strs.length - 1) {
                paramString += "'" + element + "'";
            } else {
                paramString += "'" + element + "'" + ",";
            }
        }
        return "(" + paramString + ")";
    }
}

module.exports = {
    buildIn
}