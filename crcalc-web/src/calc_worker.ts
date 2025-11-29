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

import { BoundedRational, UnifiedReal } from "crcalc-js";
import { CreateURResult, InitResult, ToStringResult, WorkerRequest } from "./worker_types";

const STRICT_EXPR = true;

const urList = {};
const UR_E = UnifiedReal.E;
const UR_LN10 = UnifiedReal.TEN.ln();
const UR_RADIANS_PER_DEGREE = UnifiedReal.RADIANS_PER_DEGREE;

const cachedURMap: Map<string | bigint, UnifiedReal> = new Map();
const negateMap: Map<UnifiedReal, UnifiedReal> = new Map();
const factMap: Map<UnifiedReal, UnifiedReal> = new Map();
const sqrtMap: Map<UnifiedReal, UnifiedReal> = new Map();
const sinMap: Map<UnifiedReal, UnifiedReal> = new Map();
const cosMap: Map<UnifiedReal, UnifiedReal> = new Map();
const tanMap: Map<UnifiedReal, UnifiedReal> = new Map();
const asinMap: Map<UnifiedReal, UnifiedReal> = new Map();
const acosMap: Map<UnifiedReal, UnifiedReal> = new Map();
const atanMap: Map<UnifiedReal, UnifiedReal> = new Map();
const addMap: Map<UnifiedReal, Map<UnifiedReal, UnifiedReal>> = new Map();
const multiplyMap: Map<UnifiedReal, Map<UnifiedReal, UnifiedReal>> = new Map();
const divideMap: Map<UnifiedReal, Map<UnifiedReal, UnifiedReal>> = new Map();
const powBIMap: Map<bigint, Map<bigint, bigint>> = new Map();
const powURMap: Map<UnifiedReal, Map<UnifiedReal, UnifiedReal>> = new Map();

type TokenizeResult = {
    tokens: string[];
    locations: Array<readonly number[]>;
}

const freezeObject = Object.freeze;
const postWorkerMessage = postMessage;

function getURFromStr(str: string): UnifiedReal {
    let cached = cachedURMap.get(str);
    if (cached === undefined) {
        cached = UnifiedReal.newBR(BoundedRational.valueOfS(str));
        cachedURMap.set(str, cached);
    }
    return cached;
}

function getURFromBI(bi: bigint): UnifiedReal {
    let cached = cachedURMap.get(bi);
    if (cached === undefined) {
        cached = UnifiedReal.newN(bi);
        cachedURMap.set(bi, cached);
    }
    return cached;
}

function getNegate(ur: UnifiedReal): UnifiedReal {
    let cached = negateMap.get(ur);
    if (cached === undefined) {
        cached = ur.negate();
        negateMap.set(ur, cached);
        negateMap.set(cached, ur);
    }
    return cached;
}

function getFact(ur: UnifiedReal): UnifiedReal {
    let cached = factMap.get(ur);
    if (cached === undefined) {
        cached = ur.fact();
        factMap.set(ur, cached);
    }
    return cached;
}

function getSqrt(ur: UnifiedReal): UnifiedReal {
    let cached = sqrtMap.get(ur);
    if (cached === undefined) {
        cached = ur.sqrt();
        sqrtMap.set(ur, cached);
    }
    return cached;
}

function getSin(ur: UnifiedReal): UnifiedReal {
    let cached: UnifiedReal | undefined = sinMap.get(ur);
    if (cached === undefined) {
        cached = ur.sin();
        sinMap.set(ur, cached);
    }
    return cached;
}

function getCos(ur: UnifiedReal): UnifiedReal {
    let cached: UnifiedReal | undefined = cosMap.get(ur);
    if (cached === undefined) {
        cached = ur.cos();
        cosMap.set(ur, cached);
    }
    return cached;
}

function getTan(ur: UnifiedReal): UnifiedReal {
    let cached: UnifiedReal | undefined = tanMap.get(ur);
    if (cached === undefined) {
        cached = ur.tan();
        tanMap.set(ur, cached);
    }
    return cached;
}

function getASin(ur: UnifiedReal): UnifiedReal {
    let cached: UnifiedReal | undefined = asinMap.get(ur);
    if (cached === undefined) {
        cached = ur.asin();
        asinMap.set(ur, cached);
    }
    return cached;
}

