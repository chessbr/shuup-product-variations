/**
 * This file is part of Shuup.
 *
 * Copyright (c) 2012-2020, Shoop Commerce Ltd. All rights reserved.
 *
 * This source code is licensed under the OSL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
export function getCombinations(options, optionIndex, results, current) {
    var allKeys = Object.keys(options);
    var optionKey = allKeys[optionIndex];
    var vals = options[optionKey];
    for (var i = 0; i < vals.length; i++) {
        current[optionKey] = vals[i];
        if (optionIndex + 1 < allKeys.length) {
            getCombinations(options, optionIndex + 1, results, current);
        } else {
            var res = JSON.parse(JSON.stringify(current));
            results.push(res);
        }
    }
    return results;
}

export function getProductIdForCombination(productIdToCombinationMap, combination) {
    if (productIdToCombinationMap) {
        return Object.keys(productIdToCombinationMap).find((key) => {
            return window._.isEqual(productIdToCombinationMap[key], combination);
        })
    }
}

export function isCombinationInCombinations(combination, combinations) {
    return combinations.find((item) => {
        return window._.isEqual(combination, item);
    })
}
