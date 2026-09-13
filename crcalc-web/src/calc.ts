/*
 * Copyright 2025-2026 lll69
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as ClipboardJS from "clipboard";
import { CalcMuiPlugin, CalcMuiPluginHolder } from "./calc_mui_types";
import Scroller from "./Scroller";
import { CreateFunRpnRequest, CreateURRequest, ToNiceStringRequest, ToStringRequest, ToStringResultSuccess, WorkerResult } from "./worker_types";
import { decode } from "base85";

/*pUrVkSlX CONFIGURATION START FOR DOWNLOAD HxDlWyZk**/
const CONFIG_IS_ONLINE = true;
// Operators
const CONFIG_POWER = true;
const CONFIG_SQRT = true;
const CONFIG_CBRT = true;
const CONFIG_FACT = true;
// Function Panel
const CONFIG_FUNCTION_PANEL = true;
// Constants
const CONFIG_PI = true;
const CONFIG_E = true;
// Functions
const CONFIG_LN = true;
const CONFIG_LOG = true;
const CONFIG_EXP = true;
const CONFIG_POW10 = true;
const CONFIG_TRIG = true;
const CONFIG_TRIG_INV = true;
const CONFIG_HYP = true;
const CONFIG_HYP_INV = true;
const CONFIG_VARIABLES = true;
const CONFIG_CUSTOM_FUNCTIONS = true;
// Switches
const CONFIG_SW_INV = true;
const CONFIG_SW_HYP = true;
const CONFIG_SW_BRACKETS = true;
// Input/Output
const CONFIG_UI_NO_KEYBOARD = true;
const CONFIG_SCROLLING = true;
// Control Buttons
const CONFIG_UI_COPY_RESULT = true;
const CONFIG_UI_COPY_TRUNC = true;
const CONFIG_UI_COPY_INTEGER = true;
const CONFIG_UI_SAVE_RESULT = true;
const CONFIG_UI_SIMPLIFY = true;
const CONFIG_UI_SPEED_SCROLL = true;
const CONFIG_UI_BUNDLE_FONTS = false;
// URLs
const CONFIG_WORKER_JS_CONTENT = "";
const CONFIG_FONT_CONTENTS: string[] = [];
const CONFIG_FONT_SIZES: number[] = [];
/*HxDlWyZk CONFIGURATION END FOR DOWNLOAD pUrVkSlX**/

const INTEGER_MIN = -2147483648;
const INTEGER_MAX = 2147483647;
const INITIAL_PREC = 32;
const PREC_INCREMENT = 128;
const INCREMENT_THRESHOLD = 64;
const MAX_INITIAL_PREC = INITIAL_PREC + PREC_INCREMENT;
let displayWidth = 25;
let chWidth = 0;
let degreeMode = false;
let isInvert = false;
let isShowHyp = false;
let isShowFun1 = false;
let simplifyRendered = false;
let invRendered = false;
let hypRendered = false;
const multiplyChar = "*";
const divideChar = "/";

const D = document;
const getElementById: typeof D.getElementById = D.getElementById.bind(D);
const createTextNode: typeof D.createTextNode = D.createTextNode.bind(D);
const { min, max, abs, floor, round, sqrt } = Math;
const { setInterval, clearInterval, setTimeout, clearTimeout, requestAnimationFrame, cancelAnimationFrame } = window;
const createObjectURL = URL.createObjectURL;
// @ts-ignore
const replaceStr: (s: string, a: string, b: string) => string = "".replaceAll ? (s, a, b) => s.replaceAll(a, b) : (s, a, b) => s.split(a).join(b);
const forEach = Array.prototype.forEach;

const calculatorDiv = getElementById("calculator") as HTMLElement;
const exprInput = getElementById("expression") as HTMLInputElement;
const resultDiv = getElementById("result_div") as HTMLElement;
const resultBoldText = getElementById("result_bold") as HTMLElement;
const resultNormalText = getElementById("result_normal") as HTMLElement;
const buttonInv = getElementById("toggle_inv") as HTMLElement;
const invReact = getElementById("react_inv_root") as HTMLElement;
const buttonCalc = getElementById("but_eq") as HTMLElement;
const buttonMode = getElementById("toggle_mode") as HTMLElement;
const measureDiv = getElementById("measure_4ch") as HTMLElement;
const numButtons = [
    getElementById("num_0") as HTMLElement,
    getElementById("num_1") as HTMLElement,
    getElementById("num_2") as HTMLElement,
    getElementById("num_3") as HTMLElement,
    getElementById("num_4") as HTMLElement,
    getElementById("num_5") as HTMLElement,
    getElementById("num_6") as HTMLElement,
    getElementById("num_7") as HTMLElement,
    getElementById("num_8") as HTMLElement,
    getElementById("num_9") as HTMLElement
];
const normalButtons = [
    getElementById("fun_ln") as HTMLElement,
    getElementById("fun_log") as HTMLElement
];
const inverseButtons = [
    getElementById("fun_exp") as HTMLElement,
    getElementById("fun_10pow") as HTMLElement
];
const trigButtons = [
    getElementById("fun_sin") as HTMLElement,
    getElementById("fun_cos") as HTMLElement,
    getElementById("fun_tan") as HTMLElement,
];
const inverseTrigButtons = [
    getElementById("fun_asin") as HTMLElement,
    getElementById("fun_acos") as HTMLElement,
    getElementById("fun_atan") as HTMLElement,
];
const hypElements = [
    getElementById("react_sinh_root") as HTMLElement,
    getElementById("react_cosh_root") as HTMLElement,
    getElementById("react_tanh_root") as HTMLElement,
];
const inverseHypElements = [
    getElementById("react_asinh_root") as HTMLElement,
    getElementById("react_acosh_root") as HTMLElement,
    getElementById("react_atanh_root") as HTMLElement,
];
const funButtons = [
    getElementById("fun_f") as HTMLElement,
    getElementById("fun_g") as HTMLElement,
];
const varButtons = [
    getElementById("var_x") as HTMLElement,
    getElementById("var_y") as HTMLElement,
    getElementById("var_z") as HTMLElement,
];
const copyButton = getElementById("copy_result") as HTMLElement;
const copyTruncatedButton = getElementById("copy_truncated") as HTMLElement;
const copyIntegerButton = getElementById("copy_integer") as HTMLElement;
const saveButton = getElementById("save_result") as HTMLElement;
const simplifyButton = getElementById("show_simplify") as HTMLElement;
const simplifyReact = getElementById("react_simplify_root") as HTMLElement;
const speedUpButton = getElementById("speed_up_scroll") as HTMLElement;
const loadingElement = getElementById("loading") as HTMLElement;
const resultBoldTextNode = createTextNode("Loading...");
const resultNormalTextNode = createTextNode("");
resultBoldText.innerHTML = "";
resultBoldText.appendChild(resultBoldTextNode);
resultNormalText.appendChild(resultNormalTextNode);
const scroller = Scroller();

const crL10N = window["crL10N"] || {};
const muiPlugin: CalcMuiPlugin = {};
let workerUrl: string | null = null;
let workerLoaded = false;
let workerBusy = false;
let needEnterNewExpr = false;
let needEnterVariable: string | null = null;
let hasResult = false;
let hasError = false;
let isResultSimplifiable = false;
let resultScrollable = false;
let speedUpFactor = 1;
let worker: Worker | null = null;
let resultString = "";
let digitMax = INTEGER_MAX;
let precisionNeeded = INITIAL_PREC;
let precisionCurrent = -1;
let pointIndex = -1;
let scrollOffset = 0;
let lastCalculateId = 1;
let lastCalculateUid = 1;
let loadAnimationIndex = 0;
let loadAnimationInterval: any;
let calcWaitTimeout: any;
let eLastScrollLeft = 0;
let eHaveFocus = false;

const VARIABLE_AVAIL = ["a", "b", "c", "x", "y", "z"];
const FUNCTION_AVAIL = ["F", "G", "H", "f", "g", "h"];
const variables = {
    a: undefined,
    b: undefined,
    c: undefined,
    x: undefined,
    y: undefined,
    z: undefined,
};
const functions = {
    F: undefined,
    G: undefined,
    H: undefined,
    f: undefined,
    g: undefined,
    h: undefined,
};