function getACos(ur: UnifiedReal): UnifiedReal {
    let cached: UnifiedReal | undefined = acosMap.get(ur);
    if (cached === undefined) {
        cached = ur.acos();
        acosMap.set(ur, cached);
    }
    return cached;
}

function getATan(ur: UnifiedReal): UnifiedReal {
    let cached: UnifiedReal | undefined = atanMap.get(ur);
    if (cached === undefined) {
        cached = ur.atan();
        atanMap.set(ur, cached);
    }
    return cached;
}

function getCachedMap<T>(map: Map<T, Map<T, T>>, ur: T): Map<T, T> {
    let cachedMap = map.get(ur);
    if (cachedMap === undefined) {
        cachedMap = new Map();
        map.set(ur, cachedMap);
    }
    return cachedMap;
}

function getAdd(arg0: UnifiedReal, arg1: UnifiedReal): UnifiedReal {
    const cachedMap = getCachedMap(addMap, arg0);
    let cached = cachedMap.get(arg1);
    if (cached === undefined) {
        cached = arg0.add(arg1);
        cachedMap.set(arg1, cached);
        getCachedMap(addMap, arg1).set(arg0, cached);
    }
    return cached;
}

function getMultiply(arg0: UnifiedReal, arg1: UnifiedReal): UnifiedReal {
    const cachedMap = getCachedMap(multiplyMap, arg0);
    let cached = cachedMap.get(arg1);
    if (cached === undefined) {
        cached = arg0.multiply(arg1);
        cachedMap.set(arg1, cached);
        getCachedMap(multiplyMap, arg1).set(arg0, cached);
    }
    return cached;
}

function getDivide(arg0: UnifiedReal, arg1: UnifiedReal): UnifiedReal {
    const cachedMap = getCachedMap(divideMap, arg0);
    let cached = cachedMap.get(arg1);
    if (cached === undefined) {
        cached = arg0.divide(arg1);
        cachedMap.set(arg1, cached);
    }
    return cached;
}

function getPowBI(arg0: bigint, arg1: bigint): bigint {
    const cachedMap = getCachedMap(powBIMap, arg0);
    let cached = cachedMap.get(arg1);
    if (cached === undefined) {
        cached = arg0 ** arg1;
        cachedMap.set(arg1, cached);
    }
    return cached;
}

function getPowUR(arg0: UnifiedReal, arg1: UnifiedReal): UnifiedReal {
    const cachedMap = getCachedMap(powURMap, arg0);
    let cached = cachedMap.get(arg1);
    if (cached === undefined) {
        if (arg0 === UR_E) {
            cached = arg1.exp();
        } else {
            cached = arg0.pow(arg1);
        }
        cachedMap.set(arg1, cached);
    }
    return cached;
}

