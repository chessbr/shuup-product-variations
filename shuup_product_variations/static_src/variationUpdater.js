/**
 * This file is part of Shuup.
 *
 * Copyright (c) 2012-2020, Shoop Commerce Ltd. All rights reserved.
 *
 * This source code is licensed under the OSL-3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useState } from "react";
import {
    getCombinations,
    getProductIdForCombination,
    isCombinationInCombinations
} from "./utils";


export const VariationUpdater = ({
    currentVariationData,
    newVariationData,
    productIdToCombinationMap,
    onCancel,
    onError,
    onSuccess
}) => {
    const [state, setState] = useState({
        updating: false,
        combinationsToDelete: [],
        combinationsToCreate: [],
        productIdsTodelete: []
    });

    useEffect(() => {
        const currentCombinations = getCombinations(currentVariationData, 0, [], {})
        const newCombinations = getCombinations(newVariationData, 0, [], {})
        const productIdsTodelete = []
        const combinationsToDelete = currentCombinations.filter((item) => {
            let productId = getProductIdForCombination(productIdToCombinationMap, item);
            if (productId && !isCombinationInCombinations(item, newCombinations)) {
                productIdsTodelete.push(productId)
                return item;
            }
        })
        const combinationsToCreate = newCombinations.filter((item) => {
            if (!isCombinationInCombinations(item, currentCombinations)) {
                return item;
            }
        })
        setState(prevState => { return { ...prevState, combinationsToDelete, combinationsToCreate, productIdsTodelete } })
    }, []);

    return (
        <div>
            <h3>{ gettext("New product variations") }</h3>
            {
                Object.keys(newVariationData).map((variable, idx) => {
                    let values = newVariationData[variable];
                    return (
                        <div className="d-flex flex-column m-3" key={`pending-variations-${idx}`}>
                            <h4>{ variable }</h4>
                            <ul>
                                {
                                    values.map((value) => {
                                        return <li key={value}>{ value }</li>;
                                    })
                                }
                            </ul>
                        </div>
                    );
                })
            }
            <h3>{ gettext("Old combinations to be deleted") }</h3>
            <div className="d-flex flex-column">
                {
                    state.combinationsToDelete.map((item, idx) => {
                        let combinationStr = Object.keys(item).map(k=>`${k}: ${item[k]}`).join(', ');
                        return (
                            <div key={`combination-to-delete-${idx}`}>{ combinationStr }</div>
                        );
                    })
                }
            </div>
            <h3>{ gettext("New combinations to be created") }</h3>
            <div className="d-flex flex-column">
                {
                    state.combinationsToCreate.map((item, idx) => {
                        let combinationStr = Object.keys(item).map(k=>`${k}: ${item[k]}`).join(', ');
                        return (
                            <div key={`combination-to-create-${idx}`}>{ combinationStr }</div>
                        );
                    })
                }
            </div>
            {
                state.updating ? (
                    null
                ) : (
                    <div className="d-flex flex-column m-3">
                        <button
                            className="btn btn-primary mb-4"
                            onClick={() => {setState(prevState => { return { ...prevState, updating: true } })}}
                        >
                            { gettext("Finalize the update") }
                        </button>
                        <button
                            className="btn btn-delete btn-inverse"
                            onClick={() => { onCancel() }}
                        >
                            { gettext("Cancel update") }
                        </button>
                    </div>
                )
            }
            
        </div>
    )
}
