/*
 * Copyright 2026 lll69
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

import { minify_sync } from "terser";

const params = new URLSearchParams(location.search);
const CONFIG_POWER = params.get("power") === "on";
const CONFIG_SQRT = params.get("sqrt") === "on";
const CONFIG_CBRT = params.get("cbrt") === "on";
const CONFIG_FACT = params.get("fact") === "on";
// Function Panel
const CONFIG_FUNCTION_PANEL = params.get("functionPanel") === "on";
// Constants
const CONFIG_PI = params.get("pi") === "on";
const CONFIG_E = params.get("e") === "on";
// Functions
const CONFIG_LN = params.get("ln") === "on";
const CONFIG_LOG = params.get("log") === "on";
const CONFIG_EXP = params.get("exp") === "on";
const CONFIG_POW10 = params.get("pow10") === "on";
const CONFIG_TRIG = params.get("trig") === "on";
const CONFIG_TRIG_INV = params.get("trigInv") === "on";
const CONFIG_HYP = params.get("hyp") === "on";
const CONFIG_HYP_INV = params.get("hypInv") === "on";
// Switches
const CONFIG_SW_INV = params.get("invSw") === "on";
const CONFIG_SW_HYP = params.get("hypSw") === "on";
const CONFIG_SW_BRACKETS = params.get("brackets") === "on";
// Input/Output
const CONFIG_UI_NO_KEYBOARD = params.get("noKeyboard") === "on";
const CONFIG_SCROLLING = params.get("scrolling") === "on";
// Control Buttons
const CONFIG_UI_COPY_RESULT = params.get("copyResult") === "on";
const CONFIG_UI_COPY_TRUNC = params.get("copyTruncated") === "on";
const CONFIG_UI_COPY_INTEGER = params.get("copyInteger") === "on";
const CONFIG_UI_SAVE_RESULT = params.get("saveResult") === "on";
const CONFIG_UI_SIMPLIFY = params.get("simplify") === "on";
const CONFIG_UI_SPEED_SCROLL = params.get("speedUpScroll") === "on";

const SVG_RESOURCES = [
    "copy.svg",
    "copy_truncated.svg",
    "copy_integer.svg",
    "save.svg",
    "simplify.svg",
    "accelerate.svg",
]

const enum State {
    DOWNLOADING = 0,
    SUCCESS = 1,
    ERROR = 2,
}

const oldDownloaded = Number(window["downloaded"]);
const xhrList = new Set<XMLHttpRequest>();
let calcHtmlDownloadState = State.DOWNLOADING;
let calcJsDownloadState = State.DOWNLOADING;
let calcMuiDownloadState = State.DOWNLOADING;
let calcWorkerDownloadState = State.DOWNLOADING;
let calcSvgStates = Array<State>(SVG_RESOURCES.length).fill(State.DOWNLOADING);
let calcHtmlContent: Document | null = null;
let calcJsContent = "";
let calcMuiContent = "";
let calcWorkerContent = "";
let calcSvgContents = Array<string>(SVG_RESOURCES.length).fill("");
let calcHtmlDownloaded = 0;
let calcJsDownloaded = 0;
let calcMuiDownloaded = 0;
let calcWorkerDownloaded = 0;
let calcSvgDownloaded = Array<number>(SVG_RESOURCES.length).fill(0);
let errorShown = false;
let successShown = false;
let htmlContent = "";
const progressEl = document.getElementById("progress") as HTMLParagraphElement;
document.body.appendChild(progressEl);

function asyncFetch(url: string, responseType: typeof XMLHttpRequest.prototype.responseType, callback: (type: State, xhr: XMLHttpRequest, event: ProgressEvent) => void) {
    const xhr = new XMLHttpRequest();
    xhr.onload = (e) => callback(xhr.status === 200 ? State.SUCCESS : State.ERROR, xhr, e);
    xhr.onerror = (e) => callback(State.ERROR, xhr, e);
    xhr.onprogress = (e) => callback(State.DOWNLOADING, xhr, e);
    xhr.open("GET", url);
    xhr.responseType = responseType;
    xhr.send();
    xhrList.add(xhr);
}

function formatSize(size: number) {
    const K = 1024;
    const M = K * K;
    const G = M * K;
    if (size >= G) {
        return (size / G).toFixed(3) + "G";
    }
    if (size >= M) {
        return (size / M).toFixed(3) + "M";
    }
    if (size >= K) {
        return (size / K).toFixed(3) + "K";
    }
    return size + "B";
}

function refreshState() {
    if (0 !== (State.ERROR & (calcHtmlDownloadState | calcJsDownloadState | calcMuiDownloadState | calcWorkerDownloadState))) {
        if (errorShown) return;
        errorShown = true;
        const errors: string[] = [];
        if (calcHtmlDownloadState === State.ERROR) {
            errors.push("/calc.html");
        }
        if (calcJsDownloadState === State.ERROR) {
            errors.push("/calc_config.js");
        }
        if (calcMuiDownloadState === State.ERROR) {
            errors.push("/calc_mui_config.js");
        }
        if (calcWorkerDownloadState === State.ERROR) {
            errors.push("/calc_worker_config.js");
        }
        progressEl.textContent = "Error downloading data: " + errors.join(", ");
        xhrList.forEach(x => x.abort());
    } else if (State.SUCCESS === (calcHtmlDownloadState & calcJsDownloadState & calcMuiDownloadState & calcWorkerDownloadState)) {
        if (successShown) return;
        successShown = true;
        progressEl.textContent = "Compressing, please wait...";
        setTimeout(generateHtmlAndDownload, 100);
    } else {
        let svgSize = 0;
        for (const size of calcSvgDownloaded) {
            svgSize += size;
        }
        progressEl.textContent = "Downloading data (" + formatSize(svgSize + oldDownloaded + calcHtmlDownloaded + calcJsDownloaded + calcMuiDownloaded + calcWorkerDownloaded) + ")";
    }
}


function patchJs(jsContent: string, insertUrls: boolean) {
    const PATCH_START = "/*pUrVkSlX CONFIGURATION START FOR DOWNLOAD HxDlWyZk**/";
    const PATCH_END = "/*HxDlWyZk CONFIGURATION END FOR DOWNLOAD pUrVkSlX**/";
    const startIdx = jsContent.indexOf(PATCH_START);
    const endIdx = jsContent.indexOf(PATCH_END) + PATCH_END.length;
    if (startIdx === -1 || endIdx === -1) {
        throw new Error("Data corrupted");
    }
    let configStr = `
const CONFIG_IS_ONLINE = false;
// Operators
const CONFIG_POWER = ${CONFIG_POWER};
const CONFIG_SQRT = ${CONFIG_SQRT};
const CONFIG_CBRT = ${CONFIG_CBRT};
const CONFIG_FACT = ${CONFIG_FACT};
// Function Panel
const CONFIG_FUNCTION_PANEL = ${CONFIG_FUNCTION_PANEL};
// Constants
const CONFIG_PI = ${CONFIG_PI};
const CONFIG_E = ${CONFIG_E};
// Functions
const CONFIG_LN = ${CONFIG_LN};
const CONFIG_LOG = ${CONFIG_LOG};
const CONFIG_EXP = ${CONFIG_EXP};
const CONFIG_POW10 = ${CONFIG_POW10};
const CONFIG_TRIG = ${CONFIG_TRIG};
const CONFIG_TRIG_INV = ${CONFIG_TRIG_INV};
const CONFIG_HYP = ${CONFIG_HYP};
const CONFIG_HYP_INV = ${CONFIG_HYP_INV};
// Switches
const CONFIG_SW_INV = ${CONFIG_SW_INV};
const CONFIG_SW_HYP = ${CONFIG_SW_HYP};
const CONFIG_SW_BRACKETS = ${CONFIG_SW_BRACKETS};
// Input/Output
const CONFIG_UI_NO_KEYBOARD = ${CONFIG_UI_NO_KEYBOARD};
const CONFIG_SCROLLING = ${CONFIG_SCROLLING};
// Control Buttons
const CONFIG_UI_COPY_RESULT = ${CONFIG_UI_COPY_RESULT};
const CONFIG_UI_COPY_TRUNC = ${CONFIG_UI_COPY_TRUNC};
const CONFIG_UI_COPY_INTEGER = ${CONFIG_UI_COPY_INTEGER};
const CONFIG_UI_SAVE_RESULT = ${CONFIG_UI_SAVE_RESULT};
const CONFIG_UI_SIMPLIFY = ${CONFIG_UI_SIMPLIFY};
const CONFIG_UI_SPEED_SCROLL = ${CONFIG_UI_SPEED_SCROLL};
`;
    if (insertUrls) {
        configStr += "\nconst CONFIG_WORKER_JS_CONTENT = " + JSON.stringify(calcWorkerContent) + ";";
    }
    return jsContent.substring(0, startIdx) + configStr + jsContent.substring(endIdx);
}