function tokenize(expr: string): TokenizeResult {
    const result: string[] = [];
    const locations: Array<readonly number[]> = [];
    let len = expr.length;
    let i: number;
    let ch: string, lastChar = "\0";
    let unprocessed = "";
    let lparenCount = 0;
    for (i = 0; i < len; lastChar = ch, i++) {
        ch = expr[i];
        if (ch >= "0" && ch <= "9") {
            if (lastChar === "\0" || lastChar === "." || (lastChar >= "0" && lastChar <= "9")) {
                unprocessed += ch;
            } else if (lastChar === "!" || lastChar === ")" || lastChar === "\u03C0" || (lastChar >= "a" && lastChar <= "z")) {
                result.push(unprocessed);
                result.push("*");
                locations.push(freezeObject([i - unprocessed.length, i]));
                locations.push(freezeObject([i, i]));
                unprocessed = ch;
            } else if (lastChar === "(" || lastChar === "^" || lastChar === "+" || lastChar === "-"
                || lastChar === "*" || lastChar === "/" || lastChar === "\u00D7" || lastChar === "\u00F7") {
                unprocessed = ch;
            } else {
                throw new Error("Invalid lastChar '" + lastChar + "' at position (" + i + ")");
            }
        } else if (ch >= "a" && ch <= "z" || ch === "\u03C0") {
            if (lastChar === "\0" || lastChar === "\u03C0" || (lastChar >= "a" && lastChar <= "z")) {
                unprocessed += ch;
            } else if (lastChar === "!" || lastChar === ")"
                || lastChar === "." || (lastChar >= "0" && lastChar <= "9")) {
                result.push(unprocessed);
                result.push("*");
                locations.push(freezeObject([i - unprocessed.length, i]));
                locations.push(freezeObject([i, i]));
                unprocessed = ch;
            } else if (lastChar === "(" || lastChar === "^" || lastChar === "+" || lastChar === "-"
                || lastChar === "*" || lastChar === "/" || lastChar === "\u00D7" || lastChar === "\u00F7") {
                unprocessed = ch;
            } else {
                throw new Error("Invalid lastChar '" + lastChar + "' at position (" + i + ")");
            }
        } else if (ch === ".") {
            if (lastChar === "\0" || (lastChar >= "0" && lastChar <= "9")) {
                if (unprocessed.indexOf(".") >= 0) {
                    throw new Error("Invalid char '.' at position (" + i + ")");
                }
                unprocessed += ".";
            } else if (lastChar === "!" || lastChar === ")" || lastChar === "\u03C0"
                || (lastChar >= "a" && lastChar <= "z")) {
                result.push(unprocessed);
                result.push("*");
                locations.push(freezeObject([i - unprocessed.length, i]));
                locations.push(freezeObject([i, i]));
                unprocessed = ".";
            } else if (lastChar === "(" || lastChar === "^" || lastChar === "+" || lastChar === "-"
                || lastChar === "*" || lastChar === "/" || lastChar === "\u00D7" || lastChar === "\u00F7") {
                unprocessed = ".";
            } else if (lastChar === ".") {
                throw new Error("Invalid char '.' at position (" + i + ")");
            } else {
                throw new Error("Invalid lastChar '" + lastChar + "' at position (" + i + ")");
            }
        } else if (ch === "+" || ch === "-") {
            if (lastChar === "." || lastChar === "!" || lastChar === ")" || lastChar === "\u03C0"
                || (lastChar >= "a" && lastChar <= "z") || (lastChar >= "0" && lastChar <= "9")) {
                result.push(unprocessed);
                result.push(ch);
                locations.push(freezeObject([i - unprocessed.length, i]));
                locations.push(freezeObject([i, i + 1]));
                unprocessed = "";
            } else if (lastChar === "\0" || lastChar === "(" || lastChar === "^"
                || lastChar === "+" || lastChar === "-" || lastChar === "*"
                || lastChar === "/" || lastChar === "\u00D7" || lastChar === "\u00F7") {
                if (STRICT_EXPR && (lastChar === "^" || lastChar === "+" || lastChar === "-")) {
                    throw new Error("Missing '(' before '" + ch + "' at position (" + i + ")");
                }
                result.push((lastChar === "^") ? ("unary" + ch + "pow") : ("unary" + ch));
                locations.push(freezeObject([i, i + 1]));
                unprocessed = "";
            } else {
                throw new Error("Invalid lastChar '" + lastChar + "' at position (" + i + ")");
            }
        } else if (ch === "*" || ch === "\u00D7") {
            if (lastChar === "." || lastChar === "!" || lastChar === ")" || lastChar === "\u03C0"
                || (lastChar >= "a" && lastChar <= "z") || (lastChar >= "0" && lastChar <= "9")) {
                result.push(unprocessed);
                result.push("*");
                locations.push(freezeObject([i - unprocessed.length, i]));
                locations.push(freezeObject([i, i + 1]));
                unprocessed = "";
            } else if (lastChar === "\0" || lastChar === "(" || lastChar === "^"
                || lastChar === "+" || lastChar === "-" || lastChar === "*"
                || lastChar === "/" || lastChar === "\u00D7" || lastChar === "\u00F7") {
                throw new Error("Invalid char '" + ch + "' at position (" + i + ")");
            } else {
                throw new Error("Invalid lastChar '" + lastChar + "' at position (" + i + ")");
            }
        } else if (ch === "/" || ch === "\u00F7") {
            if (lastChar === "." || lastChar === "!" || lastChar === ")" || lastChar === "\u03C0"
                || (lastChar >= "a" && lastChar <= "z") || (lastChar >= "0" && lastChar <= "9")) {
                result.push(unprocessed);
                result.push("/");
                locations.push(freezeObject([i - unprocessed.length, i]));
                locations.push(freezeObject([i, i + 1]));
                unprocessed = "";
            } else if (lastChar === "\0" || lastChar === "(" || lastChar === "^"
                || lastChar === "+" || lastChar === "-" || lastChar === "*"
                || lastChar === "/" || lastChar === "\u00D7" || lastChar === "\u00F7") {
                throw new Error("Invalid char '" + ch + "' at position (" + i + ")");
            } else {
                throw new Error("Invalid lastChar '" + lastChar + "' at position (" + i + ")");
            }
        } else if (ch === "^") {
            if (lastChar === "." || lastChar === "!" || lastChar === ")" || lastChar === "\u03C0"
                || (lastChar >= "a" && lastChar <= "z") || (lastChar >= "0" && lastChar <= "9")) {
                result.push(unprocessed);
                result.push("^");
                locations.push(freezeObject([i - unprocessed.length, i]));
                locations.push(freezeObject([i, i + 1]));
                unprocessed = "";
            } else if (lastChar === "\0" || lastChar === "(" || lastChar === "^"
                || lastChar === "+" || lastChar === "-" || lastChar === "*"
                || lastChar === "/" || lastChar === "\u00D7" || lastChar === "\u00F7") {
                throw new Error("Invalid char '^' at position (" + i + ")");
            } else {
                throw new Error("Invalid lastChar '" + lastChar + "' at position (" + i + ")");
            }
        } else if (ch === "(") {
            if (lastChar === "\0" || lastChar === "(" || lastChar === "^" || lastChar === "+" || lastChar === "-"
                || lastChar === "*" || lastChar === "/" || lastChar === "\u00D7" || lastChar === "\u00F7") {
                result.push("(");
                locations.push(freezeObject([i, i + 1]));
                unprocessed = "";
            } else if (lastChar === "." || lastChar === "!" || lastChar === ")"
                || (lastChar >= "0" && lastChar <= "9")) {
                result.push(unprocessed);
                result.push("*");
                result.push("(");
                locations.push(freezeObject([i - unprocessed.length, i]));
                locations.push(freezeObject([i, i]));
                locations.push(freezeObject([i, i + 1]));
                unprocessed = "";
            } else if (lastChar === "\u03C0" || (lastChar >= "a" && lastChar <= "z")) {
                result.push(unprocessed);
                result.push("(");
                locations.push(freezeObject([i - unprocessed.length, i]));
                locations.push(freezeObject([i, i + 1]));
                unprocessed = "";
            } else {
                throw new Error("Invalid lastChar '" + lastChar + "' at position (" + i + ")");
            }
            lparenCount++;
        } else if (ch === ")" || ch === "!") {
            if (lastChar === "." || lastChar === "!" || lastChar === ")" || lastChar === "\u03C0"
                || (lastChar >= "a" && lastChar <= "z") || (lastChar >= "0" && lastChar <= "9")) {
                result.push(unprocessed);
                result.push(ch);
                locations.push(freezeObject([i - unprocessed.length, i]));
                locations.push(freezeObject([i, i + 1]));
                unprocessed = "";
            } else if (lastChar === "\0" || lastChar === "(" || lastChar === "^" || lastChar === "+" || lastChar === "-"
                || lastChar === "*" || lastChar === "/" || lastChar === "\u00D7" || lastChar === "\u00F7") {
                throw new Error("Invalid char '" + ch + "' at position (" + i + ")");
            } else {
                throw new Error("Invalid lastChar '" + lastChar + "' at position (" + i + ")");
            }
            if (ch === ")") {
                lparenCount--;
                if (lparenCount < 0) {
                    throw new Error("Invalid char ')' at position (" + i + ")");
                }
            }
        } else if (ch !== " ") {
            throw new Error("Unknown char '" + ch + "' at position (" + i + ")");
        }
    }
    if (unprocessed.length > 0) {
        result.push(unprocessed);
        locations.push(freezeObject([len - unprocessed.length, len]));
    }
    const finalResult: string[] = [];
    const finalLocations: Array<readonly number[]> = [];
    len = result.length;
    for (i = 0; i < len; i++) {
        const token = result[i];
        const loc = locations[i];
        if (token !== "") {
            if (token.length > 0 && token !== "unary+" && token !== "unary-" && token !== "unary+pow" && token !== "unary-pow") {
                const firstChar = token[0];
                if ((firstChar < "0" || firstChar > "9") && firstChar !== ".") {
                    const lastChar = token[token.length - 1];
                    let possibleName;
                    if (token.length >= 6 && (lastChar === "n" || lastChar === "s")) {
                        possibleName = token.substring(token.length - 6);
                        if (possibleName === "arcsin" || possibleName === "arccos" || possibleName === "arctan") {
                            const newItems = Array.prototype.slice.call(token, 0, token.length - 6).join("*");
                            finalResult.push(...newItems);
                            for (let j = 0; j < newItems.length; j++) {
                                finalLocations.push(loc);
                            }
                            if (token.length > 6) {
                                finalResult.push("*");
                                finalLocations.push(loc);
                            }
                            finalResult.push(possibleName);
                            finalLocations.push(loc);
                            continue;
                        }
                    }
                    if (token.length >= 4 && (lastChar === "n" || lastChar === "s" || lastChar === "t")) {
                        possibleName = token.substring(token.length - 4);
                        if (possibleName === "asin" || possibleName === "acos" || possibleName === "atan" || possibleName === "sqrt") {
                            const newItems = Array.prototype.slice.call(token, 0, token.length - 4).join("*");
                            finalResult.push(...newItems);
                            for (let j = 0; j < newItems.length; j++) {
                                finalLocations.push(loc);
                            }
                            if (token.length > 4) {
                                finalResult.push("*");
                                finalLocations.push(loc);
                            }
                            finalResult.push(possibleName);
                            finalLocations.push(loc);
                            continue;
                        }
                    }
                    if (token.length >= 3 && (lastChar === "n" || lastChar === "s" || lastChar === "g" || lastChar === "p")) {
                        possibleName = token.substring(token.length - 3);
                        if (possibleName === "sin" || possibleName === "cos" || possibleName === "tan"
                            || possibleName === "log" || possibleName === "exp") {
                            const newItems = Array.prototype.slice.call(token, 0, token.length - 3).join("*");
                            finalResult.push(...newItems);
                            for (let j = 0; j < newItems.length; j++) {
                                finalLocations.push(loc);
                            }
                            if (token.length > 3) {
                                finalResult.push("*");
                                finalLocations.push(loc);
                            }
                            finalResult.push(possibleName);
                            finalLocations.push(loc);
                            continue;
                        }
                    }
                    if (token.length >= 2 && lastChar === "n") {
                        possibleName = token.substring(token.length - 2);
                        if (possibleName === "ln") {
                            const newItems = Array.prototype.slice.call(token, 0, token.length - 2).join("*");
                            finalResult.push(...newItems);
                            for (let j = 0; j < newItems.length; j++) {
                                finalLocations.push(loc);
                            }
                            if (token.length > 2) {
                                finalResult.push("*");
                                finalLocations.push(loc);
                            }
                            finalResult.push(possibleName);
                            finalLocations.push(loc);
                            continue;
                        }
                    }
                    const newItems = Array.prototype.join.call(token, "*");
                    finalResult.push(...newItems);
                    for (let j = 0; j < newItems.length; j++) {
                        finalLocations.push(loc);
                    }
                    continue;
                }
            }
            finalResult.push(token);
            finalLocations.push(loc);
        }
    }
    if (lparenCount > 0) {
        const lastLocation = freezeObject([expr.length, expr.length]);
        while (lparenCount--) {
            finalResult.push(")");
            finalLocations.push(lastLocation);
        }
    }
    return { tokens: finalResult, locations: finalLocations };
}
function tokenToRpn(tokenizeResult: TokenizeResult) {
    const tokens = tokenizeResult.tokens;
    const locations = tokenizeResult.locations;
    const len = tokens.length;
    const priority = freezeObject({
        "!": 6,
        "unary+pow": 5,
        "unary-pow": 5,
        "^": 4,
        "unary+": 3,
        "unary-": 3,
        "*": 2,
        "/": 2,
        "+": 1,
        "-": 1
    });
    const functions = freezeObject(new Set([
        "ln", "log", "exp", "sqrt",
        "sin", "cos", "tan",
        "asin", "acos", "atan",
        "arcsin", "arccos", "arctan"
    ]));
    const rightAssocList = freezeObject(new Set([
        "unary+", "unary-", "unary+pow", "unary-pow", "^"
    ]));
    const output: any[] = [];
    const stack: any[] = [];
    for (let i = 0; i < len; i++) {
        const token = tokens[i];
        const loc = locations[i];
        if (functions.has(token) || token === "(") {
            stack.push(freezeObject([token, loc]));
        } else if (token === ")") {
            while (stack.length > 0 && stack[stack.length - 1][0] !== "(") {
                output.push(stack.pop());
            }
            if (stack.length === 0) {
                throw new Error("Mismatched parentheses at position [" + loc + "]");
            }
            stack.pop();
            if (stack.length > 0 && functions.has(stack[stack.length - 1][0])) {
                output.push(stack.pop());
            }
        } else if (priority.hasOwnProperty(token)) {
            const currentPrio = priority[token];
            const currentAssoc = rightAssocList.has(token);
            while (stack.length > 0) {
                const topToken = stack[stack.length - 1][0];
                if (topToken === "(" || functions.has(topToken)) break;
                const topPrio = priority[topToken] || 0;
                if (currentAssoc ? (topPrio > currentPrio) : (topPrio >= currentPrio)) {
                    output.push(stack.pop());
                } else {
                    break;
                }
            }
            stack.push(freezeObject([token, loc]));
        } else {
            output.push(freezeObject([token, loc]));
        }
    }
    while (stack.length > 0) {
        const top = stack.pop();
        if (top[0] === "(") {
            throw new Error("Mismatched parentheses at position [" + top[1] + "]");
        }
        output.push(top);
    }
    return output;
}
function urToBigInt(ur: UnifiedReal) {
    if (ur.digitsRequired() === 0) {
        let asBI = ur.bigIntegerValue();
        if (asBI === null) {
            asBI = ur.crValue().get_appr(0);  // Correct if it was an integer.
            if (!ur.approxEquals(UnifiedReal.newN(asBI), -1000)) {
                return null;
            }
        }
        return asBI;
    }
    return null;
}
function createUR(expr: string, degreeMode: boolean): UnifiedReal {
    const unaryOps = freezeObject(new Set([
        "unary+", "unary-", "unary+pow", "unary-pow", "!"
    ]));
    const binaryOps = freezeObject(new Set([
        "+", "-", "*", "/", "^"
    ]));
    const functions = freezeObject(new Set([
        "ln", "log", "exp", "sqrt",
        "sin", "cos", "tan",
        "asin", "acos", "atan",
        "arcsin", "arccos", "arctan"
    ]));
    const tokenizeResult = tokenize(expr);
    const rpnResult = tokenToRpn(tokenizeResult);
    const len = rpnResult.length;
    const stack: UnifiedReal[] = [];
    for (let i = 0; i < len; i++) {
        const rpnItem = rpnResult[i];
        const token = rpnItem[0];
        const loc = rpnItem[1];
        if (binaryOps.has(token)) {
            if (stack.length < 2) {
                throw new Error("Insufficient number of parameters for operator '" + token + "' at position [" + loc + "]")
            }
            const arg1 = stack.pop()!!;
            const arg0 = stack.pop()!!;
            try {
                switch (token) {
                    case "+":
                        stack.push(getAdd(arg0, arg1));
                        break;
                    case "-":
                        stack.push(getAdd(arg0, getNegate(arg1)));
                        break;
                    case "*":
                        stack.push(getMultiply(arg0, arg1));
                        break;
                    case "/":
                        stack.push(getDivide(arg0, arg1));
                        break;
                    case "^": {
                        if (arg0.digitsRequired() === 0 && arg1.digitsRequired() === 0) {
                            const big0 = urToBigInt(arg0);
                            const big1 = urToBigInt(arg1);
                            if (big0 && big1 && big1 >= 0) {
                                stack.push(getURFromBI(getPowBI(big0, big1)));
                                break;
                            }
                        }
                        stack.push(getPowUR(arg0, arg1));
                        break;
                    }
                }
            } catch (e) {
                console.error(e);
                throw new Error(e.message + " at position [" + loc + "]")
            }
        } else if (unaryOps.has(token)) {
            if (stack.length < 1) {
                throw new Error("Insufficient number of parameters for operator '" + token + "' at position [" + loc + "]")
            }
            const arg0 = stack.pop()!!;
            try {
                switch (token) {
                    case "unary+":
                    case "unary+pow":
                        stack.push(arg0);
                        break;
                    case "unary-":
                    case "unary-pow": {
                        stack.push(getNegate(arg0));
                        break;
                    }
                    case "!": {
                        stack.push(getFact(arg0));
                        break;
                    }
                }
            } catch (e) {
                console.error(e);
                throw new Error(e.message + " at position [" + loc + "]")
            }
        } else if (functions.has(token)) {
            if (stack.length < 1) {
                throw new Error("Insufficient number of parameters for function '" + token + "' at position [" + loc + "]")
            }
            const arg0 = stack.pop()!!;
            try {
                switch (token) {
                    case "ln":
                        stack.push(arg0.ln());
                        break;
                    case "log":
                        stack.push(arg0.ln().divide(UR_LN10));
                        break;
                    case "exp":
                        stack.push(getPowUR(UR_E, arg0));
                        break;
                    case "sqrt":
                        stack.push(getSqrt(arg0));
                        break;
                    case "sin":
                        if (degreeMode) {
                            stack.push(arg0.multiply(UR_RADIANS_PER_DEGREE).sin());
                        } else {
                            stack.push(arg0.sin());
                        }
                        break;
                    case "cos":
                        if (degreeMode) {
                            stack.push(arg0.multiply(UR_RADIANS_PER_DEGREE).cos());
                        } else {
                            stack.push(arg0.cos());
                        }
                        break;
                    case "tan":
                        if (degreeMode) {
                            stack.push(arg0.multiply(UR_RADIANS_PER_DEGREE).tan());
                        } else {
                            stack.push(arg0.tan());
                        }
                        break;
                    case "asin":
                    case "arcsin":
                        if (degreeMode) {
                            stack.push(arg0.asin().divide(UR_RADIANS_PER_DEGREE));
                        } else {
                            stack.push(arg0.asin());
                        }
                        break;
                    case "acos":
                    case "arccos":
                        if (degreeMode) {
                            stack.push(arg0.acos().divide(UR_RADIANS_PER_DEGREE));
                        } else {
                            stack.push(arg0.acos());
                        }
                        break;
                    case "atan":
                    case "arctan":
                        if (degreeMode) {
                            stack.push(arg0.atan().divide(UR_RADIANS_PER_DEGREE));
                        } else {
                            stack.push(arg0.atan());
                        }
                        break;
                }
            } catch (e) {
                console.error(e);
                throw new Error(e.message + " at position [" + loc + "]")
            }
        } else {
            const firstChar = token[0];
            if (firstChar === "." || (firstChar >= "0" && firstChar <= "9")) {
                // number
                stack.push(getURFromStr(firstChar === "." ? ("0" + token) : token));
            } else if (token === "e") {
                stack.push(UR_E);
            } else if (token === "\u03C0") {
                stack.push(UnifiedReal.PI);
            } else {
                throw new Error("Unknown variable '" + token + "' at position [" + loc + "]")
            }
        }
    }
    if (stack.length != 1) {
        throw new Error("Invalid stack length: " + stack.length);
    }
    return stack.pop()!!;
}
onmessage = function (e: MessageEvent<WorkerRequest>) {
    const msg = e.data;
    switch (msg.type) {
        case "createUR":
            try {
                let ur: UnifiedReal = createUR(msg.expr, msg.degreeMode);
                urList[msg.id] = ur;
                let digitsRequired = ur.digitsRequired();
                postWorkerMessage({
                    type: "createUR",
                    id: msg.id,
                    uid: msg.uid,
                    expr: msg.expr,
                    degreeMode: msg.degreeMode,
                    digitsRequired: digitsRequired,
                    success: true
                } as CreateURResult);
            } catch (e) {
                postWorkerMessage({
                    type: "createUR",
                    id: msg.id,
                    uid: msg.uid,
                    expr: msg.expr,
                    degreeMode: msg.degreeMode,
                    error: String(e)
                } as CreateURResult);
            }
            break;
        case "copyUR":
            urList[msg.id] = urList[msg.fromId];
            break;
        case "removeUR":
            delete urList[msg.id];
            break;
        case "toStringTruncated": {
            try {
                let ur: UnifiedReal = urList[msg.id];
                let result = ur.toStringTruncated(msg.prec);
                postWorkerMessage({
                    type: "toStringTruncated",
                    id: msg.id,
                    uid: msg.uid,
                    prec: msg.prec,
                    result: result
                } as ToStringResult);
            } catch (e) {
                postWorkerMessage({
                    type: "toStringTruncated",
                    id: msg.id,
                    uid: msg.uid,
                    prec: msg.prec,
                    error: String(e)
                } as ToStringResult);
            }
            break;
        }
    }
}
postWorkerMessage({ type: "init" } as InitResult);