function showMessage(title: string, message: string, fallback: () => string, showCopy?: boolean) {
    let shown = false;
    if (muiPlugin.showAlert) {
        try {
            muiPlugin.showAlert(title, message, showCopy);
            shown = true;
        } catch (e) {
            console.error(e);
        }
    }
    if (!shown) {
        alert(fallback());
    }
}
function copyText(str: string) {
    ClipboardJS.copy(str);
}
function changeResultUIVisibility() {
    if (CONFIG_UI_COPY_RESULT) {
        copyButton.hidden = !hasResult;
    }
    if (CONFIG_UI_COPY_TRUNC) {
        copyTruncatedButton.hidden = !hasResult;
    }
    if (CONFIG_UI_COPY_INTEGER) {
        copyIntegerButton.hidden = !hasResult;
    }
    if (CONFIG_UI_SAVE_RESULT) {
        saveButton.hidden = !hasResult;
    }
    if (CONFIG_UI_SPEED_SCROLL) {
        speedUpButton.hidden = !hasResult;
    }
    if (CONFIG_UI_SIMPLIFY) {
        simplifyButton.hidden = !(!simplifyRendered && hasResult && isResultSimplifiable);
        simplifyReact.hidden = !(simplifyRendered && hasResult && isResultSimplifiable);
    }
}
function showScrolledResult(copyCallback?: (mightExact: boolean, str: string) => void, truncate?: boolean) {
    if (!workerLoaded || !hasResult) return;
    const resultLength = resultString.endsWith(".") ? (resultString.length - 1) : resultString.length;
    const shouldEnableSelect = (digitMax !== INTEGER_MAX && resultLength <= displayWidth);
    resultScrollable = !shouldEnableSelect;
    if (pointIndex === -1) {
        pointIndex = resultString.indexOf(".");
        if (pointIndex === -1) {
            pointIndex = resultString.length;
        }
    }
    if (shouldEnableSelect) {
        if (copyCallback) {
            copyCallback(true, digitMax === 0 ? resultString.substring(0, resultString.length - 1) : resultString);
            return;
        }
        scrollOffset = 0;
        if (digitMax === 0) {
            resultBoldTextNode.textContent = resultString.substring(0, resultString.length - 1);
            resultNormalTextNode.textContent = "";
        } else {
            resultBoldTextNode.textContent = resultString;
            resultNormalTextNode.textContent = "";
        }
        resultDiv.classList.remove("result-movable");
        return;
    }
    let rightIndex = scrollOffset + displayWidth;
    if (rightIndex > resultLength) {
        if (digitMax === 0) {
            scrollOffset = min(scrollOffset, pointIndex - displayWidth);
        } else if (digitMax !== INTEGER_MAX) {
            if (digitMax + 4 >= displayWidth) {
                scrollOffset = min(scrollOffset, pointIndex + 1 + digitMax - displayWidth + String(digitMax).length + 2);
            } else {
                scrollOffset = min(scrollOffset, pointIndex + 1 + digitMax - displayWidth);
            }
        }
        rightIndex = scrollOffset + displayWidth;
    }
    if (scrollOffset < 0) {
        scrollOffset = 0;
    }
    if (!resultDiv.classList.contains("result-movable")) {
        resultDiv.classList.add("result-movable");
    }
    if (rightIndex <= pointIndex) {
        rightIndex = min(scrollOffset + displayWidth, resultString.length);
        let offsetDigits: number;
        let offsetStrLength: number;
        let newOffsetDigits: number;
        let newOffsetStr: string;
        let newOffsetStrLength: number;
        if (rightIndex !== pointIndex || digitMax !== 0) {
            offsetDigits = pointIndex - rightIndex;
            offsetStrLength = String(offsetDigits).length + 1;
            newOffsetDigits = offsetDigits + offsetStrLength;
            newOffsetStr = String(newOffsetDigits);
            newOffsetStrLength = newOffsetStr.length + 1;
            while (newOffsetStrLength > offsetStrLength) {
                offsetStrLength = newOffsetStrLength;
                newOffsetDigits = offsetDigits + offsetStrLength;
                newOffsetStr = String(newOffsetDigits);
                newOffsetStrLength = newOffsetStr.length + 1;
            }
        } else {
            newOffsetStr = "";
            newOffsetStrLength = 0;
        }
        if (scrollOffset === 0) {
            let usedScientific = false;
            if (newOffsetStrLength > 0 && pointIndex > displayWidth) {
                // Try to use scientific notation
                let powerOfTen = resultString[0] === "-" ? (pointIndex - 2) : (pointIndex - 1);
                let powerOfTenLength = String(powerOfTen).length + 1;
                if (powerOfTenLength < displayWidth - 3) {
                    let scientific: string;
                    if (resultString[0] === "-") {
                        scientific = resultString.substring(0, 2) + "." + resultString.substring(2, rightIndex - powerOfTenLength - 1) + "E" + powerOfTen
                    } else {
                        scientific = resultString[0] + "." + resultString.substring(1, rightIndex - powerOfTenLength - 1) + "E" + powerOfTen
                    }
                    if (copyCallback) {
                        if (digitMax === INTEGER_MAX || truncate) {
                            copyCallback(false, scientific);
                        } else {
                            copyCallback(true, digitMax === 0 ? resultString.substring(0, resultString.length - 1) : resultString);
                        }
                        return;
                    }
                    resultBoldTextNode.textContent = scientific;
                    resultNormalTextNode.textContent = "";
                    usedScientific = true;
                }
            }
            if (!usedScientific) {
                if (copyCallback) {
                    if (digitMax === INTEGER_MAX || truncate) {
                        copyCallback(false, resultString.substring(0, rightIndex - newOffsetStrLength) + "E" + newOffsetStr);
                    } else {
                        copyCallback(true, digitMax === 0 ? resultString.substring(0, resultString.length - 1) : resultString);
                    }
                    return;
                }
                resultBoldTextNode.textContent = resultString.substring(scrollOffset, rightIndex - newOffsetStrLength);
                resultNormalTextNode.textContent = newOffsetStrLength > 0 ? "E" + newOffsetStr : "";
            }
        } else {
            if (copyCallback) {
                if (digitMax === INTEGER_MAX || truncate) {
                    copyCallback(false, resultString.substring(0, rightIndex - newOffsetStrLength) + "E" + newOffsetStr);
                } else {
                    copyCallback(true, digitMax === 0 ? resultString.substring(0, resultString.length - 1) : resultString);
                }
                return;
            }
            resultBoldTextNode.textContent = "..." + resultString.substring(scrollOffset + 3, rightIndex - newOffsetStrLength);
            resultNormalTextNode.textContent = newOffsetStrLength > 0 ? "E" + newOffsetStr : "";
        }
    } else if (scrollOffset === 0 || scrollOffset + 4 <= pointIndex) {
        rightIndex = min(scrollOffset + displayWidth, resultString.length);
        if (copyCallback) {
            if (digitMax === INTEGER_MAX || truncate) {
                copyCallback(false, resultString.substring(0, rightIndex));
            } else {
                copyCallback(true, digitMax === 0 ? resultString.substring(0, resultString.length - 1) : resultString);
            }
            return;
        }
        if (scrollOffset === 0) {
            resultBoldTextNode.textContent = resultString.substring(scrollOffset, rightIndex);
        } else {
            resultBoldTextNode.textContent = "..." + resultString.substring(scrollOffset + 3, rightIndex);
        }
        resultNormalTextNode.textContent = "";
    } else {
        let offsetDigits = rightIndex - pointIndex - 1;
        let offsetStrLength = String(offsetDigits).length + 2;
        let newOffsetDigits = offsetDigits - offsetStrLength;
        let newOffsetStr = String(newOffsetDigits);
        let newOffsetStrLength = newOffsetStr.length + 2;
        while (newOffsetStrLength < offsetStrLength) {
            offsetStrLength = newOffsetStrLength;
            newOffsetDigits = offsetDigits - offsetStrLength;
            newOffsetStr = String(newOffsetDigits);
            newOffsetStrLength = newOffsetStr.length + 2;
        }
        if (newOffsetStrLength > offsetStrLength) {
            newOffsetDigits -= 1;
            newOffsetStr = String(newOffsetDigits);
            newOffsetStrLength = newOffsetStr.length + 3;
        }
        if (scrollOffset > resultLength - displayWidth + newOffsetStrLength) {
            if (copyCallback) {
                copyCallback(false, resultString);
                return;
            }
            resultBoldTextNode.textContent = crL10N["calculating"] || "Calculating...";
            precisionNeeded = max(scrollOffset - pointIndex + newOffsetStrLength * 2, precisionCurrent + PREC_INCREMENT * min(1024, 1 + floor(scrollOffset / 1600)));
            calculateHigherPrecision();
        } else {
            if (copyCallback) {
                copyCallback(false, resultString.substring(0, rightIndex - newOffsetStrLength));
                return;
            }
            resultBoldTextNode.textContent = "..." + resultString.substring(scrollOffset + 3, rightIndex - newOffsetStrLength);
        }
        resultNormalTextNode.textContent = "E-" + newOffsetStr;
        if (scrollOffset > resultLength - displayWidth + newOffsetStrLength - INCREMENT_THRESHOLD) {
            let newResultLength = resultLength;
            precisionNeeded = precisionCurrent;
            const precIncr = PREC_INCREMENT * round(sqrt(speedUpFactor)) * min(1024, 1 + floor(scrollOffset / 1600));
            while (scrollOffset > newResultLength - displayWidth + newOffsetStrLength - INCREMENT_THRESHOLD) {
                precisionNeeded += precIncr;
                newResultLength += precIncr;
            }
            precisionNeeded = min(digitMax, precisionNeeded);
            calculateHigherPrecision();
        }
    }
}
function saveText(content: string, name: string) {
    if (CONFIG_UI_SAVE_RESULT) {
        let url = createObjectURL(new Blob([content], { type: "text/plain" }));
        let element = D.createElement("a");
        element.href = url;
        element.download = name;
        D.body.appendChild(element);
        element.click();
        element.remove();
    }
}
function copyResult(save: boolean, truncate: boolean) {
    const showAlert = (message: string) => {
        showMessage(crL10N["copied"] || "Copied", message, () => message);
    }
    let content: string;
    let exact: boolean;
    if (!truncate && digitMax === 0 && precisionCurrent === 0) {
        content = (resultString.substring(0, resultString.length - 1));
        exact = true;
    } else if (!truncate && digitMax !== INTEGER_MAX && precisionCurrent >= digitMax) {
        content = (resultString);
        exact = true;
    } else {
        content = "";
        exact = false;
        showScrolledResult((mightExact, str) => {
            content = (str);
            exact = (mightExact && (digitMax === 0 || (digitMax !== INTEGER_MAX && precisionCurrent >= digitMax)));
        }, truncate);
    }
    if (!save) {
        copyText(content);
        if (exact) {
            showAlert((crL10N["exactCopied"] || "Exact result has been copied (length:") + (content.length) + ")");
        } else {
            showAlert((crL10N["truncatedCopied"] || "TRUNCATED result has been copied (length:") + (content.length) + ")");
        }
    } else if (CONFIG_UI_SAVE_RESULT) {
        saveText(content, exact ? "output_exact.txt" : "output_truncated.txt");
    }
}
function scrollToErrorIfNeeded(e: string, str: string) {
    if (e.startsWith(str)) {
        resultDiv.scrollLeft = chWidth * str.length;
    }
}
function changeHypButtonIfNeeded() {
    if (CONFIG_SW_HYP && hypRendered && workerLoaded) {
        getElementById("fun_percent")!.classList.add("op-hide");
        getElementById("react_hyp_root")!.classList.remove("op-hide");
    }
}
function onWorkerMessage(e: MessageEvent<WorkerResult>) {
    const msg = e.data;
    switch (msg.type) {
        case "init":
            if (!workerLoaded) {
                workerLoaded = true;
                for (let i = 0, arr = D.getElementsByClassName("intro") as HTMLCollectionOf<HTMLElement>; i < arr.length; i++) {
                    arr[i].hidden = true;
                }
                getElementById("loading-style")!.remove();
                changeHypButtonIfNeeded();
                clearResult();
                focusExpression();
                if (navigator.userAgent.indexOf("Firefox") >= 0) {
                    loadingElement.innerText = crL10N["firefoxNotice"] || "When performing exponentiation and factorial calculations, Chrome/Edge may be faster than Firefox and can compute more digits.";
                    loadingElement.hidden = false;
                }
            }
            break;
        case "createUR":
            if (msg.success) {
                hasResult = true;
                isResultSimplifiable = msg.exactlyDisplayable;
                hasError = false;
                digitMax = msg.digitsRequired;
                precisionNeeded = digitMax !== INTEGER_MAX ? MAX_INITIAL_PREC : INITIAL_PREC;
                precisionCurrent = -1;
                pointIndex = -1;
                workerBusy = false;
                if (CONFIG_VARIABLES && needEnterVariable !== null) {
                    variables[needEnterVariable] = msg.rpnResult;
                }
                calculateHigherPrecision();
            } else {
                hasResult = false;
                hasError = true;
                workerBusy = false;
                clearTimeout(calcWaitTimeout);
                buttonCalc.innerText = "=";
                resultDiv.classList.remove("result-movable");
                resultBoldTextNode.textContent = msg.error;
                resultNormalTextNode.textContent = "";
                let errString = String(msg.error);
                let match = errString.match(/at position \[(\d+),(\d+)\]/);
                if (match) {
                    focusExpression();
                    let start = Number(match[1]);
                    exprInput.selectionStart = start;
                    exprInput.selectionEnd = Number(match[2]);
                    exprInput.scrollLeft = chWidth * (start > 0 ? start - 1 : start);
                }
                match = errString.match(/at position \((\d+)\)/);
                if (match) {
                    focusExpression();
                    let start = Number(match[1]);
                    exprInput.selectionStart = start;
                    exprInput.selectionEnd = start + 1;
                    exprInput.scrollLeft = chWidth * (start > 0 ? start - 1 : start);
                }
                scrollToErrorIfNeeded(errString, "Error: ArithmeticException: ");
                changeResultUIVisibility();
            }
            break;
        case "toStringTruncated":
            if (msg.uid === lastCalculateUid) {
                workerBusy = false;
                clearTimeout(calcWaitTimeout);
                buttonCalc.innerText = "=";
                if (msg.error) {
                    hasResult = false;
                    hasError = true;
                    resultDiv.classList.remove("result-movable");
                    resultBoldTextNode.textContent = msg.error;
                    resultNormalTextNode.textContent = "";
                    changeResultUIVisibility();
                } else {
                    hasResult = true;
                    hasError = false;
                    let result = (msg as ToStringResultSuccess).result;
                    if (msg.prec >= precisionCurrent) {
                        precisionCurrent = msg.prec;
                        resultString = result;
                        showScrolledResult();
                        changeResultUIVisibility();
                    }
                    if (precisionNeeded > precisionCurrent) {
                        calculateHigherPrecision();
                    }
                }
            }
            break;
        case "toNiceString":
            if (CONFIG_UI_SIMPLIFY && msg.uid === lastCalculateUid) {
                const text = msg.error || msg.result;
                const title = (digitMax === 0) ? (crL10N["integerResult"] || "Integer Result") : crL10N["simplifiedResult"] || "Simplified Result";
                const title2 = (digitMax === 0) ? (crL10N["integerResult2"] || "Integer Result: ") : (crL10N["simplifiedResult2"] || "Simplified Result: ");
                showMessage(title, text!, () => title2 + text, true);
            }
            break;
        case "createFunRpn":
            if (msg.success) {
                hasResult = false;
                hasError = true;
                workerBusy = false;
                clearTimeout(calcWaitTimeout);
                buttonCalc.innerText = "=";
                resultDiv.classList.remove("result-movable");
                resultBoldTextNode.textContent = "Success";
                resultNormalTextNode.textContent = "";
                if (CONFIG_CUSTOM_FUNCTIONS && needEnterVariable !== null) {
                    functions[needEnterVariable] = msg.rpnResult;
                }
                changeResultUIVisibility();
            } else {
                hasResult = false;
                hasError = true;
                workerBusy = false;
                clearTimeout(calcWaitTimeout);
                buttonCalc.innerText = "=";
                resultDiv.classList.remove("result-movable");
                resultBoldTextNode.textContent = msg.error;
                resultNormalTextNode.textContent = "";
                let errString = String(msg.error);
                let match = errString.match(/at position \[(\d+),(\d+)\]/);
                if (match) {
                    focusExpression();
                    let start = Number(match[1]);
                    exprInput.selectionStart = start;
                    exprInput.selectionEnd = Number(match[2]);
                    exprInput.scrollLeft = chWidth * (start > 0 ? start - 1 : start);
                }
                match = errString.match(/at position \((\d+)\)/);
                if (match) {
                    focusExpression();
                    let start = Number(match[1]);
                    exprInput.selectionStart = start;
                    exprInput.selectionEnd = start + 1;
                    exprInput.scrollLeft = chWidth * (start > 0 ? start - 1 : start);
                }
                scrollToErrorIfNeeded(errString, "Error: ArithmeticException: ");
                changeResultUIVisibility();
            }
            break;
    }
}
function onWorkerError(e: ErrorEvent) {
    console.error(e);
    loadingElement.innerText = "Worker Error: " + e.message;
    loadingElement.hidden = false;
}
function reInitWorker() {
    if (worker) {
        worker.terminate();
    }
    worker = new Worker(workerUrl!);
    worker.onmessage = onWorkerMessage;
    worker.onerror = onWorkerError;
    workerBusy = false;
    hasResult = false;
    hasError = false;
    changeResultUIVisibility();
}
function initWorker(workerJs: string) {
    workerUrl = createObjectURL(new Blob([workerJs], { type: "text/javascript" }));
    reInitWorker();
}
function showLoadAnimation() {
    loadAnimationIndex = (loadAnimationIndex + 1) % 4;
    resultBoldTextNode.textContent = "Loading..." + "/-\\|"[loadAnimationIndex];
}
function onLoadingError(e: string) {
    clearInterval(loadAnimationInterval);
    loadingElement.innerText = e;
    exprInput.readOnly = true;
    exprInput.value = e;
    resultDiv.classList.remove("result-movable");
    resultBoldTextNode.textContent = crL10N["tryRefresh"] || "Try refreshing the page.";
    resultNormalTextNode.textContent = "";
    forEach.call(calculatorDiv.getElementsByTagName("button"), (e) => {
        e.disabled = true;
    });
}
function clearResult() {
    resultDiv.classList.remove("result-movable");
    resultBoldTextNode.textContent = "";
    resultNormalTextNode.textContent = "";
    loadingElement.hidden = true;
    needEnterNewExpr = false;
    hasResult = false;
    hasError = false;
    resultString = "";
    digitMax = INTEGER_MAX;
    precisionNeeded = INITIAL_PREC;
    precisionCurrent = -1;
    pointIndex = -1;
    scrollOffset = 0;
    changeResultUIVisibility();
}
function onExprChange() {
    if (workerBusy) {
        reInitWorker();
        buttonCalc.innerText = "=";
    }
    clearResult();
}

