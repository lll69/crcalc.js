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

(function () {
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
    const calculatorDiv = document.getElementById("calculator");
    const exprInput = document.getElementById("expression");
    const fracOutput = document.getElementById("frac_output");
    const resultDiv = document.getElementById("result_div");
    const resultBoldText = document.getElementById("result_bold");
    const resultNormalText = document.getElementById("result_normal");
    const buttonInv = document.getElementById("toggle_inv");
    const buttonCalc = document.getElementById("but_eq");
    const buttonMode = document.getElementById("toggle_mode");
    const measureDiv = document.getElementById("measure_4ch");
    const numButtons = [
        document.getElementById("num_0"),
        document.getElementById("num_1"),
        document.getElementById("num_2"),
        document.getElementById("num_3"),
        document.getElementById("num_4"),
        document.getElementById("num_5"),
        document.getElementById("num_6"),
        document.getElementById("num_7"),
        document.getElementById("num_8"),
        document.getElementById("num_9")
    ];
    const normalButtons = [
        document.getElementById("fun_sin"),
        document.getElementById("fun_cos"),
        document.getElementById("fun_tan"),
        document.getElementById("fun_ln"),
        document.getElementById("fun_log")
    ];
    const inverseButtons = [
        document.getElementById("fun_arcsin"),
        document.getElementById("fun_arccos"),
        document.getElementById("fun_arctan"),
        document.getElementById("fun_exp"),
        document.getElementById("fun_10pow")
    ];
    const copyButton = document.getElementById("copy_result");
    const saveButton = document.getElementById("save_result");
    const gridOps = document.getElementById("grid_ops");
    const gridVar = document.getElementById("grid_var");
    const loadingElement = document.getElementById("loading");
    let workerContent = null;
    let workerLoaded = false;
    let workerBusy = false;
    let needEnterNewExpr = false;
    let hasResult = false;
    let hasError = false;
    let resultScrollable = false;
    let worker = null;
    let resultString = "";
    let digitMax = INTEGER_MAX;
    let precisionNeeded = INITIAL_PREC;
    let precisionCurrent = -1;
    let pointIndex = -1;
    let scrollOffset = 0;
    let lastCalculateId = 1;
    let lastCalculateUid = 1;
    function copyText(str) {
        let element = document.createElement("input");
        element.style.opacity = 0;
        element.value = str;
        document.body.appendChild(element);
        element.select();
        document.execCommand("copy");
        element.remove();
    }
    function changeResultUIVisibility() {
        copyButton.hidden = !hasResult;
        saveButton.hidden = !hasResult;
    }
    function showScrolledResult(copyCallback) {
        if (!workerLoaded || !hasResult) return;
        const resultLength = resultString.endsWith(".") ? (resultString.length - 1) : resultString.length;
        const shouldEnableSelect = (digitMax != INTEGER_MAX && resultLength <= displayWidth);
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
                scrollOffset = Math.min(scrollOffset, pointIndex - displayWidth);
            } else if (digitMax !== INTEGER_MAX) {
                if (digitMax + 4 >= displayWidth) {
                    scrollOffset = Math.min(scrollOffset, pointIndex + 1 + digitMax - displayWidth + String(digitMax).length + 2);
                } else {
                    scrollOffset = Math.min(scrollOffset, pointIndex + 1 + digitMax - displayWidth);
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
            rightIndex = Math.min(scrollOffset + displayWidth, resultString.length);
            let offsetDigits;
            let offsetStrLength;
            let newOffsetDigits;
            let newOffsetStr;
            let newOffsetStrLength;
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
                        let scientific;
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
            rightIndex = Math.min(scrollOffset + displayWidth, resultString.length);
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
            newOffsetStrLength;
            if (scrollOffset > resultLength - displayWidth + newOffsetStrLength) {
                if (copyCallback) {
                    copyCallback(false, resultString);
                    return;
                }
                resultBoldText.innerHTML = "Calculating...";
                precisionNeeded = precisionCurrent + PREC_INCREMENT * Math.min(1024, 1 + Math.floor(scrollOffset / 1600));
                calculateHigherPrecision();
            } else {
                if (copyCallback) {
                    copyCallback(true, resultString.substring(0, rightIndex - newOffsetStrLength));
                    return;
                }
                resultBoldText.innerHTML = "..." + resultString.substring(scrollOffset + 3, rightIndex - newOffsetStrLength);
            }
            resultNormalText.innerHTML = "E-" + newOffsetStr;
            if (scrollOffset > resultLength - displayWidth + newOffsetStrLength - INCREMENT_THRESHOLD) {
                let newResultLength = resultLength;
                precisionNeeded = precisionCurrent;
                const precIncr = PREC_INCREMENT * Math.min(1024, 1 + Math.floor(scrollOffset / 1600));
                while (scrollOffset > newResultLength - displayWidth + newOffsetStrLength - INCREMENT_THRESHOLD) {
                    precisionNeeded += precIncr;
                    newResultLength += precIncr;
                }
                precisionNeeded = Math.min(digitMax, precisionNeeded);
                calculateHigherPrecision();
            }
        }
    }
    function onWorkerMessage(e) {
        const msg = e.data;
        switch (msg.type) {
            case "init":
                workerLoaded = true;
                for (let i = 0, arr = document.getElementsByClassName("intro"); i < arr.length; i++) {
                    arr[i].hidden = true;
                }
                document.getElementById("loading-style").remove();
                focusExpression();
                if (navigator.userAgent.indexOf("Firefox") >= 0) {
                    loadingElement.innerText = "When performing exponentiation and factorial calculations, Chrome/Edge may be faster than Firefox and can compute more digits.";
                    loadingElement.hidden = false;
                }
                break;
            case "createUR":
                if (msg.success) {
                    hasResult = true;
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
                        exprInput.focus();
                        let start = Number(match[1]);
                        exprInput.selectionStart = start;
                        exprInput.selectionEnd = Number(match[2]);
                        exprInput.scrollLeft = chWidth * (start > 0 ? start - 1 : start);
                    }
                    match = errString.match(/at position \((\d+)\)/);
                    if (match) {
                        exprInput.focus();
                        let start = Number(match[1]);
                        exprInput.selectionStart = start;
                        exprInput.selectionEnd = start + 1;
                        exprInput.scrollLeft = chWidth * (start > 0 ? start - 1 : start);
                    }
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
                        let result = msg.result;
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
        }
    }
    function onWorkerError(e) {
        console.error(e);
        loadingElement.innerText = "Worker Error: " + e.message;
        loadingElement.hidden = false;
    }
    function reInitWorker() {
        if (worker) {
            worker.terminate();
        }
        worker = new Worker(URL.createObjectURL(new Blob([workerContent], { type: "text/javascript" })));
        worker.onmessage = onWorkerMessage;
        worker.onerror = onWorkerError;
        workerBusy = false;
        hasResult = false;
        hasError = false;
    }
    function initWorker(crJs, workerJs) {
        let crUrl = URL.createObjectURL(new Blob([crJs], { type: "text/javascript" }));
        workerContent = 'let crJsUrl="' + crUrl + '";' + workerJs;
        reInitWorker();
    }
    function onLoadingError(e) {
        loadingElement.innerText = e;
        exprInput.readOnly = true;
        exprInput.value = e;
        resultDiv.classList.remove("result-movable");
        resultBoldText.innerHTML = "Try refreshing the page.";
        resultNormalText.innerHTML = "";
        Array.prototype.forEach.call(calculatorDiv.getElementsByTagName("button"), function (e) {
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
    fetch("cr.min.js").then(function (result) {
        if (result.ok) {
            result.text().then(function (crJs) {
                fetch("calc_worker.js").then(function (result) {
                    if (result.ok) {
                        result.text().then(function (workerJs) {
                            initWorker(crJs, workerJs);
                        }).catch(function (e) {
                            console.error(e);
                            onLoadingError("Error: calc_worker.js " + e);
                        })
                    } else {
                        onLoadingError("Error: calc_worker.js status=" + result.status);
                    }
                }).catch(function (e) {
                    console.error(e);
                    onLoadingError("Error: calc_worker.js " + e);
                })
            }).catch(function (e) {
                console.error(e);
                onLoadingError("Error: cr.min.js " + e);
            })
        } else {
            onLoadingError("Error: cr.min.js status=" + result.status);
        }
    }).catch(function (e) {
        console.error(e);
        onLoadingError("Error: cr.min.js " + e);
    });
    function calculateHigherPrecision() {
        if (!workerLoaded || !hasResult || workerBusy) return;
        let precision = Math.min(digitMax, precisionNeeded);
        if (precision <= precisionCurrent) return;
        workerBusy = true;
        buttonCalc.innerText = "STOP";
        worker.postMessage({
            type: "toStringTruncated",
            id: lastCalculateId,
            uid: ++lastCalculateUid,
            prec: precision
        });
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
        needEnterNewExpr = true;
        buttonCalc.innerText = "STOP";
        worker.postMessage({ type: "removeUR", id: lastCalculateId });
        lastCalculateId = (lastCalculateId + 1) | 0;
        changeResultUIVisibility();
        worker.postMessage({
            type: "createUR",
            id: lastCalculateId,
            uid: lastCalculateId,
            expr: exprInput.value,
            degreeMode: degreeMode
        });
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
        let i;
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
            calculateResult();
        }
        focusExpression();
    }
    function insertStr(str) {
        if (!workerLoaded) return;
        const currentExpr = exprInput.value;
        const selectionStart = exprInput.selectionStart;
        const selectionEnd = exprInput.selectionEnd;
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
    function appendDigit(n, fromInput) {
        if (!workerLoaded) return;
        checkEnterNewExpr();
        const currentExpr = exprInput.value;
        const selectionStart = exprInput.selectionStart;
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
    function appendPoint(fromInput) {
        if (!workerLoaded) return true;
        checkEnterNewExpr();
        const currentExpr = exprInput.value;
        const selectionStart = exprInput.selectionStart;
        const selectionEnd = exprInput.selectionEnd;
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
    function appendParen(p, fromInput) {
        if (!workerLoaded) return;
        if (p === "(") {
            const currentExpr = exprInput.value;
            const selectionStart = exprInput.selectionStart;
            const selectionEnd = exprInput.selectionEnd;
            let needMultiply = false;
            if (selectionStart > 0) {
                const prevChar = currentExpr[selectionStart - 1];
                if ("0123456789.)!\u03C0xyze".indexOf(prevChar) >= 0) {
                    needMultiply = true;
                }
            }
            if (selectionStart != selectionEnd) {
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
    function appendOperator(op, fromInput) {
        if (!workerLoaded) return;
        if (op === "!") {
            if (!fromInput) {
                insertStr(op);
            }
            return false;
        }
        const currentExpr = exprInput.value;
        const selectionStart = exprInput.selectionStart;
        if (selectionStart > 0) {
            const prevChar = currentExpr[selectionStart - 1];
            if (op === "-") {
                if (prevChar === "+") {
                    exprInput.selectionStart = selectionStart - 1;
                } else if ("-\u00D7\u00F7*/^".indexOf(prevChar) >= 0) {
                    insertStr("(" + op);
                    return true;
                }
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
    function appendConst(c) {
        if (!workerLoaded) return;
        checkEnterNewExpr();
        const currentExpr = exprInput.value;
        const selectionStart = exprInput.selectionStart;
        if (selectionStart > 0) {
            const prevChar = currentExpr.charAt(selectionStart - 1);
            if ("0123456789.)!\u03C0xyze".indexOf(prevChar) >= 0) {
                insertStr(multiplyChar + c);
                return;
            }
        }
        insertStr(c);
    }
    function appendFunction(fn) {
        if (!workerLoaded) return;
        const currentExpr = exprInput.value;
        const selectionStart = exprInput.selectionStart;
        if (selectionStart > 0) {
            const prevChar = currentExpr.charAt(selectionStart - 1);
            if ("0123456789.)!\u03C0xyze".indexOf(prevChar) >= 0) {
                insertStr(multiplyChar + fn + "(");
                return;
            }
        }
        insertStr(fn + "(");
    }
    function registerFunction(fun) {
        document.getElementById("fun_" + fun).addEventListener("click", function () {
            appendFunction(fun);
            focusExpression();
        });
    }
    function onDel(fromInput) {
        if (!workerLoaded) return;
        if (fromInput) return false;
        const selectionStart = exprInput.selectionStart;
        const selectionEnd = exprInput.selectionEnd;
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
    numButtons.forEach(function (button, idx) {
        button.addEventListener("click", function () {
            appendDigit(idx);
            focusExpression();
        });
    });
    document.getElementById("num_point").addEventListener("click", function () {
        appendPoint();
        focusExpression();
    });
    document.getElementById("op_add").addEventListener("click", function () {
        appendOperator("+");
        focusExpression();
    });
    document.getElementById("op_sub").addEventListener("click", function () {
        appendOperator("-");
        focusExpression();
    });
    document.getElementById("op_mul").addEventListener("click", function () {
        appendOperator(multiplyChar);
        focusExpression();
    });
    document.getElementById("op_div").addEventListener("click", function () {
        appendOperator(divideChar);
        focusExpression();
    });
    document.getElementById("op_pow").addEventListener("click", function () {
        appendOperator("^");
        focusExpression();
    });
    document.getElementById("op_fact").addEventListener("click", function () {
        appendOperator("!");
        focusExpression();
    });
    document.getElementById("const_pi").addEventListener("click", function () {
        appendConst("\u03C0");
        focusExpression();
    });
    document.getElementById("const_e").addEventListener("click", function () {
        appendConst("e");
        focusExpression();
    });
    document.getElementById("op_lparen").addEventListener("click", function () {
        appendParen("(");
        focusExpression();
    });
    document.getElementById("op_rparen").addEventListener("click", function () {
        appendParen(")");
        focusExpression();
    });
    document.getElementById("op_sqrt").addEventListener("click", function () {
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
    document.getElementById("fun_10pow").addEventListener("click", function () {
        insertStr("10^");
        focusExpression();
    });
    document.getElementById("fun_percent").addEventListener("click", function () {
        insertStr("/100");
        focusExpression();
    });
    document.getElementById("but_del").addEventListener("click", function () {
        onDel();
        focusExpression();
    });
    document.getElementById("but_clr").addEventListener("click", function () {
        onClear();
        focusExpression();
    });
    buttonCalc.addEventListener("click", calculateResult);
    exprInput.addEventListener("input", onExprChange);
    exprInput.addEventListener("keydown", function (e) {
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
    copyButton.addEventListener("click", function () {
        showScrolledResult(function (mightExact, str) {
            copyText(str);
            if (mightExact && (digitMax === 0 || (digitMax !== INTEGER_MAX && precisionCurrent >= digitMax))) {
                alert("Exact result have been copied");
            } else {
                alert("TRUNCATED result have been copied");
            }
        });
    });
    saveButton.addEventListener("click", function () {
        showScrolledResult(function (mightExact, str) {
            let url = URL.createObjectURL(new Blob([str], { type: "text/plain" }));
            let element = document.createElement("a");
            element.href = url;
            element.download = (mightExact && (digitMax === 0 || (digitMax !== INTEGER_MAX && precisionCurrent >= digitMax))) ? "output_exact.txt" : "output_truncated.txt";
            document.body.appendChild(element);
            element.click();
            element.remove();
        });
    });
    if (!ENABLE_VARIABLES) {
        let varButton = document.getElementById("but_var");
        varButton.disabled = true;
        varButton.innerHTML = "";
    }
    document.getElementById("but_var").addEventListener("click", function () {
        if (!ENABLE_VARIABLES || !workerLoaded) return;
        gridOps.classList.add("grid-hide");
        gridVar.classList.remove("grid-hide");
        focusExpression();
    });
    document.getElementById("var_close").addEventListener("click", function () {
        if (!workerLoaded) return;
        gridOps.classList.remove("grid-hide");
        gridVar.classList.add("grid-hide");
        focusExpression();
    });
    function registerVariable(name) {
        document.getElementById("var_in_" + name).addEventListener("click", function () {
            if (!ENABLE_VARIABLES || !workerLoaded) return;
            throw new Error("Not yet implemented");
        });
        document.getElementById("var_out_" + name).addEventListener("click", function () {
            if (!ENABLE_VARIABLES || !workerLoaded) return;
            appendConst(name);
            focusExpression();
        });
    }
    registerVariable("x");
    registerVariable("y");
    registerVariable("z");
    function disallowScroll(element) {
        let eLastScrollLeft = 0;
        let eHaveFocus = false;
        element.addEventListener("scroll", function () {
            let lastScrollLeft = eLastScrollLeft;
            eLastScrollLeft = element.scrollLeft;
            if (element.scrollLeft === 0 && !eHaveFocus && lastScrollLeft !== 0) {
                element.scrollLeft = lastScrollLeft;
            }
        })
        element.addEventListener("focus", function () {
            eHaveFocus = true;
            if (element === exprInput) {
                needEnterNewExpr = false;
            }
        });
        element.addEventListener("blur", function () {
            eHaveFocus = false;
        });
    }
    disallowScroll(exprInput);
    disallowScroll(fracOutput);
    exprInput.addEventListener("pointerdown", function () {
        needEnterNewExpr = false;
    });
    function onCalculatorResize() {
        chWidth = measureDiv.getBoundingClientRect().width / 4;
        let newDisplayWidth = Math.floor(calculatorDiv.clientWidth / chWidth);
        if (newDisplayWidth != displayWidth) {
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
        let lastInterval = -1;
        function timedScroll() {
            let absSpeed = Math.abs(lastSpeed);
            if (absSpeed * 2 > chWidth && absSpeed !== Infinity) {
                lastSpeed *= 0.8333333333333334;
            } else {
                clearInterval(lastInterval);
            }
            downX += lastSpeed;
            let offsetCh = Math.round(downX / chWidth);
            let newScrollOffset = Math.max(0, downScrollOffset - offsetCh);
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
                clearInterval(lastInterval);
                lastDownX = downX;
                downScrollOffset = scrollOffset;
                lastTimestamp = e.timeStamp;
                lastSpeed = 0;
                isDown = true;
                resultDiv.focus();
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
                let offsetCh = Math.round(offsetX / chWidth);
                let offsetTime = e.timeStamp - lastTimestamp;
                if (offsetTime >= SCROLL_TICK) {
                    lastTimestamp = e.timeStamp;
                    lastSpeed = (moveX - lastDownX) * SCROLL_TICK / offsetTime;
                    lastDownX = moveX;
                }
                let newScrollOffset = Math.max(0, downScrollOffset - offsetCh);
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
                if (Math.abs(lastSpeed) > chWidth) {
                    lastInterval = setInterval(timedScroll, SCROLL_TICK);
                }
            }
        }
        resultDiv.addEventListener("touchstart", mouseDown, { passive: false });
        resultDiv.addEventListener("pointerdown", mouseDown, { passive: false });
        resultDiv.addEventListener("touchmove", mouseMove, { passive: false });
        resultDiv.addEventListener("pointermove", mouseMove, { passive: false });
        resultDiv.addEventListener("touchend", mouseUp, { passive: false });
        resultDiv.addEventListener("pointerup", mouseUp, { passive: false });
        resultDiv.addEventListener("touchcancel", mouseUp, { passive: false });
        resultDiv.addEventListener("wheel", function (e) {
            if (workerLoaded && hasResult && resultScrollable) {
                clearInterval(lastInterval);
                e.preventDefault();
                let delta = e.deltaX + e.deltaY;
                let offsetCh = Math.round(delta / chWidth);
                let newScrollOffset = Math.max(0, scrollOffset + offsetCh);
                if (newScrollOffset !== scrollOffset) {
                    scrollOffset = newScrollOffset;
                    showScrolledResult();
                }
            }
        });
        resultDiv.addEventListener("keydown", function (e) {
            let newScrollOffset;
            switch (e.key) {
                case "ArrowLeft":
                case "ArrowUp":
                    e.preventDefault();
                    newScrollOffset = Math.max(0, scrollOffset - (e.ctrlKey ? 1 : 4));
                    if (newScrollOffset !== scrollOffset) {
                        scrollOffset = newScrollOffset;
                        showScrolledResult();
                    }
                    break;
                case "ArrowRight":
                case "ArrowDown":
                    e.preventDefault();
                    newScrollOffset = Math.max(0, scrollOffset + (e.ctrlKey ? 1 : 4));
                    if (newScrollOffset !== scrollOffset) {
                        scrollOffset = newScrollOffset;
                        showScrolledResult();
                    }
                    break;
                case "PageDown":
                    e.preventDefault();
                    newScrollOffset = Math.max(0, scrollOffset + displayWidth);
                    if (newScrollOffset !== scrollOffset) {
                        scrollOffset = newScrollOffset;
                        showScrolledResult();
                    }
                    break;
                case "PageUp":
                    e.preventDefault();
                    newScrollOffset = Math.max(0, scrollOffset - displayWidth);
                    if (newScrollOffset !== scrollOffset) {
                        scrollOffset = newScrollOffset;
                        showScrolledResult();
                    }
                    break;
            }
        });
    }
    registerScroll();
})();
