/**
 * This file is part of Shuup.
 *
 * Copyright (c) 2012-2020, Shoop Commerce Ltd. All rights reserved.
 *
 * This source code is licensed under the OSL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ReactDOM from "react-dom";
import React, { useEffect, useState } from "react";
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select'
import { CurrentVariable } from "./currentVariable";
import { ProductVariationOrganizer } from "./productVariationOrganizer";
import { VariationUpdater } from "./variationUpdater";
import {
    getCombinations,
    getProductIdForCombination
} from "./utils";

const App = () => {
    const [state, setState] = useState({
        
        // Some data for handling things
        productIdToCombinationMap: {},
        productData: [],
        variationData: {},
        newVariationData: {},
        preSavedVariationsData: {},
        
        // three different modes
        loading: false,
        updating: false,
        organizing: false,
    });

    const fetchCombinations = async (url) => {
        try {
            const res = await fetch(url);
            const data = await res.json();
            const variationResults = data["combinations"];
            const productData = data["product_data"]
            const variationData = {};
            const productIdToCombinationMap = {};
            if (variationResults) {
                variationResults.forEach((item) => {
                    let combination = item["combination"]
                    productIdToCombinationMap[item["product"]] = combination;
                    Object.keys(combination).forEach((variable) => {
                        let value = combination[variable];
                        if (variationData[variable] === undefined) {
                            variationData[variable] = [value]
                        } else {
                            if (!variationData[variable].includes(value)){
                                variationData[variable].push(value)
                            }
                        }
                    })
                });
                setState(prevState => ({
                    ...prevState,
                    productIdToCombinationMap,
                    productData,
                    variationData,
                    loading: false
                }))
            }
        } catch {
            // setError(true);
        } finally {
            // setLoading(false);
        }
    };

    const fetchVariations = async (url) => {
        try {
            const res = await fetch(url);
            const data = await res.json();
            const preSavedVariationsData = data["variations"] || {};
            setState(prevState => ({
                ...prevState,
                preSavedVariationsData,
            }))
        } catch {
            // setError(true);
        } finally {
            // setLoading(false);
        }
    };
    useEffect(() => {
        setState(prevState => { return { ...prevState, loading: true } })
        const variationURL = `/sa/shuup_product_variations/variations/`
        fetchVariations(variationURL)
        const combinationURL = `/sa/shuup_product_variations/${window.SHUUP_PRODUCT_VARIATIONS_PRODUCT_ID}/combinations/` 
        fetchCombinations(combinationURL);
    }, []);

    const removeVariationSelect = (variable) => {
        const hasNewVariations = (Object.keys(state.newVariationData).length > 0);
        const newVariationData = (hasNewVariations ? state.newVariationData : {...state.variationData});
        delete newVariationData[variable];
        setState(prevState => { return { ...prevState, newVariationData } })
    }

    const addVariationSelectVariable = (selectedOption) => {
        const hasNewVariations = (Object.keys(state.newVariationData).length > 0);
        const newVariationData = (hasNewVariations ? state.newVariationData : {...state.variationData});
        const selectedValue = selectedOption.value;
        if (!Object.keys(newVariationData).includes(selectedValue)) {
            newVariationData[selectedValue] = [];
            setState(prevState => { return { ...prevState, newVariationData } })
        }
    }

    const updateVariationSelectValues = (variable, selectedOptions) => {
        if (variable) {
            const selectedVariableValues = selectedOptions.map(item => {return item.value})
            const hasNewVariations = (Object.keys(state.newVariationData).length > 0);
            const newVariationData = (hasNewVariations ? state.newVariationData : {...state.variationData});
            newVariationData[variable] = selectedVariableValues
            setState(prevState => { return { ...prevState, newVariationData } })
        }
    }

    if (state.loading) {
        return (
            <div className="flex-d flex-grow-1 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">{ gettext("Loading...") }</span>
                </div>
            </div>
        );
    } else if (state.organizing) {
        // Here let's update the variation order, re-name and translate (just for this product)
        return (
            <ProductVariationOrganizer
                productId={window.SHUUP_PRODUCT_VARIATIONS_PRODUCT_ID}
                onQuit={
                    () => {
                        setState(prevState => { return { ...prevState, organizing: false } })
                    }
                }
            />    
        );
    } else if (state.updating) {
        // Here let's finalize the pending changes to the product variations
        return (
            <VariationUpdater
                currentVariationData={state.variationData}
                newVariationData={state.newVariationData}
                productIdToCombinationMap={state.productIdToCombinationMap}
                onCancel={
                    () => {
                        setState(prevState => { return { ...prevState, newVariationData: {}, updating: false } })
                    }
                }
                onError= {
                    () => {
                        console.log("error")
                    }
                }
                onSuccess={
                    // TODO this could be good spot to refetch all variations and shenigans
                    () => {
                        setState(prevState => { return { ...prevState,  newVariationData: {}, updating: false } })
                    }
                }
            />
        );
    } else {
        // By default list all children and add option to update current children and variations
        const hasNewVariations = (Object.keys(state.newVariationData).length > 0);
        const variationData = (hasNewVariations ? state.newVariationData : state.variationData);
        const hasNewVariationsMissingValues = Object.keys(variationData).find((variable) => {
            return (variationData[variable].length === 0 ? true : false)
        });
        const SelectComponent = (window.SHUUP_PRODUCT_VARIATIONS_CAN_CREATE_VARIATIONS ? CreatableSelect : Select);
        const variableOptions = Object.keys(state.preSavedVariationsData).filter((item) => {
            return !(Object.keys(variationData).includes(item));
        })
        return (
            <div>
                <h3>{ gettext("Add variations") }</h3>
                {  
                    Object.keys(variationData).map((variable, idx) => {
                        let values = variationData[variable];
                        let valueOptions = state.preSavedVariationsData[variable] || [];
                        return (
                            <div className="d-flex m-3 align-items-end" key={`pending-variations-${idx}`}>
                                <div className="d-flex flex-grow-1 flex-column">
                                    <h4 className="control-label">{ variable }</h4>
                                    <SelectComponent
                                        placeholder={ gettext("Select values for variable...") }
                                        isMulti
                                        onChange={(values) => {
                                            updateVariationSelectValues(variable, values);
                                        }}
                                        isDisabled={!window.SHUUP_PRODUCT_VARIATIONS_CAN_EDIT_VARIATIONS}
                                        value={values.map(item => {return {value: item, label: item}})}
                                        options={valueOptions.map(item => {return {value: item, label: item}})}
                                    />
                                </div>
                                {
                                    window.SHUUP_PRODUCT_VARIATIONS_CAN_EDIT_VARIATIONS ? (
                                        <div>
                                            <i
                                                className="fa fa-trash fa-2x align-self-center ml-4"
                                                onClick={() => {
                                                    removeVariationSelect(variable);
                                                }}
                                            ></i>
                                        </div>
                                    ) : (
                                        null
                                    )
                                }
                            </div>
                        );
                    })
                }
                {
                    window.SHUUP_PRODUCT_VARIATIONS_CAN_EDIT_VARIATIONS ? (
                        <div className="d-flex m-3" key={`pending-variations-new`}>
                            <SelectComponent
                                className="flex-grow-1 mr-1"
                                placeholder={ gettext("Add new variable...") }
                                onChange={(newValue) => {
                                    addVariationSelectVariable(newValue);
                                }}
                                value={null}
                                defaultValue={[]}
                                options={variableOptions.map(item => {return {value: item, label: item}})}
                            />
                        </div>
                    ) : (
                        null
                    )
                }
                {
                    hasNewVariations ? (
                        hasNewVariationsMissingValues ? (
                            <h3 className="mb-4">{ gettext("You have pending changes make sure all variables has values") }</h3> 
                        ) :(
                            <div>
                                <h3 className="mb-4">{ gettext("You have pending changes made to combinations") }</h3>
                                <div className="d-flex flex-column m-3">
                                    <button
                                        className="btn btn-primary mb-4"
                                        onClick={() => {setState(prevState => { return { ...prevState, updating: true } })}}
                                    >
                                        { gettext("Start the update") }
                                    </button>
                                    <button
                                        className="btn btn-delete btn-inverse"
                                        onClick={() => {setState(prevState => { return { ...prevState, newVariationData: {} } })}}
                                    >
                                        { gettext("Revert changes") }
                                    </button>
                                </div>
                            </div>
                        )
                        
                    ) : (
                        <div>
                            <div className="d-flex flex-column m-3">
                                <button
                                    className="btn btn-primary mb-4"
                                    onClick={() => {setState(prevState => { return { ...prevState, organizing: true } })}}
                                >
                                    { gettext("Organize current variations") }
                                </button>
                            </div>
                            {
                                Object.keys(state.variationData).length > 0 ? (
                                    <div className="d-flex flex-column m-3">
                                        <h3 className="mb-4">{ gettext("Combinations") }</h3>
                                        {
                                            getCombinations(state.variationData, 0, [], {}).map((item, idx) => {
                                                let combinationStr = Object.keys(item).map(k=>`${k}: ${item[k]}`).join(', ');
                                                let productId = getProductIdForCombination(state.productIdToCombinationMap, item);
                                                let data = state.productData.find((item) => {return item["product_id"] === parseInt(productId, 10)});
                                                const extraCSS = (idx % 2 ? "bg-light" : "");
                                                return (
                                                    <div className={`d-flex flex-column mb-3 ${extraCSS}`} key={`combination-${idx}`}>
                                                        <h4>{ combinationStr }</h4>
                                                        {
                                                            productId && data ? (
                                                                <CurrentVariable key={idx} productData={data} />
                                                            ): (
                                                                null
                                                            )
                                                        }
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                ) : (
                                    null
                                )
                            }
                        </div>
                    )
                }
            </div>
        )
    }
        
}

window.ProductVariationsApp = () => {
    ReactDOM.render(<App />, document.getElementById("product-variations-root"))
};