if (CONFIG_WORKER_JS_CONTENT === "") {
    loadAnimationInterval = setInterval(showLoadAnimation, 100);
    fetch("/calc_worker.js").then((result) => {
        if (result.ok) {
            result.text().then((workerJs) => {
                clearInterval(loadAnimationInterval);
                initWorker(workerJs);
            }).catch((e) => {
                console.error(e);
                onLoadingError("Error: calc_worker.js " + e);
            })
        } else {
            onLoadingError("Error: calc_worker.js status=" + result.status);
        }
    }).catch((e) => {
        console.error(e);
        onLoadingError("Error: calc_worker.js " + e);
    });
} else {
    initWorker(CONFIG_WORKER_JS_CONTENT);
}
function onCalcTimeout() {
    if (workerBusy) {
        const title = crL10N["calcTimeOut"] || "Calculation timed out";
        const message = crL10N["calcTimeOutDesc"] || ("The calculation took longer than expected.\n"
            + "Value may be infinite or undefined (such as tan(90°) or 1/0), or the number may have too many digits.\n"
            + "You can stop the calculation or wait for it to complete. Waiting may result in prolonged high CPU usage.");
        showMessage(title, message, () => message);
    }
}
function calculateHigherPrecision() {
    if (!workerLoaded || !hasResult || workerBusy) return;
    let precision = min(digitMax, precisionNeeded);
    if (precision <= precisionCurrent) return;
    workerBusy = true;
    buttonCalc.innerText = "STOP";
    worker!.postMessage({
        type: "toStringTruncated",
        id: lastCalculateId,
        uid: ++lastCalculateUid,
        prec: precision
    } as ToStringRequest);
}
function preprocessExpr() {
    let expr: string = exprInput.value;
    let modified = false;
    if (expr.indexOf(" ") >= 0) {
        expr = replaceStr(expr, " ", "");
        modified = true;
    }
    if (CONFIG_PI && expr.indexOf("pi") >= 0) {
        expr = replaceStr(expr, "pi", "\u03C0");
        modified = true;
    }
    if (CONFIG_POWER && expr.indexOf("**") >= 0) {
        expr = replaceStr(expr, "**", "^");
        modified = true;
    }
    if (expr.indexOf("\u00D7") >= 0) {
        expr = replaceStr(expr, "\u00D7", "*");
        modified = true;
    }
    if (expr.indexOf("\u00F7") >= 0) {
        expr = replaceStr(expr, "\u00F7", "/");
        modified = true;
    }
    if (modified) {
        exprInput.value = expr;
        exprInput.selectionStart = exprInput.selectionEnd = expr.length;
    }
}
function showError(errString: string) {
    hasResult = false;
    hasError = true;
    workerBusy = false;
    clearTimeout(calcWaitTimeout);
    buttonCalc.innerText = "=";
    resultDiv.classList.remove("result-movable");
    resultBoldTextNode.textContent = errString;
    resultNormalTextNode.textContent = "";
    changeResultUIVisibility();
}
function calculateResultWithFunction(isFun: boolean, funName?: string) {
    if (!workerLoaded) return;
    if (workerBusy) {
        reInitWorker();
        clearResult();
        buttonCalc.innerText = "=";
        clearTimeout(calcWaitTimeout);
        return;
    }
    clearResult();
    onCalculatorResize();
    preprocessExpr();
    if (exprInput.value === "") {
        focusExpression();
        return;
    }
    needEnterNewExpr = true;
    worker!.postMessage({ type: "removeUR", id: lastCalculateId });
    lastCalculateId = (lastCalculateId + 1) | 0;
    changeResultUIVisibility();

    needEnterVariable = funName || null;
    buttonCalc.innerText = "STOP";
    worker!.postMessage({
        type: isFun ? "createFunRpn" : "createUR",
        id: lastCalculateId,
        uid: lastCalculateId,
        expr: exprInput.value,
        degreeMode: degreeMode,
        variables: CONFIG_VARIABLES ? variables : undefined,
        functions: CONFIG_CUSTOM_FUNCTIONS ? functions : undefined,
    } as (CreateURRequest | CreateFunRpnRequest));
    workerBusy = true;
    clearTimeout(calcWaitTimeout);
    calcWaitTimeout = setTimeout(onCalcTimeout, 5000);
}
function calculateResult() {
    calculateResultWithFunction(false);
}
function focusExpression() {
    if (workerLoaded) {
        const html = document.documentElement;
        const lastScrollTop = html.scrollTop;
        const lastScrollLeft = html.scrollLeft;
        if (!eHaveFocus) {
            const focusTime = Date.now();
            const scrollListener = (e: Event) => {
                document.removeEventListener("scroll", scrollListener, true);
                if (Date.now() - focusTime < 100) {
                    e.stopImmediatePropagation();
                    html.scrollTop = lastScrollTop;
                    html.scrollLeft = lastScrollLeft;
                }
            };
            document.addEventListener("scroll", scrollListener, true);
        }
        exprInput.focus();
    }
}
function refreshFunVarButtons() {
    if (CONFIG_VARIABLES) {
        if (!isInvert) { // read
            forEach.call("xyz", (ch: string, idx: number) => {
                varButtons[idx].textContent = ch;
            });
        } else { // write
            forEach.call("xyz", (ch: string, idx: number) => {
                varButtons[idx].textContent = "→" + ch;
            });
        }
    }
    if (CONFIG_CUSTOM_FUNCTIONS) {
        if (!isInvert) { // read
            forEach.call("fg", (ch: string, idx: number) => {
                funButtons[idx].textContent = ch + "( )";
            });
        } else { // write
            forEach.call("fg", (ch: string, idx: number) => {
                funButtons[idx].textContent = "→" + ch;
            });
        }
    }
}
function refreshInverseButton() {
    buttonInv.title = invReact.title = isInvert ? (crL10N["hideInv"] || "Hide second functions") : (crL10N["showInv"] || "Show second functions");
    if (CONFIG_SW_INV && invRendered) {
        if (isInvert) {
            buttonInv.classList.add("op-hide");
            invReact.classList.remove("op-hide");
        } else {
            buttonInv.classList.remove("op-hide");
            invReact.classList.add("op-hide");
        }
    }
    refreshFunVarButtons();
}
function refreshInverse() {
    for (const button of normalButtons) {
        if (isInvert) {
            button.classList.add("op-hide");
        } else {
            button.classList.remove("op-hide");
        }
    }
    for (const button of inverseButtons) {
        if (isInvert) {
            button.classList.remove("op-hide");
        } else {
            button.classList.add("op-hide");
        }
    }
    for (const button of trigButtons) {
        if (!isInvert && !isShowHyp) {
            button.classList.remove("op-hide");
        } else {
            button.classList.add("op-hide");
        }
    }
    for (const button of inverseTrigButtons) {
        if (isInvert && !isShowHyp) {
            button.classList.remove("op-hide");
        } else {
            button.classList.add("op-hide");
        }
    }
    for (const button of hypElements) {
        if (isShowHyp && !isInvert) {
            button.classList.remove("op-hide");
        } else {
            button.classList.add("op-hide");
        }
    }
    for (const button of inverseHypElements) {
        if (isShowHyp && isInvert) {
            button.classList.remove("op-hide");
        } else {
            button.classList.add("op-hide");
        }
    }
}
function inverseClick() {
    if (CONFIG_SW_INV) {
        if (!workerLoaded) return;
        isInvert = !isInvert;
        refreshInverse();
        refreshInverseButton();
        focusExpression();
    }
}
function hypClick(show: boolean) {
    if (!workerLoaded) return;
    isShowHyp = show;
    refreshInverse();
    refreshInverseButton();
    focusExpression();
}
function refreshModeButton() {
    if (CONFIG_TRIG || CONFIG_TRIG_INV) {
        buttonMode.title = degreeMode ? (crL10N["currDeg"] || "Currently in degree mode") : (crL10N["currRad"] || "Currently in radian mode");
        buttonMode.innerText = degreeMode ? "DEG" : "RAD";
    }
}
function modeClick() {
    if (!workerLoaded) return;
    degreeMode = !degreeMode;
    refreshModeButton();
    if (hasResult) {
        //calculateResult();
        clearResult();
    }
    focusExpression();
}
function insertStr(str: string) {
    if (!workerLoaded) return;
    const currentExpr = exprInput.value;
    const selectionStart = exprInput.selectionStart!;
    const selectionEnd = exprInput.selectionEnd!;
    if (selectionStart === selectionEnd && selectionStart === currentExpr.length) {
        exprInput.value = currentExpr + str;
    } else {
        exprInput.value = currentExpr.substring(0, selectionStart) + str + currentExpr.substring(selectionEnd, currentExpr.length);
    }
    exprInput.selectionStart = exprInput.selectionEnd = selectionStart + str.length;
    onExprChange();
}
function checkEnterNewExpr() {
    if (hasResult && needEnterNewExpr) {
        needEnterNewExpr = false;
        exprInput.value = "";
        exprInput.selectionStart = 0;
        exprInput.selectionEnd = 0;
    }
}
function appendDigit(n: string | number, fromInput?: boolean) {
    if (!workerLoaded) return;
    checkEnterNewExpr();
    const currentExpr = exprInput.value;
    const selectionStart = exprInput.selectionStart!;
    if (selectionStart > 0) {
        const prevChar = currentExpr[selectionStart - 1];
        if (")!\u03C0xyze".indexOf(prevChar) >= 0) {
            insertStr(multiplyChar + n);
            return true;
        }
    }
    if (!fromInput) {
        insertStr(String(n));
    }
}
function appendPoint(fromInput?: boolean) {
    if (!workerLoaded) return true;
    checkEnterNewExpr();
    const currentExpr = exprInput.value;
    const selectionStart = exprInput.selectionStart!;
    const selectionEnd = exprInput.selectionEnd!;
    if (selectionEnd < currentExpr.length) {
        let i = selectionEnd;
        while (i < currentExpr.length) {
            const charAtI = currentExpr[i];
            if ("0123456789".indexOf(charAtI) < 0) {
                if (charAtI === ".") {
                    return true;
                }
                break;
            }
            i++;
        }
    }
    if (selectionStart > 0) {
        const prevChar = currentExpr[selectionStart - 1];
        if (")!\u03C0xyze".indexOf(prevChar) >= 0) {
            insertStr(multiplyChar + "0.");
            return true;
        } else if ("+-\u00D7\u00F7*/^(".indexOf(prevChar) >= 0) {
            insertStr("0.");
            return true;
        } else {
            let i = selectionStart;
            while (i >= 0) {
                i--;
                const charAtI = currentExpr[i];
                if ("0123456789".indexOf(charAtI) < 0) {
                    if (charAtI === ".") {
                        return true;
                    }
                    break;
                }
            }
        }
    }
    if (selectionStart <= 0) {
        insertStr("0.");
        return true;
    }
    if (!fromInput) {
        insertStr(".");
    }
}
function appendParen(p: string, fromInput?: boolean) {
    if (!workerLoaded) return;
    if (p === "(") {
        const currentExpr = exprInput.value;
        const selectionStart = exprInput.selectionStart!;
        const selectionEnd = exprInput.selectionEnd!;
        let needMultiply = false;
        if (selectionStart > 0) {
            const prevChar = currentExpr[selectionStart - 1];
            if ("0123456789.)!\u03C0xyze".indexOf(prevChar) >= 0) {
                needMultiply = true;
            }
        }
        if (selectionStart !== selectionEnd) {
            if (needMultiply) {
                exprInput.value = currentExpr.substring(0, selectionStart) + multiplyChar + "(" + currentExpr.substring(selectionStart, selectionEnd) + ")" + currentExpr.substring(selectionEnd, currentExpr.length);
                exprInput.selectionStart = selectionStart + 2;
                exprInput.selectionEnd = selectionEnd + 2;
            } else {
                exprInput.value = currentExpr.substring(0, selectionStart) + "(" + currentExpr.substring(selectionStart, selectionEnd) + ")" + currentExpr.substring(selectionEnd, currentExpr.length);
                exprInput.selectionStart = selectionStart + 1;
                exprInput.selectionEnd = selectionEnd + 1;
            }
            onExprChange();
            return true;
        }
        if (needMultiply) {
            insertStr(multiplyChar + "(");
            return true;
        }
    }
    if (!fromInput) {
        insertStr(p);
    }
}
function appendOperator(op: string, fromInput?: boolean) {
    if (!workerLoaded) return;
    if (op === "!") {
        if (!fromInput) {
            insertStr(op);
        }
        return false;
    }
    const currentExpr = exprInput.value;
    const selectionStart = exprInput.selectionStart!;
    if (selectionStart > 0) {
        const prevChar = currentExpr[selectionStart - 1];
        if (op === "-") {
            if (prevChar === "+") {
                exprInput.selectionStart = selectionStart - 1;
            } else if ("-\u00D7\u00F7*/^".indexOf(prevChar) >= 0) {
                insertStr("(" + op);
                return true;
            }
        } else if (CONFIG_POWER && op === "*" && prevChar === '*') {
            exprInput.selectionStart = selectionStart - 1;
            insertStr("^");
            return true;
        } else {
            if (selectionStart > 0 && "+-\u00D7\u00F7*/^".indexOf(prevChar) >= 0) {
                exprInput.selectionStart = selectionStart - 1;
                insertStr(op);
                return true;
            }
        }
    }
    if (!fromInput) {
        insertStr(op);
    }
}
function appendConst(c: string) {
    if (!workerLoaded) return;
    checkEnterNewExpr();
    const currentExpr = exprInput.value;
    const selectionStart = exprInput.selectionStart!;
    if (selectionStart > 0) {
        const prevChar = currentExpr.charAt(selectionStart - 1);
        if ("0123456789.)!\u03C0xyze".indexOf(prevChar) >= 0) {
            insertStr(multiplyChar + c);
            return;
        }
    }
    insertStr(c);
}
function appendFunction(fn: string) {
    if (!workerLoaded) return;
    checkEnterNewExpr();
    const currentExpr = exprInput.value;
    const selectionStart = exprInput.selectionStart!;
    if (selectionStart > 0) {
        const prevChar = currentExpr.charAt(selectionStart - 1);
        if ("0123456789.)!\u03C0xyze".indexOf(prevChar) >= 0) {
            insertStr(multiplyChar + fn + "(");
            return;
        }
    }
    insertStr(fn + "(");
}
function registerFunction(fun: string) {
    getElementById("fun_" + fun)!.addEventListener("click", () => {
        appendFunction(fun);
        focusExpression();
    });
}
function onDel(fromInput?: boolean) {
    if (!workerLoaded) return;
    if (fromInput) return false;
    const selectionStart = exprInput.selectionStart!;
    const selectionEnd = exprInput.selectionEnd!;
    if (selectionStart === selectionEnd) {
        if (selectionStart > 0) {
            const currentExpr = exprInput.value;
            exprInput.value = currentExpr.substring(0, selectionStart - 1) + currentExpr.substring(selectionEnd, currentExpr.length);
            exprInput.selectionStart = exprInput.selectionEnd = selectionStart - 1;
            onExprChange();
        }
    } else {
        insertStr("");
    }
}
function onClear() {
    if (!workerLoaded) return;
    if (workerBusy) {
        reInitWorker();
        buttonCalc.innerText = "=";
    }
    exprInput.value = "";
    clearResult();
}
refreshInverseButton();
if (CONFIG_SW_INV) {
    buttonInv.addEventListener("click", inverseClick);
}
refreshModeButton();
buttonMode.addEventListener("click", modeClick);
numButtons.forEach((button, idx) => {
    button.addEventListener("click", () => {
        appendDigit(idx);
        focusExpression();
    });
});
getElementById("num_point")!.addEventListener("click", () => {
    appendPoint();
    focusExpression();
});
getElementById("op_add")!.addEventListener("click", () => {
    appendOperator("+");
    focusExpression();
});
getElementById("op_sub")!.addEventListener("click", () => {
    appendOperator("-");
    focusExpression();
});
getElementById("op_mul")!.addEventListener("click", () => {
    appendOperator(multiplyChar);
    focusExpression();
});
getElementById("op_div")!.addEventListener("click", () => {
    appendOperator(divideChar);
    focusExpression();
});
if (CONFIG_POWER) {
    getElementById("op_pow")!.addEventListener("click", () => {
        appendOperator("^");
        focusExpression();
    });
}
if (CONFIG_FUNCTION_PANEL) {
    if (CONFIG_FACT) {
        getElementById("op_fact")!.addEventListener("click", () => {
            appendOperator("!");
            focusExpression();
        });
    }
    if (CONFIG_PI) {
        getElementById("const_pi")!.addEventListener("click", () => {
            appendConst("\u03C0");
            focusExpression();
        });
    }
    if (CONFIG_E) {
        getElementById("const_e")!.addEventListener("click", () => {
            appendConst("e");
            focusExpression();
        });
    }
    if (CONFIG_SW_BRACKETS) {
        getElementById("op_lparen")!.addEventListener("click", () => {
            appendParen("(");
            focusExpression();
        });
        getElementById("op_rparen")!.addEventListener("click", () => {
            appendParen(")");
            focusExpression();
        });
    }
    if (CONFIG_SQRT) {
        getElementById("op_sqrt")!.addEventListener("click", () => {
            appendFunction("sqrt");
            focusExpression();
        });
    }
    if (CONFIG_TRIG) {
        registerFunction("sin");
        registerFunction("cos");
        registerFunction("tan");
    }
    if (CONFIG_TRIG_INV) {
        registerFunction("asin");
        registerFunction("acos");
        registerFunction("atan");
    }
    if (CONFIG_LN) {
        registerFunction("ln");
    }
    if (CONFIG_LOG) {
        registerFunction("log");
    }
    if (CONFIG_EXP) {
        registerFunction("exp");
    }
    if (CONFIG_POW10) {
        getElementById("fun_10pow")!.addEventListener("click", () => {
            insertStr("10^");
            focusExpression();
        });
    }
    getElementById("fun_percent")!.addEventListener("click", () => {
        insertStr("/100");
        focusExpression();
    });
    if (CONFIG_CBRT) {
        getElementById("op_cbrt")!.addEventListener("click", () => {
            insertStr("^(1/3)");
            focusExpression();
        });
    }
} else {
    const funPanel = document.querySelector(".grid-fun");
    if (funPanel) funPanel.remove();
}
getElementById("but_del")!.addEventListener("click", () => {
    onDel();
    focusExpression();
});
getElementById("but_clr")!.addEventListener("click", () => {
    onClear();
    focusExpression();
});
if (CONFIG_FUNCTION_PANEL && CONFIG_HYP) {
    muiPlugin.onSinhButtonClick = () => {
        appendFunction("sinh");
        focusExpression();
    };
    muiPlugin.onCoshButtonClick = () => {
        appendFunction("cosh");
        focusExpression();
    };
    muiPlugin.onTanhButtonClick = () => {
        appendFunction("tanh");
        focusExpression();
    };
}
if (CONFIG_FUNCTION_PANEL && CONFIG_HYP_INV) {
    muiPlugin.onASinhButtonClick = () => {
        appendFunction("asinh");
        focusExpression();
    };
    muiPlugin.onACoshButtonClick = () => {
        appendFunction("acosh");
        focusExpression();
    };
    muiPlugin.onATanhButtonClick = () => {
        appendFunction("atanh");
        focusExpression();
    };
}
if (CONFIG_FUNCTION_PANEL && CONFIG_SW_HYP) {
    muiPlugin.onHypButtonClick = hypClick;
}
if (CONFIG_FUNCTION_PANEL && CONFIG_SW_INV) {
    muiPlugin.onInvButtonClick = inverseClick;
}
buttonCalc.addEventListener("click", calculateResult);
exprInput.addEventListener("input", onExprChange);
exprInput.addEventListener("keydown", (e) => {
    if (!workerLoaded) {
        e.preventDefault();
        return;
    }
    const key = e.key;
    switch (key) {
        case "Backspace":
            if (onDel(true)) e.preventDefault();
            break;
        case "Enter":
        case "=":
            e.preventDefault();
            calculateResult();
            break;
        case "(":
        case ")":
            if (CONFIG_SW_BRACKETS && appendParen(key, true)) e.preventDefault();
            break;
        case ".":
            if (appendPoint(true)) e.preventDefault();
            break;
        case "+":
        case "-":
            if (appendOperator(key, true)) e.preventDefault();
            break;
        case "*":
            if (appendOperator(multiplyChar, true)) e.preventDefault();
            break;
        case "/":
            if (appendOperator(divideChar, true)) e.preventDefault();
            break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
            if (appendDigit(Number(key), true)) e.preventDefault();
            break;
    }
});
if (CONFIG_UI_COPY_RESULT) {
    copyButton.addEventListener("click", () => copyResult(false, false));
}
if (CONFIG_UI_COPY_TRUNC) {
    copyTruncatedButton.addEventListener("click", () => copyResult(false, true));
}
function copyOrSaveInteger(save: boolean) {
    const content = resultString.substring(0, pointIndex);
    if (save) {
        if (CONFIG_UI_SAVE_RESULT) {
            saveText(content, "output_integer.txt");
        }
    } else if (CONFIG_UI_COPY_INTEGER) {
        const showAlert = (message: string) => {
            showMessage(crL10N["copied"] || "Copied", message, () => message);
        }
        copyText(content);
        showAlert((crL10N["integerCopied"] || "Integer part has been copied (length:") + (content.length) + ")");
    }
}
if (CONFIG_UI_COPY_INTEGER) {
    copyIntegerButton.addEventListener("click", () => copyOrSaveInteger(false));
}
if (CONFIG_UI_SAVE_RESULT) {
    saveButton.addEventListener("click", () => {
        if (muiPlugin.showSaveOption) {
            const exact = (digitMax === 0 && precisionCurrent === 0) || (digitMax !== INTEGER_MAX && precisionCurrent >= digitMax);
            muiPlugin.showSaveOption(exact);
        } else {
            copyResult(true, false);
        }
    });
    muiPlugin.onSaveClick = (option: string) => {
        switch (option) {
            case "exact":
                copyResult(true, false);
                break;
            case "truncated":
                copyResult(true, true);
                break;
            case "integer":
                copyOrSaveInteger(true);
                break;
        }
    };
}
if (CONFIG_UI_SIMPLIFY) {
    simplifyButton.addEventListener("click", () => {
        if (hasResult && isResultSimplifiable) {
            worker!.postMessage({
                type: "toNiceString",
                id: lastCalculateId,
                uid: ++lastCalculateUid,
            } as ToNiceStringRequest);
        }
    });
}
if (CONFIG_UI_SPEED_SCROLL) {
    speedUpButton.addEventListener("click", () => {
        switch (speedUpFactor) {
            case 1:
                speedUpFactor = 4;
                speedUpButton.classList.add("button-link-select1");
                break;
            case 4:
                speedUpFactor = 9;
                speedUpButton.classList.remove("button-link-select1");
                speedUpButton.classList.add("button-link-select2");
                break;
            case 9:
                speedUpFactor = 1;
                speedUpButton.classList.remove("button-link-select2");
                break;
        }
    });
}
if (!CONFIG_VARIABLES && !CONFIG_CUSTOM_FUNCTIONS) {
    document.getElementById("fun_var_line")?.classList.add("grid-hide");
}
if (CONFIG_CUSTOM_FUNCTIONS) {
    funButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (!isInvert) {
                appendFunction(button.dataset.fun!);
            } else {
                calculateResultWithFunction(true, button.dataset.fun!);
            }
            focusExpression();
        });
    });
} else {
    funButtons.forEach(button => (button as HTMLButtonElement).disabled = true);
}
if (CONFIG_VARIABLES) {
    varButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (!isInvert) {
                appendConst(button.dataset.variable!);
                focusExpression();
            } else {
                calculateResult();
                needEnterVariable = button.dataset.variable!;
            }
        });
    });
} else {
    varButtons.forEach(button => (button as HTMLButtonElement).disabled = true);
}

