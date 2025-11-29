/*
 * Copyright 2025 lll69
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

import { CalcMuiPlugin, CalcMuiPluginHolder } from "./calc_mui_types";
import { CreateURRequest, ToNiceStringRequest, ToStringRequest, ToStringResultSuccess, WorkerResult } from "./worker_types";

const INTEGER_MAX = 2147483647;
const INITIAL_PREC = 32;
const PREC_INCREMENT = 128;
const INCREMENT_THRESHOLD = 64;
const MAX_INITIAL_PREC = INITIAL_PREC + PREC_INCREMENT;
const ENABLE_VARIABLES = false;
let displayWidth = 25;
let chWidth = 0;
let degreeMode = false;
let isInvert = false;
const multiplyChar = "*";
const divideChar = "/";

const D = document;
const M = Math;
const getElementById: typeof D.getElementById = D.getElementById.bind(D);
const min = M.min;
const max = M.max;
const abs = M.abs;
const floor = M.floor;
const round = M.round;
const iSetInterval = setInterval;
const iClearInterval = clearInterval;
const createObjectURL = URL.createObjectURL;
// @ts-ignore
const replaceStr: (s: string, a: string, b: string) => string = "".replaceAll ? (s, a, b) => s.replaceAll(a, b) : (s, a, b) => s.split(a).join(b);

const calculatorDiv = getElementById("calculator") as HTMLElement;
const exprInput = getElementById("expression") as HTMLInputElement;
const fracOutput = getElementById("frac_output") as HTMLElement;
const resultDiv = getElementById("result_div") as HTMLElement;
const resultBoldText = getElementById("result_bold") as HTMLElement;
const resultNormalText = getElementById("result_normal") as HTMLElement;
const buttonInv = getElementById("toggle_inv") as HTMLElement;
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
    getElementById("fun_sin") as HTMLElement,
    getElementById("fun_cos") as HTMLElement,
    getElementById("fun_tan") as HTMLElement,
    getElementById("fun_ln") as HTMLElement,
    getElementById("fun_log") as HTMLElement
];
const inverseButtons = [
    getElementById("fun_arcsin") as HTMLElement,
    getElementById("fun_arccos") as HTMLElement,
    getElementById("fun_arctan") as HTMLElement,
    getElementById("fun_exp") as HTMLElement,
    getElementById("fun_10pow") as HTMLElement
];
const copyButton = getElementById("copy_result") as HTMLElement;
const saveButton = getElementById("save_result") as HTMLElement;
const simplifyButton = getElementById("show_simplify") as HTMLElement;
const gridOps = getElementById("grid_ops") as HTMLElement;
const gridVar = getElementById("grid_var") as HTMLElement;
const loadingElement = getElementById("loading") as HTMLElement;
let workerContent: string | null = null;
let workerLoaded = false;
let workerBusy = false;
let needEnterNewExpr = false;
let hasResult = false;
let hasError = false;
let isResultExact = false;
let resultScrollable = false;
let worker: Worker | null = null;
let muiPlugin: CalcMuiPlugin | undefined = undefined;
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
function copyText(str: string) {
    let element = D.createElement("input");
    element.style.opacity = "0";
    element.value = str;
    D.body.appendChild(element);
    element.select();
    D.execCommand("copy");
    element.remove();
}
function changeResultUIVisibility() {
    copyButton.hidden = !hasResult;
    saveButton.hidden = !hasResult;
    simplifyButton.hidden = !(hasResult && isResultExact);
}
function showScrolledResult(copyCallback?: (mightExact: boolean, str: string) => void) {
    if (!workerLoaded || !hasResult) return;
    const resultLength = resultString.endsWith(".") ? (resultString.length - 1) : resultString.length;
    const shouldEnableSelect = (digitMax !== INTEGER_MAX && resultLength <= displayWidth);
    resultScrollable = !shouldEnableSelect;
    if (shouldEnableSelect) {
        if (copyCallback) {
            copyCallback(true, digitMax === 0 ? resultString.substring(0, resultString.length - 1) : resultString);
            return;
        }
        scrollOffset = 0;
        if (digitMax === 0) {
            resultBoldText.innerHTML = resultString.substring(0, resultString.length - 1);
            resultNormalText.innerHTML = "";
        } else {
            resultBoldText.innerHTML = resultString;
            resultNormalText.innerHTML = "";
        }
        resultDiv.classList.remove("result-movable");
        return;
    }
    if (pointIndex === -1) {
        pointIndex = resultString.indexOf(".");
        if (pointIndex === -1) {
            pointIndex = resultString.length;
        }
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
                        if (digitMax === INTEGER_MAX) {
                            copyCallback(false, scientific);
                        } else {
                            copyCallback(true, digitMax === 0 ? resultString.substring(0, resultString.length - 1) : resultString);
                        }
                        return;
                    }
                    resultBoldText.innerHTML = scientific;
                    resultNormalText.innerHTML = "";
                    usedScientific = true;
                }
            }
            if (!usedScientific) {
                if (copyCallback) {
                    if (digitMax === INTEGER_MAX) {
                        copyCallback(false, resultString.substring(0, rightIndex - newOffsetStrLength) + "E" + newOffsetStr);
                    } else {
                        copyCallback(true, digitMax === 0 ? resultString.substring(0, resultString.length - 1) : resultString);
                    }
                    return;
                }
                resultBoldText.innerHTML = resultString.substring(scrollOffset, rightIndex - newOffsetStrLength);
                resultNormalText.innerHTML = newOffsetStrLength > 0 ? "E" + newOffsetStr : "";
            }
        } else {
            if (copyCallback) {
                if (digitMax === INTEGER_MAX) {
                    copyCallback(false, resultString.substring(0, rightIndex - newOffsetStrLength) + "E" + newOffsetStr);
                } else {
                    copyCallback(true, digitMax === 0 ? resultString.substring(0, resultString.length - 1) : resultString);
                }
                return;
            }
            resultBoldText.innerHTML = "..." + resultString.substring(scrollOffset + 3, rightIndex - newOffsetStrLength);
            resultNormalText.innerHTML = newOffsetStrLength > 0 ? "E" + newOffsetStr : "";
        }
    } else if (scrollOffset === 0 || scrollOffset + 4 <= pointIndex) {
        rightIndex = min(scrollOffset + displayWidth, resultString.length);
        if (copyCallback) {
            if (digitMax === INTEGER_MAX) {
                copyCallback(false, resultString.substring(0, rightIndex));
            } else {
                copyCallback(true, digitMax === 0 ? resultString.substring(0, resultString.length - 1) : resultString);
            }
            return;
        }
        if (scrollOffset === 0) {
            resultBoldText.innerHTML = resultString.substring(scrollOffset, rightIndex);
        } else {
            resultBoldText.innerHTML = "..." + resultString.substring(scrollOffset + 3, rightIndex);
        }
        resultNormalText.innerHTML = "";
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
            resultBoldText.innerHTML = "Calculating...";
            precisionNeeded = max(scrollOffset - pointIndex + newOffsetStrLength * 2, precisionCurrent + PREC_INCREMENT * min(1024, 1 + floor(scrollOffset / 1600)));
            calculateHigherPrecision();
        } else {
            if (copyCallback) {
                copyCallback(false, resultString.substring(0, rightIndex - newOffsetStrLength));
                return;
            }
            resultBoldText.innerHTML = "..." + resultString.substring(scrollOffset + 3, rightIndex - newOffsetStrLength);
        }
        resultNormalText.innerHTML = "E-" + newOffsetStr;
        if (scrollOffset > resultLength - displayWidth + newOffsetStrLength - INCREMENT_THRESHOLD) {
            let newResultLength = resultLength;
            precisionNeeded = precisionCurrent;
            const precIncr = PREC_INCREMENT * min(1024, 1 + floor(scrollOffset / 1600));
            while (scrollOffset > newResultLength - displayWidth + newOffsetStrLength - INCREMENT_THRESHOLD) {
                precisionNeeded += precIncr;
                newResultLength += precIncr;
            }
            precisionNeeded = min(digitMax, precisionNeeded);
            calculateHigherPrecision();
        }
    }
}
function scrollToErrorIfNeeded(e: string, str: string) {
    if (e.startsWith(str)) {
        resultDiv.scrollLeft = chWidth * str.length;
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
                clearResult();
                focusExpression();
                if (navigator.userAgent.indexOf("Firefox") >= 0) {
                    loadingElement.innerText = "When performing exponentiation and factorial calculations, Chrome/Edge may be faster than Firefox and can compute more digits.";
                    loadingElement.hidden = false;
                }
            }
            break;
        case "createUR":
            if (msg.success) {
                hasResult = true;
                isResultExact = msg.exactlyDisplayable;
                hasError = false;
                digitMax = msg.digitsRequired;
                precisionNeeded = digitMax !== INTEGER_MAX ? MAX_INITIAL_PREC : INITIAL_PREC;
                precisionCurrent = -1;
                pointIndex = -1;
                workerBusy = false;
                calculateHigherPrecision();
            } else {
                hasResult = false;
                hasError = true;
                workerBusy = false;
                buttonCalc.innerText = "=";
                resultDiv.classList.remove("result-movable");
                resultBoldText.innerText = msg.error;
                resultNormalText.innerHTML = "";
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
                buttonCalc.innerText = "=";
                if (msg.error) {
                    hasResult = false;
                    hasError = true;
                    resultDiv.classList.remove("result-movable");
                    resultBoldText.innerText = msg.error;
                    resultNormalText.innerHTML = "";
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
            if (msg.uid === lastCalculateUid) {
                const text = msg.error || msg.result;
                let shown = false;
                if (muiPlugin) {
                    try {
                        muiPlugin.showAlert("Simplified Result", text!);
                        shown = true;
                    } catch (e) {
                        console.error(e);
                    }
                }
                if (!shown) {
                    alert("Simplified Result: " + text);
                }
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
    worker = new Worker(createObjectURL(new Blob([workerContent!], { type: "text/javascript" })));
    worker.onmessage = onWorkerMessage;
    worker.onerror = onWorkerError;
    workerBusy = false;
    hasResult = false;
    hasError = false;
}
function initWorker(workerJs: string) {
    workerContent = workerJs;
    reInitWorker();
}
function showLoadAnimation() {
    loadAnimationIndex = (loadAnimationIndex + 1) % 4;
    resultBoldText.innerHTML = "Loading..." + "/-\\|"[loadAnimationIndex];
}
function onLoadingError(e: string) {
    iClearInterval(loadAnimationInterval);
    loadingElement.innerText = e;
    exprInput.readOnly = true;
    exprInput.value = e;
    resultDiv.classList.remove("result-movable");
    resultBoldText.innerHTML = "Try refreshing the page.";
    resultNormalText.innerHTML = "";
    Array.prototype.forEach.call(calculatorDiv.getElementsByTagName("button"), (e) => {
        e.disabled = true;
    });
}
function clearResult() {
    resultDiv.classList.remove("result-movable");
    resultBoldText.innerHTML = "";
    resultNormalText.innerHTML = "";
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
loadAnimationInterval = iSetInterval(showLoadAnimation, 100);

fetch("calc_worker.js").then((result) => {
    if (result.ok) {
        result.text().then((workerJs) => {
            iClearInterval(loadAnimationInterval);
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
    if (expr.indexOf("pi") >= 0) {
        expr = replaceStr(expr, "pi", "\u03C0");
        modified = true;
    }
    if (expr.indexOf("**") >= 0) {
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
function calculateResult() {
    if (!workerLoaded) return;
    if (workerBusy) {
        reInitWorker();
        buttonCalc.innerText = "=";
        return;
    }
    clearResult();
    onCalculatorResize();
    preprocessExpr();
    needEnterNewExpr = true;
    buttonCalc.innerText = "STOP";
    worker!.postMessage({ type: "removeUR", id: lastCalculateId });
    lastCalculateId = (lastCalculateId + 1) | 0;
    changeResultUIVisibility();
    worker!.postMessage({
        type: "createUR",
        id: lastCalculateId,
        uid: lastCalculateId,
        expr: exprInput.value,
        degreeMode: degreeMode
    } as CreateURRequest);
    workerBusy = true;
}
function focusExpression() {
    if (workerLoaded) {
        exprInput.focus();
    }
}
function refreshInverseButton() {
    buttonInv.title = isInvert ? "Hide inverse functions" : "Show inverse functions";
}
function inverseClick() {
    if (!workerLoaded) return;
    isInvert = !isInvert;
    let i: number;
    for (i = 0; i < normalButtons.length; i++) {
        if (isInvert) {
            normalButtons[i].classList.add("op-hide");
        } else {
            normalButtons[i].classList.remove("op-hide");
        }
    }
    for (i = 0; i < inverseButtons.length; i++) {
        if (isInvert) {
            inverseButtons[i].classList.remove("op-hide");
        } else {
            inverseButtons[i].classList.add("op-hide");
        }
    }
    refreshInverseButton();
    focusExpression();
}
function refreshModeButton() {
    buttonMode.title = degreeMode ? "Currently in degree mode" : "Currently in radian mode";
    buttonMode.innerHTML = degreeMode ? "DEG" : "RAD";
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
        } else if (op === "*" && prevChar === '*') {
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
buttonInv.addEventListener("click", inverseClick);
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
getElementById("op_pow")!.addEventListener("click", () => {
    appendOperator("^");
    focusExpression();
});
getElementById("op_fact")!.addEventListener("click", () => {
    appendOperator("!");
    focusExpression();
});
getElementById("const_pi")!.addEventListener("click", () => {
    appendConst("\u03C0");
    focusExpression();
});
getElementById("const_e")!.addEventListener("click", () => {
    appendConst("e");
    focusExpression();
});
getElementById("op_lparen")!.addEventListener("click", () => {
    appendParen("(");
    focusExpression();
});
getElementById("op_rparen")!.addEventListener("click", () => {
    appendParen(")");
    focusExpression();
});
getElementById("op_sqrt")!.addEventListener("click", () => {
    appendFunction("sqrt");
    focusExpression();
});
registerFunction("sin");
registerFunction("cos");
registerFunction("tan");
registerFunction("arcsin");
registerFunction("arccos");
registerFunction("arctan");
registerFunction("ln");
registerFunction("log");
registerFunction("exp");
getElementById("fun_10pow")!.addEventListener("click", () => {
    insertStr("10^");
    focusExpression();
});
getElementById("fun_percent")!.addEventListener("click", () => {
    insertStr("/100");
    focusExpression();
});
getElementById("op_cbrt")!.addEventListener("click", () => {
    insertStr("^(1/3)");
    focusExpression();
});
getElementById("but_del")!.addEventListener("click", () => {
    onDel();
    focusExpression();
});
getElementById("but_clr")!.addEventListener("click", () => {
    onClear();
    focusExpression();
});
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
            if (appendParen(key, true)) e.preventDefault();
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
copyButton.addEventListener("click", () => {
    if (digitMax === 0 && precisionCurrent === 0) {
        copyText(resultString.substring(0, resultString.length - 1));
        alert("Exact result has been copied (length:" + (resultString.length - 1) + ")");
    } else if (digitMax !== INTEGER_MAX && precisionCurrent >= digitMax) {
        copyText(resultString);
        alert("Exact result has been copied (length:" + (resultString.length) + ")");
    } else {
        showScrolledResult((mightExact, str) => {
            copyText(str);
            if (mightExact && (digitMax === 0 || (digitMax !== INTEGER_MAX && precisionCurrent >= digitMax))) {
                alert("Exact result has been copied (length:" + (str.length) + ")");
            } else {
                alert("TRUNCATED result has been copied (length:" + (str.length) + ")");
            }
        });
    }
});
saveButton.addEventListener("click", () => {
    let content;
    if (digitMax === 0 && precisionCurrent === 0) {
        content = resultString.substring(0, resultString.length - 1);
    } else if (digitMax !== INTEGER_MAX && precisionCurrent >= digitMax) {
        content = resultString;
    }
    if (content) {
        let url = createObjectURL(new Blob([content], { type: "text/plain" }));
        let element = D.createElement("a");
        element.href = url;
        element.download = "output_exact.txt";
        D.body.appendChild(element);
        element.click();
        element.remove();
    } else {
        showScrolledResult((mightExact, str) => {
            let url = createObjectURL(new Blob([str], { type: "text/plain" }));
            let element = D.createElement("a");
            element.href = url;
            element.download = (mightExact && (digitMax === 0 || (digitMax !== INTEGER_MAX && precisionCurrent >= digitMax))) ? "output_exact.txt" : "output_truncated.txt";
            D.body.appendChild(element);
            element.click();
            element.remove();
        });
    }
});
simplifyButton.addEventListener("click", () => {
    if (hasResult && isResultExact) {
        worker!.postMessage({
            type: "toNiceString",
            id: lastCalculateId,
            uid: ++lastCalculateUid,
        } as ToNiceStringRequest);
    }
});
if (!ENABLE_VARIABLES) {
    let varButton = getElementById("but_var") as HTMLButtonElement;
    varButton.disabled = true;
    varButton.innerHTML = "";
}
getElementById("but_var")!.addEventListener("click", () => {
    if (!ENABLE_VARIABLES || !workerLoaded) return;
    gridOps.classList.add("grid-hide");
    gridVar.classList.remove("grid-hide");
    focusExpression();
});
getElementById("var_close")!.addEventListener("click", () => {
    if (!workerLoaded) return;
    gridOps.classList.remove("grid-hide");
    gridVar.classList.add("grid-hide");
    focusExpression();
});
function registerVariable(name) {
    getElementById("var_in_" + name)!.addEventListener("click", () => {
        if (!ENABLE_VARIABLES || !workerLoaded) return;
        throw new Error("Not yet implemented");
    });
    getElementById("var_out_" + name)!.addEventListener("click", () => {
        if (!ENABLE_VARIABLES || !workerLoaded) return;
        appendConst(name);
        focusExpression();
    });
}
registerVariable("x");
registerVariable("y");
registerVariable("z");
function disallowScroll(element: HTMLElement) {
    let eLastScrollLeft = 0;
    let eHaveFocus = false;
    element.addEventListener("scroll", () => {
        let lastScrollLeft = eLastScrollLeft;
        eLastScrollLeft = element.scrollLeft;
        if (element.scrollLeft === 0 && !eHaveFocus && lastScrollLeft !== 0) {
            element.scrollLeft = lastScrollLeft;
        }
    })
    element.addEventListener("focus", () => {
        eHaveFocus = true;
        if (element === exprInput) {
            needEnterNewExpr = false;
        }
    });
    element.addEventListener("blur", () => {
        eHaveFocus = false;
    });
}
disallowScroll(exprInput);
disallowScroll(fracOutput);
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
    function timedScroll() {
        let absSpeed = abs(lastSpeed);
        if (absSpeed * 2 > chWidth && absSpeed !== Infinity) {
            lastSpeed *= 0.8333333333333334;
        } else {
            iClearInterval(lastInterval);
        }
        downX += lastSpeed;
        let offsetCh = round(downX / chWidth);
        let newScrollOffset = max(0, downScrollOffset - offsetCh);
        if (newScrollOffset !== scrollOffset) {
            scrollOffset = newScrollOffset;
            showScrolledResult();
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
            iClearInterval(lastInterval);
            lastDownX = downX;
            downScrollOffset = scrollOffset;
            lastTimestamp = e.timeStamp;
            lastSpeed = 0;
            isDown = true;
            resultDiv.focus({ preventScroll: true });
        }
    }
    function mouseMove(e) {
        if (isDown) {
            e.preventDefault();
            let moveX;
            let offsetX;
            if (e.type === "touchmove" && downType === "touchstart") {
                moveX = e.touches[0].screenX;
            } else if (e.type === "pointermove" && downType === "pointerdown") {
                moveX = e.screenX;
            } else {
                return;
            }
            offsetX = moveX - downX;
            let offsetCh = round(offsetX / chWidth);
            let offsetTime = e.timeStamp - lastTimestamp;
            if (offsetTime >= SCROLL_TICK) {
                lastTimestamp = e.timeStamp;
                lastSpeed = (moveX - lastDownX) * SCROLL_TICK / offsetTime;
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
            isDown = false;
            downX = 0;
            downScrollOffset = scrollOffset;
            if (abs(lastSpeed) > chWidth) {
                lastInterval = iSetInterval(timedScroll, SCROLL_TICK);
            }
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
            iClearInterval(lastInterval);
            e.preventDefault();
            let delta = e.deltaX + e.deltaY;
            let offsetCh = round(delta / chWidth);
            let newScrollOffset = max(0, scrollOffset + offsetCh);
            if (newScrollOffset !== scrollOffset) {
                scrollOffset = newScrollOffset;
                showScrolledResult();
            }
        }
    });
    resultDiv.addEventListener("keydown", (e) => {
        let newScrollOffset;
        switch (e.key) {
            case "ArrowLeft":
            case "ArrowUp":
                e.preventDefault();
                newScrollOffset = max(0, scrollOffset - (e.ctrlKey ? 1 : 4));
                if (newScrollOffset !== scrollOffset) {
                    scrollOffset = newScrollOffset;
                    showScrolledResult();
                }
                break;
            case "ArrowRight":
            case "ArrowDown":
                e.preventDefault();
                newScrollOffset = max(0, scrollOffset + (e.ctrlKey ? 1 : 4));
                if (newScrollOffset !== scrollOffset) {
                    scrollOffset = newScrollOffset;
                    showScrolledResult();
                }
                break;
            case "PageDown":
                e.preventDefault();
                newScrollOffset = max(0, scrollOffset + displayWidth);
                if (newScrollOffset !== scrollOffset) {
                    scrollOffset = newScrollOffset;
                    showScrolledResult();
                }
                break;
            case "PageUp":
                e.preventDefault();
                newScrollOffset = max(0, scrollOffset - displayWidth);
                if (newScrollOffset !== scrollOffset) {
                    scrollOffset = newScrollOffset;
                    showScrolledResult();
                }
                break;
        }
    });
}
registerScroll();

fetch("calc_mui.js").then((result) => {
    if (result.ok) {
        result.text().then((workerJs) => {
            Function(workerJs)();
            muiPlugin = (window as any as CalcMuiPluginHolder).calcMuiPlugin;
        }).catch((e) => {
            console.error(e);
        })
    } else {
        console.error("Error: calc_mui.js status=" + result.status);
    }
}).catch((e) => {
    console.error(e);
});

onmessage = (e) => {
    if (e.data === "calcMuiPlugin") {
        muiPlugin = (window as any as CalcMuiPluginHolder).calcMuiPlugin;
    }
}