function minifyJs(jsContent: string): string {
    return minify_sync(jsContent, {
        module: true,
        compress: {
            passes: 5,
        },
        mangle: {},
    }).code!;
}

function disableButton(el: HTMLButtonElement | null) {
    if (el) {
        el.textContent = "";
        el.disabled = true;
        el.setAttribute("style", "cursor:auto");
        el.removeAttribute("title");
    }
}

function generateHtml() {
    calcWorkerContent = minifyJs(patchJs(calcWorkerContent, false));
    calcJsContent = patchJs(calcJsContent, true);
    calcMuiContent = patchJs(calcMuiContent, false);
    const mainJsContent = minifyJs(calcJsContent + "\n" + calcMuiContent);
    const htmlEl = document.createElement("html");
    const headEl = document.createElement("head");
    htmlEl.appendChild(headEl);
    let metaEl = document.createElement("meta");
    metaEl.setAttribute("charset", "utf-8");
    headEl.appendChild(metaEl);
    metaEl = document.createElement("meta");
    metaEl.name = "viewport";
    metaEl.content = "width=device-width";
    headEl.appendChild(metaEl);
    const titleEl = document.createElement("title");
    titleEl.textContent = "Exact Calculator";
    headEl.appendChild(titleEl);
    [...calcHtmlContent!.head.getElementsByTagName("style")].forEach((x: HTMLStyleElement) => {
        x.remove();
        headEl.appendChild(x);
    });
    const bodyEl = document.createElement("body");
    htmlEl.appendChild(bodyEl);
    const loadingEl = document.createElement("p");
    loadingEl.id = "loading";
    loadingEl.setAttribute("style", "display:none!important")
    bodyEl.appendChild(loadingEl);
    bodyEl.appendChild(document.createComment("Created By CRCalc.js Exact Calculator"));
    bodyEl.appendChild(calcHtmlContent!.getElementById("calculator")!);
    [...bodyEl.getElementsByTagName("img")].forEach((img) => {
        const srcIndex = SVG_RESOURCES.indexOf(img.getAttribute("src")!);
        if (srcIndex !== -1) {
            img.setAttribute("src", "data:image/svg+xml," + encodeURI(calcSvgContents[srcIndex]))
        }
    });

    // Operators
    if (!CONFIG_POWER) disableButton(bodyEl.querySelector("#op_pow"));
    if (!CONFIG_SQRT) disableButton(bodyEl.querySelector("#op_sqrt"));
    if (!CONFIG_CBRT) disableButton(bodyEl.querySelector("#op_cbrt"));
    if (!CONFIG_FACT) disableButton(bodyEl.querySelector("#op_fact"));
    // Function Panel
    if (!CONFIG_FUNCTION_PANEL) (bodyEl.querySelector(".grid-fun") as HTMLElement).setAttribute("style", "display:none!important");
    // Constants
    if (!CONFIG_PI) disableButton(bodyEl.querySelector("#const_pi"));
    if (!CONFIG_E) disableButton(bodyEl.querySelector("#const_e"));
    // Functions
    if (!CONFIG_LN) disableButton(bodyEl.querySelector("#fun_ln"));
    if (!CONFIG_LOG) disableButton(bodyEl.querySelector("#fun_log"));
    if (!CONFIG_EXP) disableButton(bodyEl.querySelector("#fun_exp"));
    if (!CONFIG_POW10) disableButton(bodyEl.querySelector("#fun_10pow"));
    if (!CONFIG_TRIG) {
        disableButton(bodyEl.querySelector("#fun_sin"));
        disableButton(bodyEl.querySelector("#fun_cos"));
        disableButton(bodyEl.querySelector("#fun_tan"));
    }
    if (!CONFIG_TRIG_INV) {
        disableButton(bodyEl.querySelector("#fun_asin"));
        disableButton(bodyEl.querySelector("#fun_acos"));
        disableButton(bodyEl.querySelector("#fun_atan"));
    }
    if (!CONFIG_TRIG && !CONFIG_TRIG_INV) {
        disableButton(bodyEl.querySelector("#toggle_mode"));
    }
    // Switches
    if (!CONFIG_SW_INV) disableButton(bodyEl.querySelector("#toggle_inv"));
    if (!CONFIG_SW_BRACKETS) {
        disableButton(bodyEl.querySelector("#op_lparen"));
        disableButton(bodyEl.querySelector("#op_rparen"));
    }
    // Input/Output
    if (!CONFIG_SCROLLING) {
        bodyEl.querySelector("#result_div")!.setAttribute("style", "cursor:auto");
    }

    const reactRoot = document.createElement("div");
    reactRoot.id = "react-root";
    reactRoot.dataset.hyp = String(CONFIG_SW_HYP);
    reactRoot.dataset.inv = String(CONFIG_SW_INV);
    bodyEl.appendChild(reactRoot);
    const scriptEl = document.createElement("script");
    scriptEl.textContent = mainJsContent;
    bodyEl.appendChild(scriptEl);
    return "<!DOCTYPE html>" + htmlEl.outerHTML;
}