exprInput.addEventListener("scroll", () => {
    let lastScrollLeft = eLastScrollLeft;
    eLastScrollLeft = exprInput.scrollLeft;
    if (exprInput.scrollLeft === 0 && !eHaveFocus && lastScrollLeft !== 0) {
        exprInput.scrollLeft = lastScrollLeft;
    }
})
exprInput.addEventListener("focus", () => {
    eHaveFocus = true;
    needEnterNewExpr = false;
});
exprInput.addEventListener("blur", () => {
    eHaveFocus = false;
});
exprInput.addEventListener("pointerdown", () => {
    needEnterNewExpr = false;
});
function onCalculatorResize() {
    chWidth = measureDiv.getBoundingClientRect().width / 4;
    let newDisplayWidth = floor(calculatorDiv.clientWidth / chWidth);
    if (newDisplayWidth !== displayWidth) {
        displayWidth = newDisplayWidth;
        if (hasResult) {
            showScrolledResult();
        }
    }
}
new ResizeObserver(onCalculatorResize).observe(calculatorDiv);
onCalculatorResize();
function registerScroll() {
    const SCROLL_TICK = 40;
    let isDown = false;
    let downType = "";
    let downX = 0;
    let lastDownX = 0;
    let downScrollOffset = 0;
    let lastTimestamp = 0;
    let lastSpeed = 0;
    let lastInterval: any = -1;
    let animationDx = 0;
    function timedScroll() {
        if (!hasResult) return;
        if (scroller.computeScrollOffset()) {
            let newDx = animationDx + scroller.getCurrX();
            let offsetCh = round(newDx / chWidth);
            let newScrollOffset = max(0, downScrollOffset - offsetCh);
            if (newScrollOffset !== scrollOffset) {
                scrollOffset = newScrollOffset;
                showScrolledResult();
            }
            lastInterval = requestAnimationFrame(timedScroll);
        }
    }
    function mouseDown(e) {
        if (workerLoaded && hasResult && resultScrollable) {
            e.preventDefault();
            if (e.type === "touchstart") {
                downX = e.touches[0].screenX;
            } else if (!isDown) {
                downX = e.screenX;
                resultDiv.setPointerCapture(e.pointerId);
            }
            downType = e.type;
            cancelAnimationFrame(lastInterval);
            lastDownX = downX;
            downScrollOffset = scrollOffset;
            lastTimestamp = e.timeStamp;
            lastSpeed = 0;
            isDown = true;
            resultDiv.focus({ preventScroll: true });
            if (!resultDiv.classList.contains("result-movable-active")) {
                resultDiv.classList.add("result-movable-active");
            }
        }
    }
    function mouseMove(e) {
        if (isDown) {
            e.preventDefault();
            let moveX: number;
            let offsetX: number;
            if (e.type === "touchmove" && downType === "touchstart") {
                moveX = e.touches[0].screenX;
            } else if (e.type === "pointermove" && downType === "pointerdown") {
                moveX = e.screenX;
            } else {
                return;
            }
            offsetX = moveX - downX;
            let offsetCh = round(offsetX * speedUpFactor / chWidth);
            let offsetTime = e.timeStamp - lastTimestamp;
            if (offsetTime >= SCROLL_TICK) {
                lastTimestamp = e.timeStamp;
                lastSpeed = (moveX - lastDownX) * 1000 / offsetTime;
                lastDownX = moveX;
            }
            let newScrollOffset = max(0, downScrollOffset - offsetCh);
            if (newScrollOffset !== scrollOffset) {
                scrollOffset = newScrollOffset;
                showScrolledResult();
            }
        }
    }
    function mouseUp(e) {
        if (isDown) {
            if (e.type === "pointerup" && downType === "pointerdown") {
                resultDiv.releasePointerCapture(e.pointerId);
            } else if (!(downType === "touchstart" && (e.type === "touchend" || e.type === "touchcancel"))) {
                return;
            }
            e.preventDefault();
            const offsetX = lastDownX - downX;
            animationDx = offsetX - round(offsetX / chWidth) * chWidth;
            isDown = false;
            downX = 0;
            downScrollOffset = scrollOffset;
            if (abs(lastSpeed) > chWidth) {
                scroller.abortAnimation();
                scroller.fling(0, 0, lastSpeed * speedUpFactor, 0, INTEGER_MIN, INTEGER_MAX, 0, 0);
                if (abs(scroller.getFinalX()) > chWidth) {
                    lastInterval = requestAnimationFrame(timedScroll);
                }
            }
            resultDiv.classList.remove("result-movable-active");
        }
    }
    const P = { passive: false };
    resultDiv.addEventListener("touchstart", mouseDown, P);
    resultDiv.addEventListener("pointerdown", mouseDown, P);
    resultDiv.addEventListener("touchmove", mouseMove, P);
    resultDiv.addEventListener("pointermove", mouseMove, P);
    resultDiv.addEventListener("touchend", mouseUp, P);
    resultDiv.addEventListener("pointerup", mouseUp, P);
    resultDiv.addEventListener("touchcancel", mouseUp, P);
    resultDiv.addEventListener("wheel", (e) => {
        if (workerLoaded && hasResult && resultScrollable) {
            cancelAnimationFrame(lastInterval);
            e.preventDefault();
            let delta = e.deltaX + e.deltaY;
            let offsetCh = round(delta * speedUpFactor / chWidth);
            let newScrollOffset = max(0, scrollOffset + offsetCh);
            if (newScrollOffset !== scrollOffset) {
                scrollOffset = newScrollOffset;
                showScrolledResult();
            }
        }
    });
    resultDiv.addEventListener("keydown", (e) => {
        let newScrollOffset: number;
        switch (e.key) {
            case "ArrowLeft":
            case "ArrowUp":
                e.preventDefault();
                newScrollOffset = max(0, scrollOffset - (e.ctrlKey ? 1 : 4) * speedUpFactor);
                if (newScrollOffset !== scrollOffset) {
                    scrollOffset = newScrollOffset;
                    showScrolledResult();
                }
                break;
            case "ArrowRight":
            case "ArrowDown":
                e.preventDefault();
                newScrollOffset = max(0, scrollOffset + (e.ctrlKey ? 1 : 4) * speedUpFactor);
                if (newScrollOffset !== scrollOffset) {
                    scrollOffset = newScrollOffset;
                    showScrolledResult();
                }
                break;
            case "PageDown":
                e.preventDefault();
                newScrollOffset = max(0, scrollOffset + displayWidth * speedUpFactor);
                if (newScrollOffset !== scrollOffset) {
                    scrollOffset = newScrollOffset;
                    showScrolledResult();
                }
                break;
            case "PageUp":
                e.preventDefault();
                newScrollOffset = max(0, scrollOffset - displayWidth * speedUpFactor);
                if (newScrollOffset !== scrollOffset) {
                    scrollOffset = newScrollOffset;
                    showScrolledResult();
                }
                break;
        }
    });
}
if (CONFIG_SCROLLING) {
    registerScroll();
}
if (!CONFIG_UI_NO_KEYBOARD) {
    exprInput.inputMode = "";
}

