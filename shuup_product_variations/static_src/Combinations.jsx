/**
 * This file is part of Shuup.
 *
 * Copyright (c) 2012-2021, Shuup Commerce Inc. All rights reserved.
 *
 * This source code is licensed under the Shuup Commerce Inc -
 * SELF HOSTED SOFTWARE LICENSE AGREEMENT executed by Shuup Commerce Inc, DBA as SHUUP®
 * and the Licensee.
 */
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import CurrentVariable from './CurrentVariable';
import NewVariable from './NewVariable';
import {
  getNewDataForCombination,
  getProductIdForCombination,
} from './utils';

const getCombinationString = (combination) => (
  Object.keys(combination).map((k) => k + ': ' + combination[k]).join(', ')
);

const Combinations = ({
    combinations,
    variationData,
    productIdToCombinationMap,
    productData,
    newProductData,
    onNewDataUpdate
}) => {
  const [state, setState] = useState({
    visibleCombinations: [],
    searchTerms: [],
  });

  const combinationLimit = 200;

  const getVisibleCombinations = () => {
    if (combinations.length > combinationLimit || state.searchTerms.length > 0) {
      const variablesToValues = [
        ...new Set(state.searchTerms.map((item) => item.variable)),
      ].map((variable) => (
        {
          variable,
          values: state.searchTerms.filter((item) => item.variable === variable).map((item) => item.value),
        }
      ));
      return combinations.filter(
        (item) => (
          state.searchTerms.length > 0
          && variablesToValues.every((leItem) => leItem.values.includes(item[leItem.variable]))
        ),
      );
    }
    return combinations;
  };

  const getValueOptions = () => (
    Object.keys(
      variationData,
    ).map(
      (variationName) => (
        variationData[variationName].map((value) => ({ variable: variationName, value }))
      ),
    )
  );

  useEffect(() => {
    setState((prevState) => ({ ...prevState, visibleCombinations: getVisibleCombinations() }));
  }, []);

  const combinationCount = combinations.length;
  let subtitle = null;
  if (combinationCount > combinationLimit) {
    subtitle = (
      <p className="mb-2">
        {
          interpolate(
            gettext('This product has more than %s combinations.'),
            [combinationLimit],
          )
        }
        {
          gettext('Please find combinations for edit by selecting variable values from the select below.')
        }
      </p>
    );
  }
  return (
    <div>
      <h3 className="mb-4">{ interpolate(gettext('Product combinations (%s)'), [combinationCount]) }</h3>
      { subtitle }
      <div className="d-flex flex-column mb-4 mt-3">
        <small>{ gettext('Filter combinations') }</small>
        <Select
          placeholder={gettext('Select values for combinations...')}
          isMulti
          onChange={(selected) => setState((prevState) => ({ ...prevState, searchTerms: selected || [] }))}
          value={state.searchTerms}
          options={
            window._.flatten(
              getValueOptions(),
            ).map((item) => ({ value: item.value, variable: item.variable, label: item.variable+ ': ' + item.value }))
          }
          form="combination-search-terms"
        />
      </div>
      {getVisibleCombinations().map((item, idx) => {
        const combinationStr = getCombinationString(item);
        const productId = getProductIdForCombination(productIdToCombinationMap, item);
        let data = {};
        if (productId) {
          data = productData.find((pData) => pData.product_id === parseInt(productId, 10));
        } else {
          // We should find it from newProductData
          data = getNewDataForCombination(newProductData, item);
        }

        let key = combinationStr + '-' + newProductData.length + '-' + productData.length;
        if (data && data.sku) {
          key += '-' + data.sku + '-' + data.price + '-' + data.stock_count;
        }

        const extraCSS = (idx % 2 ? 'bg-light' : '');
        return (
          <div className={'d-flex flex-column mb-3 ' + extraCSS} key={key}>
            <h4>{ combinationStr }</h4>
            {productId ? (
              <CurrentVariable
                productData={data}
                combination={item}
                updating={state.updating}
                onUpdateSuccess={() => {}}
              />
            ) : (
              <NewVariable
                productData={data}
                updating={state.updating}
                onUpdate={(newData) => onNewDataUpdate(newData)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Combinations;