function generateHtmlAndDownload() {
    try {
        htmlContent = generateHtml();
    } catch (e) {
        progressEl.textContent = "Error: " + (e.message || String(e));
        console.error(e);
        return;
    }
    progressEl.textContent = "Completed!";
    const previewUrl = URL.createObjectURL(new Blob([htmlContent], { type: "text/html" }));
    const downloadUrl = URL.createObjectURL(new Blob([htmlContent], { type: "application/octet-stream" }));
    const previewLink = document.createElement("a");
    previewLink.href = previewUrl;
    previewLink.target = "_blank";
    previewLink.textContent = "Click to show preview";
    document.body.appendChild(previewLink);
    document.body.appendChild(document.createElement("br"));
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = "calculator.html";
    downloadLink.textContent = "Click to download HTML file";
    document.body.appendChild(downloadLink);
}

asyncFetch("/calc.html", "document", (t, x, e) => {
    if (calcHtmlDownloadState !== State.DOWNLOADING) return;
    calcHtmlDownloadState = t;
    calcHtmlDownloaded = e.loaded;
    if (t === State.SUCCESS) {
        calcHtmlContent = x.responseXML;
    }
    refreshState();
});

asyncFetch("/calc_config.js", "text", (t, x, e) => {
    if (calcJsDownloadState !== State.DOWNLOADING) return;
    calcJsDownloadState = t;
    calcJsDownloaded = e.loaded;
    if (t === State.SUCCESS) {
        calcJsContent = x.responseText;
    }
    refreshState();
});

asyncFetch("/calc_mui_config.js", "text", (t, x, e) => {
    if (calcMuiDownloadState !== State.DOWNLOADING) return;
    calcMuiDownloadState = t;
    calcMuiDownloaded = e.loaded;
    if (t === State.SUCCESS) {
        calcMuiContent = x.responseText;
    }
    refreshState();
});

asyncFetch("/calc_worker_config.js", "text", (t, x, e) => {
    if (calcWorkerDownloadState !== State.DOWNLOADING) return;
    calcWorkerDownloadState = t;
    calcWorkerDownloaded = e.loaded;
    if (t === State.SUCCESS) {
        calcWorkerContent = x.responseText;
    }
    refreshState();
});

SVG_RESOURCES.forEach((url, idx) => {
    asyncFetch(url, "text", (t, x, e) => {
        if (calcSvgStates[idx] !== State.DOWNLOADING) return;
        calcSvgStates[idx] = t;
        calcSvgDownloaded[idx] = e.loaded;
        if (t === State.SUCCESS) {
            calcSvgContents[idx] = x.responseText;
        }
        refreshState();
    });
});

refreshState();

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
