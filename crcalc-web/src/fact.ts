// Importing CRCalc.js library
import { UnifiedReal } from "crcalc-js";
const { E, floor, log10, log2, PI } = Math;

// DOM Elements
const numberInput = document.getElementById("numberInput") as HTMLInputElement;
const calcBtn = document.getElementById("calcBtn") as HTMLButtonElement;
const resultBox = document.getElementById("resultBox") as HTMLElement;
const copyBtn = document.getElementById("copyBtn") as HTMLButtonElement;
const downloadBtn = document.getElementById("downloadBtn") as HTMLButtonElement;
const calcTimeEl = document.getElementById("calcTime") as HTMLElement;
const digitCountEl = document.getElementById("digitCount") as HTMLElement;
const binaryBitsEl = document.getElementById("binaryBits") as HTMLElement;
const sizeValueEl = document.getElementById("sizeValue") as HTMLElement;
const trailingZerosEl = document.getElementById("trailingZeros") as HTMLElement;

// State
let currentResult: string | null = null;
let currentN = 0;
const MAX_LIMIT = 16777215;
const DISPLAY_LIMIT = 5857317; // Limit for rendering in DOM to prevent crash

// Calculation Logic
function calculateFactorial(n: number) {
    const start = performance.now();
    const num = UnifiedReal.newN(BigInt(n));
    const result = num.fact().bigIntegerValue()!.toString();
    const end = performance.now();
    return { result, time: (end - start).toFixed(2) };
}

// Statistics Helpers
function getDigitCount(n: number) {
    if (n <= 1) return 1;
    const log10_2pi = log10(2 * PI);
    const log10_e = log10(E);
    return floor((n + 0.5) * log10(n) - n * log10_e + log10_2pi / 2) + 1;
}

function getTrailingZeros(n: number) {
    let count = 0;
    let power = 5;
    while (power <= n) {
        count += floor(n / power);
        power *= 5;
    }
    return count;
}

// Main Execution
function doCalculation() {
    const n = parseInt(numberInput.value);

    // Validation
    if (isNaN(n) || n < 0) {
        resultBox.innerHTML = "<span style=\"color: #ff4444;\">Error: Please enter a valid non-negative integer.</span>";
        resetState();
        return;
    }

    if (n > MAX_LIMIT) {
        resultBox.innerHTML = `<span style="color: #ff4444;">Error: Input exceeds limit. Maximum supported value is ${MAX_LIMIT.toLocaleString()}.</span>`;
        resetState();
        return;
    }

    // UI Loading State
    resultBox.innerHTML = "<span style=\"color: #888;\">⏳ Computing... Please wait.</span>";
    calcBtn.disabled = true;
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    calcTimeEl.textContent = digitCountEl.textContent = binaryBitsEl.textContent = sizeValueEl.textContent = trailingZerosEl.textContent = "-";

    // Defer heavy calculation to allow UI render
    setTimeout(() => {
        try {
            const { result, time } = calculateFactorial(n);
            currentResult = result;
            currentN = n;

            // Update Stats
            calcTimeEl.textContent = time + " ms";
            const digits = result.length;
            digitCountEl.textContent = digits.toLocaleString();

            const binaryBits = floor(n * log2(n) - n * log2(E) + log2(2 * PI * n) / 2) + 1;
            binaryBitsEl.textContent = binaryBits.toLocaleString();

            let sizeValue: string;
            if (digits >= 1_000_000_000) {
                sizeValue = (digits / (1 << 30)).toFixed(2) + " GiB";
            } else if (digits >= 1_000_000) {
                sizeValue = (digits / (1 << 20)).toFixed(2) + " MiB";
            } else if (digits >= 1_000) {
                sizeValue = (digits / (1 << 10)).toFixed(2) + " KiB";
            } else if (digits >= 2) {
                sizeValue = digits + " Bytes";
            } else {
                sizeValue = digits + " Byte";
            }
            sizeValueEl.textContent = sizeValue;

            trailingZerosEl.textContent = getTrailingZeros(n).toLocaleString();

            // Display Result
            renderResult();

            // Enable Buttons
            calcBtn.disabled = false;
            copyBtn.disabled = false;
            downloadBtn.disabled = false;

        } catch (e) {
            resultBox.innerHTML = "<span style=\"color: #ff4444;\">Calculation Error: " + e.message + "</span>";
            calcTimeEl.textContent = digitCountEl.textContent = binaryBitsEl.textContent = sizeValueEl.textContent = trailingZerosEl.textContent = "-";
            console.error(e);
            resetState();
        }
    }, 50);
}

function renderResult() {
    if (!currentResult) return;

    // toNiceString() generates the full string
    const fullText = currentResult;
    const len = fullText.length;

    if (len > DISPLAY_LIMIT) {
        // Prevent browser crash by not rendering huge strings into DOM
        const start = fullText.substring(0, 1600);
        const end = fullText.substring(len - 1600);
        resultBox.innerHTML =
            '<div style="color: #aaa; margin - bottom: 10px; ">' +
            `Result is too large to display (${len.toLocaleString()} digits).<br>` +
            'Showing preview. Use "Copy" or "Download" for full result.' +
            '</div>' +
            `<div style="color:#0f0;">${start}</div>` +
            `<div style="color:#888; margin: 10px 0;">... [ omitted ${len - 3200} digits ] ...</div>` +
            `<div style="color:#0f0;">${end}</div>`
            ;
    } else {
        resultBox.textContent = fullText;
    }
}

function resetState() {
    calcBtn.disabled = false;
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    currentResult = null;
}

// Actions
async function copyResult() {
    if (!currentResult) return;
    try {
        const text = currentResult;
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "✅ Copied!";
        setTimeout(() => { copyBtn.textContent = "📋 Copy"; }, 2000);
    } catch (e) {
        alert("Copy failed. The result might be too large for the clipboard.");
    }
}

function downloadResult() {
    if (!currentResult) return;
    try {
        const text = currentResult;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `factorial_of_${currentN}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        downloadBtn.textContent = "✅ Downloaded!";
        setTimeout(() => { downloadBtn.textContent = "💾 Download"; }, 2000);
    } catch (e) {
        alert("Download failed.");
    }
}

// Event Listeners
calcBtn.addEventListener("click", doCalculation);
copyBtn.addEventListener("click", copyResult);
downloadBtn.addEventListener("click", downloadResult);

numberInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") doCalculation();
});

document.querySelectorAll(".example-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        numberInput.value = (btn as HTMLElement).dataset.value!;
        doCalculation();
    });
});

if (navigator && navigator.userAgent && navigator.userAgent.indexOf("Firefox") >= 0) {
    document.getElementById("non-firefox")!.remove();
}

// Initial Calculation
doCalculation();

export { };