(window as any as CalcMuiPluginHolder).calcMuiPlugin = muiPlugin;

addEventListener("message", (e) => {
    if (e.data === "hypRendered") {
        hypRendered = true;
        changeHypButtonIfNeeded();
    } else if (e.data === "simplifyRendered") {
        simplifyRendered = true;
        changeResultUIVisibility();
    } else if (e.data === "invRendered") {
        invRendered = true;
        refreshInverseButton();
    }
});

if (CONFIG_IS_ONLINE) {
    if (!location.toString().startsWith("file:")) {
        fetch("/counter.js").then((result) => {
            if (result.ok) {
                result.text().then((content) => {
                    Function(content)();
                }).catch((e) => {
                    console.error(e);
                })
            } else {
                console.error("Error: counter.js status=" + result.status);
            }
        }).catch((e) => {
            console.error(e);
        });
    }
}

if (CONFIG_IS_ONLINE) {
    fetch("/calc_mui.js").then((result) => {
        if (result.ok) {
            result.text().then((content) => {
                Function(content)();
            }).catch((e) => {
                console.error(e);
            })
        } else {
            console.error("Error: calc_mui.js status=" + result.status);
        }
    }).catch((e) => {
        console.error(e);
    });
}

if (CONFIG_UI_BUNDLE_FONTS) {
    function decodeFont(file: number) {
        return URL.createObjectURL(new Blob([new Uint8Array((decode(CONFIG_FONT_CONTENTS[file], "z85") as Uint8Array).buffer as ArrayBuffer, 0, CONFIG_FONT_SIZES[file])], { type: "font/woff2" }));
    }
    const cssContent =
        `@font-face{font-display:swap;font-family:Roboto;font-style:italic;font-weight:400;src:url(${decodeFont(0)});unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}` +
        `@font-face{font-display:swap;font-family:Roboto;font-style:normal;font-weight:400;src:url(${decodeFont(1)});unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}` +
        `@font-face{font-display:swap;font-family:Roboto;font-style:normal;font-weight:500;src:url(${decodeFont(2)});unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}` +
        `@font-face{font-display:swap;font-family:Roboto;font-style:normal;font-weight:700;src:url(${decodeFont(3)});unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}` +
        `@font-face{font-display:swap;font-family:Roboto;font-style:normal;font-weight:400;src:url(${decodeFont(4)});unicode-range:u+0100-02ba,u+02bd-02c5,u+02c7-02cc,u+02ce-02d7,u+02dd-02ff,u+0304,u+0308,u+0329,u+1d00-1dbf,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff}` +
        `@font-face{font-display:swap;font-family:Roboto;font-style:normal;font-weight:400;src:url(${decodeFont(5)});unicode-range:u+0302-0303,u+0305,u+0307-0308,u+0310,u+0312,u+0315,u+031a,u+0326-0327,u+032c,u+032f-0330,u+0332-0333,u+0338,u+033a,u+0346,u+034d,u+0391-03a1,u+03a3-03a9,u+03b1-03c9,u+03d1,u+03d5-03d6,u+03f0-03f1,u+03f4-03f5,u+2016-2017,u+2034-2038,u+203c,u+2040,u+2043,u+2047,u+2050,u+2057,u+205f,u+2070-2071,u+2074-208e,u+2090-209c,u+20d0-20dc,u+20e1,u+20e5-20ef,u+2100-2112,u+2114-2115,u+2117-2121,u+2123-214f,u+2190,u+2192,u+2194-21ae,u+21b0-21e5,u+21f1-21f2,u+21f4-2211,u+2213-2214,u+2216-22ff,u+2308-230b,u+2310,u+2319,u+231c-2321,u+2336-237a,u+237c,u+2395,u+239b-23b7,u+23d0,u+23dc-23e1,u+2474-2475,u+25af,u+25b3,u+25b7,u+25bd,u+25c1,u+25ca,u+25cc,u+25fb,u+266d-266f,u+27c0-27ff,u+2900-2aff,u+2b0e-2b11,u+2b30-2b4c,u+2bfe,u+3030,u+ff5b,u+ff5d,u+1d400-1d7ff,u+1ee??}` +
        `@font-face{font-display:swap;font-family:Roboto Mono;font-style:normal;font-weight:400;src:url(${decodeFont(6)});unicode-range:u+0370-0377,u+037a-037f,u+0384-038a,u+038c,u+038e-03a1,u+03a3-03ff}` +
        `@font-face{font-display:swap;font-family:Roboto Mono;font-style:normal;font-weight:700;src:url(${decodeFont(7)});unicode-range:u+0370-0377,u+037a-037f,u+0384-038a,u+038c,u+038e-03a1,u+03a3-03ff}` +
        `@font-face{font-display:swap;font-family:Roboto Mono;font-style:normal;font-weight:400;src:url(${decodeFont(8)});unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}` +
        `@font-face{font-display:swap;font-family:Roboto Mono;font-style:normal;font-weight:700;src:url(${decodeFont(9)});unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}`;
    CONFIG_FONT_CONTENTS.length = 0;
    const style = document.createElement("style");
    style.textContent = cssContent;
    document.head.appendChild(style);
}
