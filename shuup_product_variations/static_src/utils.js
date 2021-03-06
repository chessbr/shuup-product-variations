/**
 * This file is part of Shuup.
 *
 * Copyright (c) 2012-2021, Shuup Commerce Inc. All rights reserved.
 *
 * This source code is licensed under the Shuup Commerce Inc -
 * SELF HOSTED SOFTWARE LICENSE AGREEMENT executed by Shuup Commerce Inc, DBA as SHUUP®
 * and the Licensee.
 */
export function getCombinations(options, optionIndex, results, current) {
  const allKeys = Object.keys(options);
  if (allKeys.length) {
    const optionKey = allKeys[optionIndex];
    const vals = options[optionKey];
    if (!vals) {
      return results;
    }

    for (let i = 0; i < vals.length; i += 1) {
      current[optionKey] = vals[i];
      if (optionIndex + 1 < allKeys.length) {
        getCombinations(options, optionIndex + 1, results, current);
      } else {
        const res = JSON.parse(JSON.stringify(current));
        results.push(res);
      }
    }
  }
  return results;
}

export function getNewDataForCombination(combinationToData, combination) {
  if (combinationToData && combinationToData.length > 0) {
    return combinationToData.find((item) => window._.isEqual(item.combination, combination));
  }
  return {
    sku: '',
    stock_count: 0,
    price: 0,
  };
}

export function updateNewDataForCombination(combinationToData, data) {
  const { combination } = data;
  const dataItem = getNewDataForCombination(combinationToData, combination);
  if (dataItem) {
    dataItem.sku = data.sku;
    dataItem.price = data.price;
    dataItem.stock_count = data.stock_count;
  }
  return combinationToData;
}

export function getProductIdForCombination(productIdToCombinationMap, combination) {
  if (productIdToCombinationMap) {
    return Object.keys(productIdToCombinationMap)
      .filter((key) => !!key)
      .find((key) => window._.isEqual(productIdToCombinationMap[key], combination));
  }
  return null;
}

export function isCombinationInCombinations(combination, combinations) {
  return combinations.find((item) => window._.isEqual(combination, item));
}

function countDecimals(num) {
  // https://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
  const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) { return 0; }
  return Math.max(
    0,
    // Number of digits right of decimal point.
    (match[1] ? match[1].length : 0)
    // Adjust for scientific notation.
    - (match[2] ? +match[2] : 0),
  );
}

function round(value, decimalPlaces) {
  return Number(value).toFixed(decimalPlaces);
}

export function ensurePriceDecimalPlaces(value) {
  if (countDecimals(value) > window.SHUUP_PRODUCT_VARIATIONS_DATA.currency_decimal_places) {
    return round(value, window.SHUUP_PRODUCT_VARIATIONS_DATA.currency_decimal_places);
  }
  return value;
}

export function ensureStockCountDecimalPlaces(value) {
  if (countDecimals(value) > window.SHUUP_PRODUCT_VARIATIONS_DATA.sales_unit_decimal_places) {
    return round(value, window.SHUUP_PRODUCT_VARIATIONS_DATA.sales_unit_decimal_places);
  }
  return value;
}
