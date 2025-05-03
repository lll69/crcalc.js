/* crcalc.js Copyright 2025 Licensed under the Apache License, Version 2.0 */

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

/*
 * Copyright (C) 2016 The Android Open Source Project
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

/*
 * Copyright (C) 2015 The Android Open Source Project
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

/*
 * The above license covers additions and changes by AOSP authors.
 * The original code is licensed as follows:
 */

//
// Copyright (c) 1999, Silicon Graphics, Inc. -- ALL RIGHTS RESERVED
//
// Permission is granted free of charge to copy, modify, use and distribute
// this software  provided you include the entirety of this notice in all
// copies made.
//
// THIS SOFTWARE IS PROVIDED ON AN AS IS BASIS, WITHOUT WARRANTY OF ANY
// KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, WITHOUT LIMITATION,
// WARRANTIES THAT THE SUBJECT SOFTWARE IS FREE OF DEFECTS, MERCHANTABLE, FIT
// FOR A PARTICULAR PURPOSE OR NON-INFRINGING.   SGI ASSUMES NO RISK AS TO THE
// QUALITY AND PERFORMANCE OF THE SOFTWARE.   SHOULD THE SOFTWARE PROVE
// DEFECTIVE IN ANY RESPECT, SGI ASSUMES NO COST OR LIABILITY FOR ANY
// SERVICING, REPAIR OR CORRECTION.  THIS DISCLAIMER OF WARRANTY CONSTITUTES
// AN ESSENTIAL PART OF THIS LICENSE. NO USE OF ANY SUBJECT SOFTWARE IS
// AUTHORIZED HEREUNDER EXCEPT UNDER THIS DISCLAIMER.
//
// UNDER NO CIRCUMSTANCES AND UNDER NO LEGAL THEORY, WHETHER TORT (INCLUDING,
// WITHOUT LIMITATION, NEGLIGENCE OR STRICT LIABILITY), CONTRACT, OR
// OTHERWISE, SHALL SGI BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL,
// INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY CHARACTER WITH RESPECT TO THE
// SOFTWARE INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF GOODWILL, WORK
// STOPPAGE, LOSS OF DATA, COMPUTER FAILURE OR MALFUNCTION, OR ANY AND ALL
// OTHER COMMERCIAL DAMAGES OR LOSSES, EVEN IF SGI SHALL HAVE BEEN INFORMED OF
// THE POSSIBILITY OF SUCH DAMAGES.  THIS LIMITATION OF LIABILITY SHALL NOT
// APPLY TO LIABILITY RESULTING FROM SGI's NEGLIGENCE TO THE EXTENT APPLICABLE
// LAW PROHIBITS SUCH LIMITATION.  SOME JURISDICTIONS DO NOT ALLOW THE
// EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THAT
// EXCLUSION AND LIMITATION MAY NOT APPLY TO YOU.
//
// These license terms shall be governed by and construed in accordance with
// the laws of the United States and the State of California as applied to
// agreements entered into and to be performed entirely within California
// between California residents.  Any litigation relating to these license
// terms shall be subject to the exclusive jurisdiction of the Federal Courts
// of the Northern District of California (or, absent subject matter
// jurisdiction in such courts, the courts of the State of California), with
// venue lying exclusively in Santa Clara County, California.

// Copyright (c) 2001-2004, Hewlett-Packard Development Company, L.P.
//
// Permission is granted free of charge to copy, modify, use and distribute
// this software  provided you include the entirety of this notice in all
// copies made.
//
// THIS SOFTWARE IS PROVIDED ON AN AS IS BASIS, WITHOUT WARRANTY OF ANY
// KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, WITHOUT LIMITATION,
// WARRANTIES THAT THE SUBJECT SOFTWARE IS FREE OF DEFECTS, MERCHANTABLE, FIT
// FOR A PARTICULAR PURPOSE OR NON-INFRINGING.   HEWLETT-PACKARD ASSUMES
// NO RISK AS TO THE QUALITY AND PERFORMANCE OF THE SOFTWARE.
// SHOULD THE SOFTWARE PROVE DEFECTIVE IN ANY RESPECT,
// HEWLETT-PACKARD ASSUMES NO COST OR LIABILITY FOR ANY
// SERVICING, REPAIR OR CORRECTION.  THIS DISCLAIMER OF WARRANTY CONSTITUTES
// AN ESSENTIAL PART OF THIS LICENSE. NO USE OF ANY SUBJECT SOFTWARE IS
// AUTHORIZED HEREUNDER EXCEPT UNDER THIS DISCLAIMER.
//
// UNDER NO CIRCUMSTANCES AND UNDER NO LEGAL THEORY, WHETHER TORT (INCLUDING,
// WITHOUT LIMITATION, NEGLIGENCE OR STRICT LIABILITY), CONTRACT, OR
// OTHERWISE, SHALL HEWLETT-PACKARD BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL,
// INCIDENTAL, OR CONSEQUENTIAL DAMAGES OF ANY CHARACTER WITH RESPECT TO THE
// SOFTWARE INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF GOODWILL, WORK
// STOPPAGE, LOSS OF DATA, COMPUTER FAILURE OR MALFUNCTION, OR ANY AND ALL
// OTHER COMMERCIAL DAMAGES OR LOSSES, EVEN IF HEWLETT-PACKARD SHALL
// HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGES.
// THIS LIMITATION OF LIABILITY SHALL NOT APPLY TO LIABILITY RESULTING
// FROM HEWLETT-PACKARD's NEGLIGENCE TO THE EXTENT APPLICABLE
// LAW PROHIBITS SUCH LIMITATION.  SOME JURISDICTIONS DO NOT ALLOW THE
// EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THAT
// EXCLUSION AND LIMITATION MAY NOT APPLY TO YOU.
//

const enum CRConstants {
    INTEGER_MIN = -2147483648,
    INTEGER_MAX = 2147483647
}

class ExceptionBase extends Error {
    constructor(type: string, message?: string) {
        super(type + (message ? (": " + message) : message));
    }
}

class PrecisionOverflowException extends ExceptionBase {
    constructor(message?: string) {
        super("PrecisionOverflowException", message);
    }
}

class ArithmeticException extends ExceptionBase {
    constructor(message?: string) {
        super("ArithmeticException", message);
    }
}

class NumberFormatException extends ExceptionBase {
    constructor(message?: string) {
        super("NumberFormatException", message);
    }
}

class ZeroDivisionException extends ArithmeticException {
    constructor() {
        super("Division by zero");
    }
}

class AssertionError extends ExceptionBase {
    constructor(message?: string) {
        super("AssertionError", message);
    }
}

function gcd_n(a: bigint, b: bigint): bigint {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    let temp: bigint;
    while (b !== 0n) {
        temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function abs_n(x: bigint): bigint {
    return x < 0n ? -x : x;
}

function compare_n(x: bigint, y: bigint): number {
    return (x < y) ? -1 : (x === y) ? 0 : 1;
}

function signum_n(x: bigint): number {
    return (x < 0n) ? -1 : (x === 0n) ? 0 : 1;
}

function bitLength_n(t: bigint): number {
    if (t === 0n) {
        return 0;
    }
    if (t < 0n) {
        t = -1n - t;
    }
    let result = 0;
    let t2 = t >> 32n;
    while (t2 !== 0n) {
        result += 32;
        t = t2;
        t2 = t >> 32n;
    }
    let l = 0n, r = 32n, m: bigint;
    while (l < r) {
        m = (l + r + 1n) >> 1n;
        if ((t >> m) === 0n) {
            r = m - 1n;
        } else {
            l = m;
        }
    }
    return result + Number(l) + 1;
}

/**
 * Constructive real numbers, also known as recursive, or computable reals.
 * Each recursive real number is represented as an object that provides an
 * approximation function for the real number.
 * The approximation function guarantees that the generated approximation
 * is accurate to the specified precision.
 * Arithmetic operations on constructive reals produce new such objects;
 * they typically do not perform any real computation.
 * In this sense, arithmetic computations are exact: They produce
 * a description which describes the exact answer, and can be used to
 * later approximate it to arbitrary precision.
 * <P>
 * When approximations are generated, <I>e.g.</i> for output, they are
 * accurate to the requested precision; no cumulative rounding errors
 * are visible.
 * In order to achieve this precision, the approximation function will often
 * need to approximate subexpressions to greater precision than was originally
 * demanded.  Thus the approximation of a constructive real number
 * generated through a complex sequence of operations may eventually require
 * evaluation to very high precision.  This usually makes such computations
 * prohibitively expensive for large numerical problems.
 * But it is perfectly appropriate for use in a desk calculator,
 * for small numerical problems, for the evaluation of expressions
 * computated by a symbolic algebra system, for testing of accuracy claims
 * for floating point code on small inputs, or the like.
 * <P>
 * We expect that the vast majority of uses will ignore the particular
 * implementation, and the member functons <TT>approximate</tt>
 * and <TT>get_appr</tt>.  Such applications will treat <TT>CR</tt> as
 * a conventional numerical type, with an interface modelled on
 * <TT>java.math.BigInteger</tt>.  No subclasses of <TT>CR</tt>
 * will be explicitly mentioned by such a program.
 * <P>
 * All standard arithmetic operations, as well as a few algebraic
 * and transcendal functions are provided.  Constructive reals are
 * immutable; thus all of these operations return a new constructive real.
 * <P>
 * A few uses will require explicit construction of approximation functions.
 * The requires the construction of a subclass of <TT>CR</tt> with
 * an overridden <TT>approximate</tt> function.  Note that <TT>approximate</tt>
 * should only be defined, but never called.  <TT>get_appr</tt>
 * provides the same functionality, but adds the caching necessary to obtain
 * reasonable performance.
 * <P>
 * Any operation may throw <TT>com.hp.creals.AbortedException</tt> if the thread
 * in which it is executing is interrupted.  (<TT>InterruptedException</tt>
 * cannot be used for this purpose, since CR inherits from <TT>Number</tt>.)
 * <P>
 * Any operation may also throw <TT>com.hp.creals.PrecisionOverflowException</tt>
 * If the precision request generated during any subcalculation overflows
 * a 28-bit integer.  (This should be extremely unlikely, except as an
 * outcome of a division by zero, or other erroneous computation.)
 *
 */
abstract class CR {
    /**
     * Must be defined in subclasses of <TT>CR</tt>.
     * Most users can ignore the existence of this method, and will
     * not ever need to define a <TT>CR</tt> subclass.
     * Returns value / 2 ** precision rounded to an integer.
     * The error in the result is strictly < 1.
     * Informally, approximate(n) gives a scaled approximation
     * accurate to 2**n.
     * Implementations may safely assume that precision is
     * at least a factor of 8 away from overflow.
     * Called only with the lock on the <TT>CR</tt> object
     * already held.
     */
    protected abstract approximate(precision: number): bigint;

    /**
     * The smallest precision value with which the above
     * has been called.
     */
    min_prec: number = 0;

    /**
     * The scaled approximation corresponding to min_prec.
     */
    max_appr: bigint;

    /**
     * min_prec and max_val are valid.
     */
    appr_valid: boolean = false;

    // Helper functions
    static bound_log2(n: number): number {
        let abs_n = Math.abs(n);
        return Math.ceil(Math.log((abs_n + 1)) / Math.LN2) ^ 0;
    }

    /**
     * Check that a precision is at least a factor of 8 away from
     * overflowng the integer used to hold a precision spec.
     * We generally perform this check early on, and then convince
     * ourselves that none of the operations performed on precisions
     * inside a function can generate an overflow.
     */
    static check_prec(n: number): void {
        let high = n >> 28;
        // if n is not in danger of overflowing, then the 4 high order
        // bits should be identical.  Thus high is either 0 or -1.
        // The rest of this is to test for either of those in a way
        // that should be as cheap as possible.
        let high_shifted = n >> 29;
        if (0 !== (high ^ high_shifted)) {
            throw new PrecisionOverflowException();
        }
    }

    /**
     * The constructive real number corresponding to a
     * <TT>biginteger</tt>.
     */
    static valueOfN(n: bigint): CR {
        return new int_CR(n);
    }
    public static ZERO: CR/* = CR.valueOfN(0n)*/;
    public static ONE: CR/* = CR.valueOfN(1n)*/;

    /** Multiply k by 2**n. */
    static shift(k: bigint, n: bigint): bigint {
        if (n === 0n) return k;
        if (n < 0n) return k >> -n;
        return k << n;
    }

    /** Multiply by 2**n, rounding result */
    static scale(k: bigint, n: bigint): bigint {
        if (n >= 0n) {
            return k << n;
        } else {
            let adj_k = CR.shift(k, n + 1n) + 1n;
            return adj_k >> 1n;
        }
    }

    /**
     * Identical to approximate(), but maintain and update cache.
     * Returns value / 2 ** prec rounded to an integer.
     * The error in the result is strictly < 1.
     * Produces the same answer as <TT>approximate</tt>, but uses and
     * maintains a cached approximation.
     * Normally not overridden, and called only from <TT>approximate</tt>
     * methods in subclasses.  Not needed if the provided operations
     * on constructive reals suffice.
     */
    public get_appr(precision: number): bigint {
        CR.check_prec(precision);
        if (this.appr_valid && precision >= this.min_prec) {
            return CR.scale(this.max_appr, BigInt(this.min_prec - precision));
        } else {
            let result = this.approximate(precision);
            this.min_prec = precision;
            this.max_appr = result;
            this.appr_valid = true;
            return result;
        }
    }

    /**
     * Return the position of the msd.
     * If x.msd() == n then
     * 2**(n-1) < abs(x) < 2**(n+1)
     * This initial version assumes that max_appr is valid
     * and sufficiently removed from zero
     * that the msd is determined.
     */
    known_msd(): number {
        let length: number;
        if (this.max_appr >= 0n) {
            length = bitLength_n(this.max_appr);
        } else {
            length = bitLength_n(-this.max_appr);
        }
        return this.min_prec + length - 1;
    }

    /**
     * This version may return Integer.MIN_VALUE if the correct
     * answer is < n.
     */
    msd(n: number): number {
        if (!this.appr_valid ||
            this.max_appr <= 1n
            && this.max_appr >= -1n) {
            this.get_appr(n - 1);
            if (abs_n(this.max_appr) <= 1n) {
                // msd could still be arbitrarily far to the right.
                return CRConstants.INTEGER_MIN;
            }
        }
        return this.known_msd();
    }


    /**
     * Functionally equivalent, but iteratively evaluates to higher
     * precision.
     */
    iter_msd(n: number): number {
        let prec = 0;
        let msd: number;
        for (; prec > n + 30; prec = ((prec * 3) >> 1) - 16) {
            msd = this.msd(prec);
            if (msd !== CRConstants.INTEGER_MIN) return msd;
            CR.check_prec(prec);
        }
        return this.msd(n);
    }

    /**
     * This version returns a correct answer eventually, except
     * that it loops forever (or throws an exception when the
     * requested precision overflows) if this constructive real is zero.
     */
    msd_get(): number {
        return this.iter_msd(CRConstants.INTEGER_MIN);
    }

    /**
     * A helper function for toString.
     * Generate a String containing n zeroes.
     */
    static zeroes(n: number): string {
        let a = "";
        for (let i = 0; i < n; ++i) {
            a += "0";
        }
        return a;
    }

    /** 
     * Natural log of 2.  Needed for some prescaling below.
     * ln(2) = 7ln(10/9) - 2ln(25/24) + 3ln(81/80)
     */
    simple_ln(): CR {
        return new prescaled_ln_CR(this.subtract(CR.ONE));
    }
    static ten_ninths: CR/* = CR.valueOfN(10n).divide(CR.valueOfN(9n))*/;
    static twentyfive_twentyfourths: CR/* = CR.valueOfN(25n).divide(CR.valueOfN(24n))*/;
    static eightyone_eightyeths: CR/* = CR.valueOfN(81n).divide(CR.valueOfN(80n))*/;
    static ln2_1: CR/* = CR.valueOfN(7n).multiply(CR.ten_ninths.simple_ln())*/;
    static ln2_2: CR/* =
        CR.valueOfN(2n).multiply(CR.twentyfive_twentyfourths.simple_ln())*/;
    static ln2_3: CR/* = CR.valueOfN(3n).multiply(CR.eightyone_eightyeths.simple_ln())*/;
    static ln2: CR/* = CR.ln2_1.subtract(CR.ln2_2).add(CR.ln2_3)*/;
    static SQRT_HALF: CR/* = new sqrt_CR(CR.ONE.shiftRight(1))*/;

    /**
     * Atan of integer reciprocal.  Used for atan_PI.  Could perhaps be made
     * public.
     */
    static atan_reciprocal(n: number): CR {
        return new integral_atan_CR(n);
    }

    // Other constants used for PI computation.
    static four: CR/* = CR.valueOfN(4n)*/;

    // Public operations.
    /**
     * Return 0 if x = y to within the indicated tolerance,
     * -1 if x < y, and +1 if x > y.  If x and y are indeed
     * equal, it is guaranteed that 0 will be returned.  If
     * they differ by less than the tolerance, anything
     * may happen.  The tolerance allowed is
     * the maximum of (abs(this)+abs(x))*(2**r) and 2**a
     *       @param x        The other constructive real
     *       @param r        Relative tolerance in bits
     *       @param a        Absolute tolerance in bits
     */
    public compareToRA(x: CR, r: number, a: number): number {
        let this_msd = this.iter_msd(a);
        let x_msd = x.iter_msd(this_msd > a ? this_msd : a);
        let max_msd = (x_msd > this_msd ? x_msd : this_msd);
        if (max_msd === CRConstants.INTEGER_MIN) {
            return 0;
        }
        CR.check_prec(r);
        let rel = max_msd + r;
        let abs_prec = (rel > a ? rel : a);
        return this.compareToA(x, abs_prec);
    }

    /**
     * Approximate comparison with only an absolute tolerance.
     * Identical to the three argument version, but without a relative
     * tolerance.
     * Result is 0 if both constructive reals are equal, indeterminate
     * if they differ by less than 2**a.
     *
     *       @param x        The other constructive real
     *       @param a        Absolute tolerance in bits
     */
    public compareToA(x: CR, a: number): number {
        let needed_prec = a - 1;
        let this_appr = this.get_appr(needed_prec);
        let x_appr = x.get_appr(needed_prec);
        let comp1 = compare_n(this_appr, x_appr + 1n);
        if (comp1 > 0) return 1;
        let comp2 = compare_n(this_appr, x_appr - 1n);
        if (comp2 < 0) return -1;
        return 0;
    }

    /**
     * Return -1 if <TT>this &lt; x</tt>, or +1 if <TT>this &gt; x</tt>.
     * Should be called only if <TT>this != x</tt>.
     * If <TT>this == x</tt>, this will not terminate correctly; typically it
     * will run until it exhausts memory.
     * If the two constructive reals may be equal, the two or 3 argument
     * version of compareTo should be used.
     */
    public compareTo(x: CR): number {
        for (let a = -20; ; a *= 2) {
            CR.check_prec(a);
            let result = this.compareToA(x, a);
            if (0 !== result) return result;
        }
    }

    /**
     * Equivalent to <TT>compareToA(CR.valueOf(0), a)</tt>
     */
    public signumA(a: number): number {
        if (this.appr_valid) {
            let quick_try = signum_n(this.max_appr);
            if (0 !== quick_try) return quick_try;
        }
        let needed_prec = a - 1;
        let this_appr = this.get_appr(needed_prec);
        return signum_n(this_appr);
    }


    /**
     * Return -1 if negative, +1 if positive.
     * Should be called only if <TT>this != 0</tt>.
     * In the 0 case, this will not terminate correctly; typically it
     * will run until it exhausts memory.
     * If the two constructive reals may be equal, the one or two argument
     * version of signum should be used.
     */
    public signum(): number {
        for (let a = -20; ; a *= 2) {
            CR.check_prec(a);
            let result = this.signumA(a);
            if (0 !== result) return result;
        }
    }

    /**
     * Return the constructive real number corresponding to the given
     * textual representation and radix.
     *
     *       @param s        [-] digit* [. digit*]
     *       @param radix
     */
    public static valueOfS(s: String, radix?: number): CR {
        if (radix === undefined) {
            radix = 10;
        }
        if (radix !== 2 && radix !== 8 && radix !== 10 && radix !== 16) {
            throw new NumberFormatException("Radix: " + radix);
        }
        let len = s.length;
        let start_pos = 0, point_pos: number;
        let fraction: string;
        while (s.charAt(start_pos) === ' ') ++start_pos;
        while (s.charAt(len - 1) === ' ') --len;
        point_pos = s.indexOf('.', start_pos);
        if (point_pos === -1) {
            point_pos = len;
            fraction = "";
        } else {
            fraction = s.substring(point_pos + 1, len);
        }
        let whole = s.substring(start_pos, point_pos);
        let scaled_result: bigint;
        switch (radix) {
            case 2:
                scaled_result = BigInt("0b" + whole + fraction);
                break;
            case 8:
                scaled_result = BigInt("0o" + whole + fraction);
                break;
            case 10:
                scaled_result = BigInt(whole + fraction);
                break;
            case 16:
                scaled_result = BigInt("0x" + whole + fraction);
                break;
        }
        let divisor = (BigInt(radix) ** BigInt(fraction.length));
        return CR.valueOfN(scaled_result).divide(CR.valueOfN(divisor));
    }

    /**
    * Return a textual representation accurate to <TT>n</tt> places
    * to the right of the decimal point.  <TT>n</tt> must be nonnegative.
    *
    *       @param  n       Number of digits (>= 0) included to the right of decimal point
    *       @param  radix   Base ( >= 2, <= 16) for the resulting representation.
    */
    public toStringR(n: number, radix: number): string {
        let scaled_CR: CR;
        if (16 === radix) {
            scaled_CR = this.shiftLeft(4 * n);
        } else {
            let scale_factor = (BigInt(radix) ** BigInt(n));
            scaled_CR = this.multiply(new int_CR(scale_factor));
        }
        let scaled_int = scaled_CR.get_appr(0);
        let scaled_string = abs_n(scaled_int).toString(radix);
        let result: string;
        if (0 === n) {
            result = scaled_string;
        } else {
            let len = scaled_string.length;
            if (len <= n) {
                // Add sufficient leading zeroes
                let z = CR.zeroes(n + 1 - len);
                scaled_string = z + scaled_string;
                len = n + 1;
            }
            let whole = scaled_string.substring(0, len - n);
            let fraction = scaled_string.substring(len - n);
            result = whole + "." + fraction;
        }
        if (scaled_int < 0n) {
            result = "-" + result;
        }
        return result;
    }


    /**
     * Equivalent to <TT>toStringR(n,10)</tt>
     *
     *       @param  n       Number of digits included to the right of decimal point
     */
    public toStringD(n: number): string {
        return this.toStringR(n, 10);
    }

    /**
     * Equivalent to <TT>toStringR(10, 10)</tt>
     */
    public toString(): string {
        return this.toStringD(10);
    }

    /**
     * Return a BigInteger which differs by less than one from the
     * constructive real.
     */
    public BigIntegerValue(): BigInt {
        return this.get_appr(0);
    }

    /**
     * This value is not precise! Use toStringD and toStringR instead!
     * 
     * Return a double which differs by less than one in the least
     * represented bit from the constructive real.
     * (We're in fact closer to round-to-nearest than that, but we can't and
     * don't promise correct rounding.)
     */
    public doubleValue(): number {
        let my_msd = this.iter_msd(-1080 /* slightly > exp. range */);
        if (CRConstants.INTEGER_MIN === my_msd) return 0.0;
        let needed_prec = my_msd - 60;
        let scaled_int = Number(this.get_appr(needed_prec));
        let may_underflow = (needed_prec < -1000);
        let buffer = new ArrayBuffer(8);
        let bufferView = new DataView(buffer);
        bufferView.setFloat64(0, scaled_int);
        let scaled_int_rep = bufferView.getBigInt64(0);
        let exp_adj = BigInt(may_underflow ? needed_prec + 96 : needed_prec);
        let orig_exp = (scaled_int_rep >> 52n) & 0x7ffn;
        // Original unbiased exponent is > 50. Exp_adj > -1050.
        // Thus the sum must be > the smallest representable exponent
        // of -1023.
        if (orig_exp + exp_adj >= 0x7ff) {
            // Exponent overflowed.
            if (scaled_int < 0.0) {
                return -Infinity;
            } else {
                return Infinity;
            }
        }
        scaled_int_rep += (exp_adj << 52n);
        bufferView.setBigInt64(0, scaled_int_rep);
        let result = bufferView.getFloat64(0);
        if (may_underflow) {
            // Exponent is too large by 96. Compensate, relying on fp arithmetic
            // to handle gradual underflow correctly.
            const two48 = Number(1n << 48n);
            return result / two48 / two48;
        } else {
            return result;
        }
    }

    /**
     * Add two constructive reals.
     */
    public add(x: CR): CR {
        return new add_CR(this, x);
    }

    /**
     * Multiply a constructive real by 2**n.
     * @param n      shift count, may be negative
     */
    public shiftLeft(n: number): CR {
        CR.check_prec(n);
        return new shifted_CR(this, n);
    }

    /**
     * Multiply a constructive real by 2**(-n).
     * @param n      shift count, may be negative
     */
    public shiftRight(n: number): CR {
        CR.check_prec(n);
        return new shifted_CR(this, -n);
    }


    /**
     * Produce a constructive real equivalent to the original, assuming
     * the original was an integer.  Undefined results if the original
     * was not an integer.  Prevents evaluation of digits to the right
     * of the decimal point, and may thus improve performance.
     */
    public assumeInt(): CR {
        return new assumed_int_CR(this);
    }

    /**
     * The additive inverse of a constructive real
     */
    public negate(): CR {
        return new neg_CR(this);
    }

    /**
     * The difference between two constructive reals
     */
    public subtract(x: CR): CR {
        return new add_CR(this, x.negate());
    }

    /**
     * The product of two constructive reals
     */
    public multiply(x: CR): CR {
        return new mult_CR(this, x);
    }

    /**
     * The multiplicative inverse of a constructive real.
     * <TT>x.inverse()</tt> is equivalent to <TT>CR.valueOf(1).divide(x)</tt>.
     */
    public inverse(): CR {
        return new inv_CR(this);
    }

    /**
     * The quotient of two constructive reals.
     */
    public divide(x: CR): CR {
        return new mult_CR(this, x.inverse());
    }

    /**
     * The real number <TT>x</tt> if <TT>this</tt> < 0, or <TT>y</tt> otherwise.
     * Requires <TT>x</tt> = <TT>y</tt> if <TT>this</tt> = 0.
     * Since comparisons may diverge, this is often
     * a useful alternative to conditionals.
     */
    public select(x: CR, y: CR): CR {
        return new select_CR(this, x, y);
    }

    /**
     * The maximum of two constructive reals.
     */
    public max(x: CR): CR {
        return this.subtract(x).select(x, this);
    }

    /**
     * The minimum of two constructive reals.
     */
    public min(x: CR): CR {
        return this.subtract(x).select(this, x);
    }

    /**
     * The absolute value of a constructive reals.
     * Note that this cannot be written as a conditional.
     */
    public abs(): CR {
        return this.select(this.negate(), this);
    }

    /**
     * The exponential function, that is e**<TT>this</tt>.
     */
    public exp(): CR {
        const low_prec = -10;
        let rough_appr = this.get_appr(low_prec);
        // Handle negative arguments directly; negating and computing inverse
        // can be very expensive.
        if (rough_appr > 2n || rough_appr < -2n) {
            let square_root = this.shiftRight(1).exp();
            return square_root.multiply(square_root);
        } else {
            return new prescaled_exp_CR(this);
        }
    }

    /**
     * The ratio of a circle's circumference to its diameter.
     */
    public static PI: CR/* = new gl_pi_CR()*/;

    /**
     * Our old PI implementation. Keep this around for now to allow checking.
     * This implementation may also be faster for BigInteger implementations
     * that support only quadratic multiplication, but exhibit high performance
     * for small computations.  (The standard Android 6 implementation supports
     * subquadratic multiplication, but has high constant overhead.) Many other
     * atan-based formulas are possible, but based on superficial
     * experimentation, this is roughly as good as the more complex formulas.
     */
    public static atan_PI: CR/* = CR.four.multiply(CR.four.multiply(CR.atan_reciprocal(5))
        .subtract(CR.atan_reciprocal(239)))*/;
    // pi/4 = 4*atan(1/5) - atan(1/239)
    static half_pi: CR/* = CR.PI.shiftRight(1)*/;


    /**
    * The trigonometric cosine function.
    */
    public cos(): CR {
        let halfpi_multiples = this.divide(CR.PI).get_appr(-1);
        let abs_halfpi_multiples = abs_n(halfpi_multiples);
        if (abs_halfpi_multiples >= 2n) {
            // Subtract multiples of PI
            let pi_multiples = CR.scale(halfpi_multiples, -1n);
            let adjustment = CR.PI.multiply(CR.valueOfN(pi_multiples));
            if ((pi_multiples & 1n) !== 0n) {
                return this.subtract(adjustment).cos().negate();
            } else {
                return this.subtract(adjustment).cos();
            }
        } else if (abs_n(this.get_appr(-1)) >= 2n) {
            // Scale further with double angle formula
            let cos_half = this.shiftRight(1).cos();
            return cos_half.multiply(cos_half).shiftLeft(1).subtract(CR.ONE);
        } else {
            return new prescaled_cos_CR(this);
        }
    }

    /**
    * The trigonometric sine function.
    */
    public sin(): CR {
        return CR.half_pi.subtract(this).cos();
    }

    /**
    * The trignonometric arc (inverse) sine function.
    */
    public asin(): CR {
        let rough_appr = this.get_appr(-10);
        if (rough_appr > 750n /* 1/sqrt(2) + a bit */) {
            let new_arg = CR.ONE.subtract(this.multiply(this)).sqrt();
            return new_arg.acos();
        } else if (rough_appr < -750n) {
            return this.negate().asin().negate();
        } else {
            return new prescaled_asin_CR(this);
        }
    }

    /**
    * The trignonometric arc (inverse) cosine function.
    */
    public acos(): CR {
        return CR.half_pi.subtract(this.asin());
    }

    /**
    * The natural (base e) logarithm.
    */
    public ln(): CR {
        const low_prec = -4;
        const low_ln_limit = 8n; /* sixteenths, i.e. 1/2 */
        const high_ln_limit = (24n /* 1.5 */); // BigInteger.valueOf(16 + 8 /* 1.5 */);
        const scaled_4 = 64n; // BigInteger.valueOf(4*16);
        let rough_appr = this.get_appr(low_prec); /* In sixteenths */
        if (rough_appr < 0n) {
            throw new ArithmeticException("ln(negative)");
        }
        if (rough_appr <= low_ln_limit) {
            return this.inverse().ln().negate();
        }
        if (rough_appr >= high_ln_limit) {
            if (rough_appr <= scaled_4) {
                let quarter = this.sqrt().sqrt().ln();
                return quarter.shiftLeft(2);
            } else {
                let extra_bits = bitLength_n(rough_appr) - 3;
                let scaled_result = this.shiftRight(extra_bits).ln();
                return scaled_result.add(CR.valueOfN(BigInt(extra_bits)).multiply(CR.ln2));
            }
        }
        return this.simple_ln();
    }

    /**
    * The square root of a constructive real.
    */
    public sqrt(): CR {
        return new sqrt_CR(this);
    }
}

/**
 * A specialization of CR for cases in which approximate() calls
 * to increase evaluation precision are somewhat expensive.
 * If we need to (re)evaluate, we speculatively evaluate to slightly
 * higher precision, miminimizing reevaluations.
 * Note that this requires any arguments to be evaluated to higher
 * precision than absolutely necessary.  It can thus potentially
 * result in lots of wasted effort, and should be used judiciously.
 * This assumes that the order of magnitude of the number is roughly one.
 */
abstract class slow_CR extends CR {
    public get_appr(precision: number): bigint {
        const max_prec = -64;
        const prec_incr = 32;
        slow_CR.check_prec(precision);
        if (this.appr_valid && precision >= this.min_prec) {
            return slow_CR.scale(this.max_appr, BigInt(this.min_prec - precision));
        } else {
            let eval_prec = (precision >= max_prec ? max_prec :
                (precision - prec_incr + 1) & ~(prec_incr - 1));
            let result = this.approximate(eval_prec);
            this.min_prec = eval_prec;
            this.max_appr = result;
            this.appr_valid = true;
            return slow_CR.scale(result, BigInt(eval_prec - precision));
        }
    }
}


/** Representation of an integer constant.  Private. */
class int_CR extends CR {
    value: bigint;
    constructor(n: bigint) {
        super();
        this.value = n;
    }
    protected approximate(p: number): bigint {
        return int_CR.scale(this.value, BigInt(-p));
    }
}

/**
 * Representation of a number that may not have been completely
 * evaluated, but is assumed to be an integer.  Hence we never
 * evaluate beyond the decimal point.
 */
class assumed_int_CR extends CR {
    value: CR;
    constructor(x: CR) {
        super();
        this.value = x;
    }
    protected approximate(p: number): bigint {
        if (p >= 0) {
            return this.value.get_appr(p);
        } else {
            return assumed_int_CR.scale(this.value.get_appr(0), BigInt(-p));
        }
    }
}


/** Representation of the sum of 2 constructive reals.  Private. */
class add_CR extends CR {
    op1: CR;
    op2: CR;
    constructor(x: CR, y: CR) {
        super();
        this.op1 = x;
        this.op2 = y;
    }
    protected approximate(p: number): bigint {
        // Args need to be evaluated so that each error is < 1/4 ulp.
        // Rounding error from the cale call is <= 1/2 ulp, so that
        // final error is < 1 ulp.
        return add_CR.scale(this.op1.get_appr(p - 2) + this.op2.get_appr(p - 2), -2n);
    }
}

/** Representation of a CR multiplied by 2**n */
class shifted_CR extends CR {
    op: CR;
    count: number;
    constructor(x: CR, n: number) {
        super();
        this.op = x;
        this.count = n;
    }
    protected approximate(p: number): bigint {
        return this.op.get_appr(p - this.count);
    }
}

/** Representation of the negation of a constructive real.  Private. */
class neg_CR extends CR {
    op: CR;
    constructor(x: CR) {
        super();
        this.op = x;
    }
    protected approximate(p: number): bigint {
        return -(this.op.get_appr(p));
    }
}

// Representation of:
//      op1     if selector < 0
//      op2     if selector >= 0
// Assumes x = y if s = 0
class select_CR extends CR {
    selector: CR;
    selector_sign: number;
    op1: CR;
    op2: CR;
    constructor(s: CR, x: CR, y: CR) {
        super();
        this.selector = s;
        this.selector_sign = signum_n(s.get_appr(-20));
        this.op1 = x;
        this.op2 = y;
    }
    protected approximate(p: number): bigint {
        if (this.selector_sign < 0) return this.op1.get_appr(p);
        if (this.selector_sign > 0) return this.op2.get_appr(p);
        let op1_appr = this.op1.get_appr(p - 1);
        let op2_appr = this.op2.get_appr(p - 1);
        let diff = abs_n(op1_appr - (op2_appr));
        if (diff <= 1n) {
            // close enough; use either
            return select_CR.scale(op1_appr, -1n);
        }
        // op1 and op2 are different; selector != 0;
        // safe to get sign of selector.
        if (this.selector.signum() < 0) {
            this.selector_sign = -1;
            return select_CR.scale(op1_appr, -1n);
        } else {
            this.selector_sign = 1;
            return select_CR.scale(op2_appr, -1n);
        }
    }
}

// Representation of the product of 2 constructive reals. Private.
class mult_CR extends CR {
    op1: CR;
    op2: CR;
    constructor(x: CR, y: CR) {
        super();
        this.op1 = x;
        this.op2 = y;
    }
    protected approximate(p: number): bigint {
        let half_prec = ((p >> 1) - 1);
        let msd_op1 = this.op1.msd(half_prec);
        let msd_op2: number;

        if (msd_op1 === CRConstants.INTEGER_MIN) {
            msd_op2 = this.op2.msd(half_prec);
            if (msd_op2 === CRConstants.INTEGER_MIN) {
                // Product is small enough that zero will do as an
                // approximation.
                return 0n;
            } else {
                // Swap them, so the larger operand (in absolute value)
                // is first.
                let tmp: CR;
                tmp = this.op1;
                this.op1 = this.op2;
                this.op2 = tmp;
                msd_op1 = msd_op2;
            }
        }
        // msd_op1 is valid at this point.
        let prec2 = p - msd_op1 - 3;    // Precision needed for op2.
        // The appr. error is multiplied by at most
        // 2 ** (msd_op1 + 1)
        // Thus each approximation contributes 1/4 ulp
        // to the rounding error, and the final rounding adds
        // another 1/2 ulp.
        let appr2 = this.op2.get_appr(prec2);
        if (appr2 === 0n) return 0n;
        msd_op2 = this.op2.known_msd();
        let prec1 = p - msd_op2 - 3;    // Precision needed for op1.
        let appr1 = this.op1.get_appr(prec1);
        let scale_digits = prec1 + prec2 - p;
        return mult_CR.scale(appr1 * appr2, BigInt(scale_digits));
    }
}

/**
 * Representation of the multiplicative inverse of a constructive
 * real.  Private.  Should use Newton iteration to refine estimates.
 */
class inv_CR extends CR {
    op: CR;
    constructor(x: CR) {
        super();
        this.op = x;
    }
    protected approximate(p: number): bigint {
        let msd = this.op.msd_get();
        let inv_msd = 1 - msd;
        let digits_needed = inv_msd - p + 3;
        // Number of SIGNIFICANT digits needed for
        // argument, excl. msd position, which may
        // be fictitious, since msd routine can be
        // off by 1.  Roughly 1 extra digit is
        // needed since the relative error is the
        // same in the argument and result, but
        // this isn't quite the same as the number
        // of significant digits.  Another digit
        // is needed to compensate for slop in the
        // calculation.
        // One further bit is required, since the
        // final rounding introduces a 0.5 ulp
        // error.
        let prec_needed = msd - digits_needed;
        let log_scale_factor = -p - prec_needed;
        if (log_scale_factor < 0) return 0n;
        let dividend = 1n << BigInt(log_scale_factor);
        let scaled_divisor = this.op.get_appr(prec_needed);
        let abs_scaled_divisor = abs_n(scaled_divisor);
        let adj_dividend = dividend + (abs_scaled_divisor >> 1n);
        // Adjustment so that final result is rounded.
        let result = adj_dividend / abs_scaled_divisor;
        if (scaled_divisor < 0) {
            return -result;
        } else {
            return result;
        }
    }
}
/**
 * Representation of the exponential of a constructive real.  Private.
 * Uses a Taylor series expansion.  Assumes |x| < 1/2.
 * Note: this is known to be a bad algorithm for
 * floating point.  Unfortunately, other alternatives
 * appear to require precomputed information.
 */
class prescaled_exp_CR extends CR {
    op: CR;
    constructor(x: CR) {
        super();
        this.op = x;
    }
    protected approximate(p: number): bigint {
        if (p >= 1) return 0n;
        let iterations_needed = ((-p) >> 1) + 2;  // conservative estimate > 0.
        // Claim: each intermediate term is accurate
        // to 2*2^calc_precision.
        // Total rounding error in series computation is
        // 2*iterations_needed*2^calc_precision,
        // exclusive of error in op.
        let calc_precision = p - prescaled_exp_CR.bound_log2(2 * iterations_needed)
            - 4; // for error in op, truncation.
        let op_prec = p - 3;
        let op_appr = this.op.get_appr(op_prec);
        let op_prec_big = BigInt(op_prec);
        // Error in argument results in error of < 3/8 ulp.
        // Sum of term eval. rounding error is < 1/16 ulp.
        // Series truncation error < 1/16 ulp.
        // Final rounding error is <= 1/2 ulp.
        // Thus final error is < 1 ulp.
        let scaled_1 = 1n << BigInt(-calc_precision);
        let current_term = scaled_1;
        let current_sum = scaled_1;
        let n = 0;
        let max_trunc_error =
            1n << BigInt(p - 4 - calc_precision);
        while (abs_n(current_term) >= max_trunc_error) {
            n = (n + 1) ^ 0;
            /* current_term = current_term * op / n */
            current_term = prescaled_exp_CR.scale(current_term * op_appr, op_prec_big);
            current_term = current_term / BigInt(n);
            current_sum = current_sum + current_term;
        }
        return prescaled_exp_CR.scale(current_sum, BigInt(calc_precision - p));
    }
}

/**
 * Representation of the cosine of a constructive real.  Private.
 * Uses a Taylor series expansion.  Assumes |x| < 1.
 */
class prescaled_cos_CR extends slow_CR {
    op: CR;
    constructor(x: CR) {
        super();
        this.op = x;
    }
    protected approximate(p: number): bigint {
        if (p >= 1) return 0n;
        let iterations_needed = ((-p) >> 1) + 4;  // conservative estimate > 0.
        // Claim: each intermediate term is accurate
        // to 2*2^calc_precision.
        // Total rounding error in series computation is
        // 2*iterations_needed*2^calc_precision,
        // exclusive of error in op.
        let calc_precision = p - prescaled_cos_CR.bound_log2(2 * iterations_needed)
            - 4; // for error in op, truncation.
        let op_prec = p - 2;
        let op_appr = this.op.get_appr(op_prec);
        let op_prec_big = BigInt(op_prec);
        // Error in argument results in error of < 1/4 ulp.
        // Cumulative arithmetic rounding error is < 1/16 ulp.
        // Series truncation error < 1/16 ulp.
        // Final rounding error is <= 1/2 ulp.
        // Thus final error is < 1 ulp.
        let current_term: bigint;
        let n: number;
        let max_trunc_error =
            1n << BigInt(p - 4 - calc_precision);
        n = 0;
        current_term = 1n << BigInt(-calc_precision);
        let current_sum = current_term;
        while (abs_n(current_term) >= max_trunc_error) {
            n += 2;
            /* current_term = - current_term * op * op / n * (n - 1)   */
            current_term = prescaled_cos_CR.scale(current_term * op_appr, op_prec_big);
            current_term = prescaled_cos_CR.scale(current_term * op_appr, op_prec_big);
            let divisor = BigInt(-n) * BigInt(n - 1);
            current_term = current_term / divisor;
            current_sum = current_sum + current_term;
        }
        return prescaled_cos_CR.scale(current_sum, BigInt(calc_precision - p));
    }
}

/**
 * The constructive real atan(1/n), where n is a small integer
 * > base.
 * This gives a simple and moderately fast way to compute PI.
 */
class integral_atan_CR extends slow_CR {
    op: number;
    constructor(x: number) {
        super();
        this.op = x;
    }
    protected approximate(p: number): bigint {
        if (p >= 1) return 0n;
        let iterations_needed = ((-p) >> 1) + 2;  // conservative estimate > 0.
        // Claim: each intermediate term is accurate
        // to 2*base^calc_precision.
        // Total rounding error in series computation is
        // 2*iterations_needed*base^calc_precision,
        // exclusive of error in op.
        let calc_precision = p - integral_atan_CR.bound_log2(2 * iterations_needed)
            - 2; // for error in op, truncation.
        // Error in argument results in error of < 3/8 ulp.
        // Cumulative arithmetic rounding error is < 1/4 ulp.
        // Series truncation error < 1/4 ulp.
        // Final rounding error is <= 1/2 ulp.
        // Thus final error is < 1 ulp.
        let scaled_1 = 1n << BigInt(-calc_precision);
        let big_op = BigInt(this.op);
        let big_op_squared = BigInt(this.op * this.op);
        let op_inverse = scaled_1 / big_op;
        let current_power = op_inverse;
        let current_term = op_inverse;
        let current_sum = op_inverse;
        let current_sign = 1;
        let n = 1;
        let max_trunc_error =
            1n << BigInt(p - 2 - calc_precision);
        while (abs_n(current_term) >= (max_trunc_error)) {
            n += 2;
            current_power = current_power / big_op_squared;
            current_sign = -current_sign;
            current_term =
                current_power / (BigInt(current_sign * n));
            current_sum = current_sum + current_term;
        }
        return integral_atan_CR.scale(current_sum, BigInt(calc_precision - p));
    }
}

/** Representation for ln(1 + op) */
class prescaled_ln_CR extends slow_CR {
    op: CR;
    constructor(x: CR) {
        super();
        this.op = x;
    }
    /**
     * Compute an approximation of ln(1+x) to precision
     * prec. This assumes |x| < 1/2.
     * It uses a Taylor series expansion.
     * Unfortunately there appears to be no way to take
     * advantage of old information.
     * Note: this is known to be a bad algorithm for
     * floating point.  Unfortunately, other alternatives
     * appear to require precomputed tabular information.
     */
    protected approximate(p: number): bigint {
        if (p >= 0) return 0n;
        let iterations_needed = -p;  // conservative estimate > 0.
        // Claim: each intermediate term is accurate
        // to 2*2^calc_precision.  Total error is
        // 2*iterations_needed*2^calc_precision
        // exclusive of error in op.
        let calc_precision = p - prescaled_ln_CR.bound_log2(2 * iterations_needed)
            - 4; // for error in op, truncation.
        let op_prec = p - 3;
        let op_appr = this.op.get_appr(op_prec);
        let op_prec_big = BigInt(op_prec);
        // Error analysis as for exponential.
        let x_nth = prescaled_ln_CR.scale(op_appr, BigInt(op_prec - calc_precision));
        let current_term = x_nth;  // x**n
        let current_sum = current_term;
        let n = 1;
        let current_sign = 1;   // (-1)^(n-1)
        let max_trunc_error =
            1n << BigInt(p - 4 - calc_precision);
        while (abs_n(current_term) >= (max_trunc_error)) {
            n += 1;
            current_sign = -current_sign;
            x_nth = prescaled_ln_CR.scale(x_nth * op_appr, op_prec_big);
            current_term = x_nth / (BigInt(n * current_sign));
            // x**n / (n * (-1)**(n-1))
            current_sum = current_sum + (current_term);
        }
        return prescaled_ln_CR.scale(current_sum, BigInt(calc_precision - p));
    }
}

/** 
 * Representation of the arcsine of a constructive real.  Private.
 * Uses a Taylor series expansion.  Assumes |x| < (1/2)^(1/3).
 */
class prescaled_asin_CR extends slow_CR {
    op: CR;
    constructor(x: CR) {
        super();
        this.op = x;
    }
    protected approximate(p: number): bigint {
        // The Taylor series is the sum of x^(2n+1) * (2n)!/(4^n n!^2 (2n+1))
        // Note that (2n)!/(4^n n!^2) is always less than one.
        // (The denominator is effectively 2n*2n*(2n-2)*(2n-2)*...*2*2
        // which is clearly > (2n)!)
        // Thus all terms are bounded by x^(2n+1).
        // Unfortunately, there's no easy way to prescale the argument
        // to less than 1/sqrt(2), and we can only approximate that.
        // Thus the worst case iteration count is fairly high.
        // But it doesn't make much difference.
        if (p >= 2) return 0n;  // Never bigger than 4.
        let iterations_needed = -3 * ((p) >> 1) + 4;
        // conservative estimate > 0.
        // Follows from assumed bound on x and
        // the fact that only every other Taylor
        // Series term is present.

        // Claim: each intermediate term is accurate
        // to 2*2^calc_precision.
        // Total rounding error in series computation is
        // 2*iterations_needed*2^calc_precision,
        // exclusive of error in op.
        let calc_precision = p - prescaled_asin_CR.bound_log2(2 * iterations_needed)
            - 4; // for error in op, truncation.
        let op_prec = p - 3;  // always <= -2
        let op_appr = this.op.get_appr(op_prec);
        let op_prec_big_p2 = BigInt(op_prec + 2);
        let op_prec_big_n2 = BigInt(op_prec - 2);
        // Error in argument results in error of < 1/4 ulp.
        // (Derivative is bounded by 2 in the specified range and we use
        // 3 extra digits.)
        // Ignoring the argument error, each term has an error of
        // < 3ulps relative to calc_precision, which is more precise than p.
        // Cumulative arithmetic rounding error is < 3/16 ulp (relative to p).
        // Series truncation error < 2/16 ulp.  (Each computed term
        // is at most 2/3 of last one, so some of remaining series <
        // 3/2 * current term.)
        // Final rounding error is <= 1/2 ulp.
        // Thus final error is < 1 ulp (relative to p).
        let max_last_term =
            1n << BigInt(p - 4 - calc_precision);
        let exp = 1; // Current exponent, = 2n+1 in above expression
        let current_term = op_appr << BigInt(op_prec - calc_precision);
        let current_sum = current_term;
        let current_factor = current_term;
        // Current scaled Taylor series term
        // before division by the exponent.
        // Accurate to 3 ulp at calc_precision.
        while (abs_n(current_term) >= (max_last_term)) {
            exp += 2;
            // current_factor = current_factor * op * op * (exp-1) * (exp-2) /
            // (exp-1) * (exp-1), with the two exp-1 factors cancelling,
            // giving
            // current_factor = current_factor * op * op * (exp-2) / (exp-1)
            // Thus the error any in the previous term is multiplied by
            // op^2, adding an error of < (1/2)^(2/3) < 2/3 the original
            // error.
            current_factor = current_factor * (BigInt(exp - 2));
            current_factor = prescaled_asin_CR.scale(current_factor * op_appr, op_prec_big_p2);
            // Carry 2 extra bits of precision forward; thus
            // this effectively introduces 1/8 ulp error.
            current_factor = current_factor * op_appr;
            let divisor = BigInt(exp - 1);
            current_factor = current_factor / divisor;
            // Another 1/4 ulp error here.
            current_factor = prescaled_asin_CR.scale(current_factor, op_prec_big_n2);
            // Remove extra 2 bits.  1/2 ulp rounding error.

            // Current_factor has original 3 ulp rounding error, which we
            // reduced by 1, plus < 1 ulp new rounding error.
            current_term = current_factor / (BigInt(exp));
            // Contributes 1 ulp error to sum plus at most 3 ulp
            // from current_factor.
            current_sum = current_sum + current_term;
        }
        return prescaled_asin_CR.scale(current_sum, BigInt(calc_precision - p));
    }
}

class sqrt_CR extends CR {
    op: CR;
    // Explicitly provide an initial approximation.
    // Useful for arithmetic geometric mean algorithms, where we've previously
    // computed a very similar square root.
    constructor(x: CR, min_p: number = 0, max_a: bigint | null = null) {
        super();
        this.op = x;
        this.min_prec = min_p;
        if (max_a !== null) {
            this.max_appr = max_a;
            this.appr_valid = true;
        }
    }
    protected approximate(p: number): bigint {
        // Conservative estimate of number of
        // significant bits in double precision
        // computation.
        const fp_prec = 50;
        const fp_op_prec = 60;
        const fp_op_prec_big = 60n;

        let max_op_prec_needed = (p << 1) - 1;
        let msd = this.op.iter_msd(max_op_prec_needed);
        if (msd <= max_op_prec_needed) return 0n;
        let result_msd = (msd) >> 1;                 // +- 1
        let result_digits = result_msd - p;     // +- 2
        if (result_digits > fp_prec) {
            // Compute less precise approximation and use a Newton iter.
            let appr_digits = ((result_digits) >> 1) + 6;
            // This should be conservative.  Is fewer enough?
            let appr_prec = result_msd - appr_digits;
            let prod_prec = appr_prec << 1;
            // First compute the argument to maximal precision, so we don't end up
            // reevaluating it incrementally.
            let op_appr = this.op.get_appr(prod_prec);
            let last_appr = this.get_appr(appr_prec);
            // Compute (last_appr * last_appr + op_appr) / last_appr / 2
            // while adjusting the scaling to make everything work
            let prod_prec_scaled_numerator =
                (last_appr * last_appr) + (op_appr);
            let scaled_numerator =
                sqrt_CR.scale(prod_prec_scaled_numerator, BigInt(appr_prec - p));
            let shifted_result = scaled_numerator / last_appr;
            return (shifted_result + 1n) >> (1n);
        } else {
            // Use a double precision floating point approximation.
            // Make sure all precisions are even
            let op_prec = (msd - fp_op_prec) & ~1;
            let working_prec = op_prec - fp_op_prec;
            let scaled_bi_appr = this.op.get_appr(op_prec)
                << (fp_op_prec_big);
            let scaled_appr = Number(scaled_bi_appr);
            if (scaled_appr < 0.0)
                throw new ArithmeticException("sqrt(negative)");
            let scaled_fp_sqrt = Math.sqrt(scaled_appr);
            let scaled_sqrt = BigInt(Math.floor(scaled_fp_sqrt));
            let shift_count = ((working_prec) >> 1) - p;
            return sqrt_CR.shift(scaled_sqrt, BigInt(shift_count));
        }
    }
}

/**
 * The constant PI, computed using the Gauss-Legendre alternating
 * arithmetic-geometric mean algorithm:
 *
 *      a[0] = 1
 *      b[0] = 1/sqrt(2)
 *      t[0] = 1/4
 *      p[0] = 1
 *
 *      a[n+1] = (a[n] + b[n])/2        (arithmetic mean, between 0.8 and 1)
 *      b[n+1] = sqrt(a[n] * b[n])      (geometric mean, between 0.7 and 1)
 *      t[n+1] = t[n] - (2^n)(a[n]-a[n+1])^2,  (always between 0.2 and 0.25)
 *
 *      pi is then approximated as (a[n+1]+b[n+1])^2 / 4*t[n+1].
 */
class gl_pi_CR extends slow_CR {
    // In addition to the best approximation kept by the CR base class, we keep
    // the entire sequence b[n], to the extent we've needed it so far.  Each
    // reevaluation leads to slightly different sqrt arguments, but the
    // previous result can be used to avoid repeating low precision Newton
    // iterations for the sqrt approximation.
    b_prec: (number | null)[];
    b_val: (bigint | null)[];
    constructor() {
        super();
        this.b_prec = [null];  // Zeroth entry unused.
        this.b_val = [null];
    }
    // sqrt(1/2)

    protected approximate(p: number): bigint {
        const TOLERANCE = 4n;
        // Get us back into a consistent state if the last computation
        // was interrupted after pushing onto b_prec.
        if (this.b_prec.length > this.b_val.length) {
            this.b_prec.pop();
        }
        // Rough approximations are easy.
        if (p >= 0) return gl_pi_CR.scale(3n, BigInt(-p));
        // We need roughly log2(p) iterations.  Each iteration should
        // contribute no more than 2 ulps to the error in the corresponding
        // term (a[n], b[n], or t[n]).  Thus 2log2(n) bits plus a few for the
        // final calulation and rounding suffice.
        const extra_eval_prec =
            (Math.ceil(Math.log(-p) / Math.LN2) + 10) ^ 0;
        const extra_eval_prec_bign = BigInt(-extra_eval_prec);
        // All our terms are implicitly scaled by eval_prec.
        const eval_prec = p - extra_eval_prec;
        const eval_prec_bign = BigInt(-eval_prec);
        let a = 1n << eval_prec_bign;
        let b = gl_pi_CR.SQRT_HALF.get_appr(eval_prec);
        let t = 1n << BigInt(-eval_prec - 2);
        let n = 0;
        while ((a - b - TOLERANCE) > 0n) {
            // Current values correspond to n, next_ values to n + 1
            // b_prec.size() == b_val.size() >= n + 1
            let next_a = (a + b) >> 1n;
            let next_b;
            let a_diff = a - next_a;
            let b_prod = (a * b) >> eval_prec_bign;
            // We compute square root approximations using a nested
            // temporary CR computation, to avoid implementing BigInteger
            // square roots separately.
            let b_prod_as_CR = gl_pi_CR.valueOfN(b_prod).shiftRight(-eval_prec);
            if (this.b_prec.length === n + 1) {
                // Add an n+1st slot.
                // Take care to make this exception-safe; b_prec and b_val
                // must remain consistent, even if we are interrupted, or run
                // out of memory. It's OK to just push on b_prec in that case.
                let next_b_as_CR = b_prod_as_CR.sqrt();
                next_b = next_b_as_CR.get_appr(eval_prec);
                let scaled_next_b = gl_pi_CR.scale(next_b, extra_eval_prec_bign);
                this.b_prec.push(p);
                this.b_val.push(scaled_next_b);
            } else {
                // Reuse previous approximation to reduce sqrt iterations,
                // hopefully to one.
                let next_b_as_CR =
                    new sqrt_CR(b_prod_as_CR,
                        this.b_prec[n + 1] as number, this.b_val[n + 1]);
                next_b = next_b_as_CR.get_appr(eval_prec);
                // We assume that set() doesn't throw for any reason.
                this.b_prec[n + 1] = p;
                this.b_val[n + 1] = gl_pi_CR.scale(next_b, extra_eval_prec_bign);
            }
            // b_prec.size() == b_val.size() >= n + 2
            let next_t =
                t - ((a_diff * a_diff)
                    << BigInt(n + eval_prec));  // shift dist. usually neg.
            a = next_a;
            b = next_b;
            t = next_t;
            ++n;
        }
        let sum = a + b;
        let result = (sum * sum / t) >> 2n;
        return gl_pi_CR.scale(result, extra_eval_prec_bign);
    }
}

CR.ZERO = CR.valueOfN(0n);
CR.ONE = CR.valueOfN(1n);
CR.ten_ninths = CR.valueOfN(10n).divide(CR.valueOfN(9n));
CR.twentyfive_twentyfourths = CR.valueOfN(25n).divide(CR.valueOfN(24n));
CR.eightyone_eightyeths = CR.valueOfN(81n).divide(CR.valueOfN(80n));
CR.ln2_1 = CR.valueOfN(7n).multiply(CR.ten_ninths.simple_ln());
CR.ln2_2 =
    CR.valueOfN(2n).multiply(CR.twentyfive_twentyfourths.simple_ln());
CR.ln2_3 = CR.valueOfN(3n).multiply(CR.eightyone_eightyeths.simple_ln());
CR.ln2 = CR.ln2_1.subtract(CR.ln2_2).add(CR.ln2_3);
CR.SQRT_HALF = new sqrt_CR(CR.ONE.shiftRight(1));
CR.four = CR.valueOfN(4n);
CR.PI = new gl_pi_CR();
CR.atan_PI = CR.four.multiply(CR.four.multiply(CR.atan_reciprocal(5))
    .subtract(CR.atan_reciprocal(239)));
CR.half_pi = CR.PI.shiftRight(1);

abstract class UnaryCRFunction {
    public abstract execute(x: CR): CR;
}

// Subclasses of UnaryCRFunction for various built-in functions.
class sin_UnaryCRFunction extends UnaryCRFunction {
    public execute(x: CR): CR {
        return x.sin();
    }
}

class cos_UnaryCRFunction extends UnaryCRFunction {
    public execute(x: CR): CR {
        return x.cos();
    }
}

class tan_UnaryCRFunction extends UnaryCRFunction {
    public execute(x: CR): CR {
        return x.sin().divide(x.cos());
    }
}

class asin_UnaryCRFunction extends UnaryCRFunction {
    public execute(x: CR): CR {
        return x.asin();
    }
}

class acos_UnaryCRFunction extends UnaryCRFunction {
    public execute(x: CR): CR {
        return x.acos();
    }
}

// This uses the identity (sin x)^2 = (tan x)^2/(1 + (tan x)^2)
// Since we know the tangent of the result, we can get its sine,
// and then use the asin function.  Note that we don't always
// want the positive square root when computing the sine.
class atan_UnaryCRFunction extends UnaryCRFunction {
    one: CR = CR.ONE;
    public execute(x: CR): CR {
        let x2 = x.multiply(x);
        let abs_sin_atan = x2.divide(this.one.add(x2)).sqrt();
        let sin_atan = x.select(abs_sin_atan.negate(), abs_sin_atan);
        return sin_atan.asin();
    }
}

const UnaryCRFunctions = Object.freeze({
    sinFunction: new sin_UnaryCRFunction(),
    cosFunction: new cos_UnaryCRFunction(),
    tanFunction: new tan_UnaryCRFunction(),
    asinFunction: new asin_UnaryCRFunction(),
    acosFunction: new acos_UnaryCRFunction(),
    atanFunction: new atan_UnaryCRFunction()
});

const enum BoundedRationalConstants {
    MAX_SIZE = 10000 // total, in bits
}

/**
 * Rational numbers that may turn to null if they get too big.
 * For many operations, if the length of the nuumerator plus the length of the denominator exceeds
 * a maximum size, we simply return null, and rely on our caller do something else.
 * We currently never return null for a pure integer or for a BoundedRational that has just been
 * constructed.
 *
 * We also implement a number of irrational functions.  These return a non-null result only when
 * the result is known to be rational.
 */
class BoundedRational {
    private mNum: bigint;
    private mDen: bigint;

    constructor(n: bigint, d: bigint = 1n) {
        this.mNum = n;
        this.mDen = d;
    }

    /**
     * Return the BoundedRational number corresponding to the given
     * textual representation and radix.
     *
     *       @param s        [-] digit* [. digit*]
     *       @param radix
     */
    public static valueOfS(s: String, radix?: number): BoundedRational {
        if (radix === undefined) {
            radix = 10;
        }
        if (radix !== 2 && radix !== 8 && radix !== 10 && radix !== 16) {
            throw new NumberFormatException("Radix: " + radix);
        }
        let len = s.length;
        let start_pos = 0, point_pos: number;
        let fraction: string;
        while (s.charAt(start_pos) === ' ') ++start_pos;
        while (s.charAt(len - 1) === ' ') --len;
        point_pos = s.indexOf('.', start_pos);
        if (point_pos === -1) {
            point_pos = len;
            fraction = "";
        } else {
            fraction = s.substring(point_pos + 1, len);
        }
        let whole = s.substring(start_pos, point_pos);
        let scaled_result: bigint;
        switch (radix) {
            case 2:
                scaled_result = BigInt("0b" + whole + fraction);
                break;
            case 8:
                scaled_result = BigInt("0o" + whole + fraction);
                break;
            case 10:
                scaled_result = BigInt(whole + fraction);
                break;
            case 16:
                scaled_result = BigInt("0x" + whole + fraction);
                break;
        }
        let divisor = (BigInt(radix) ** BigInt(fraction.length));
        return new BoundedRational(scaled_result, divisor);
    }

    /**
     * Convert to String reflecting raw representation.
     * Debug or log messages only, not pretty.
     */
    public toString(): string {
        return this.mNum.toString() + "/" + this.mDen.toString();
    }

    /**
     * Convert to readable String.
     * Intended for output to user.  More expensive, less useful for debugging than
     * toString().  Not internationalized.
     */
    public toNiceString(): string {
        let nicer = this.reduce().positiveDen();
        let result = nicer.mNum.toString();
        if (nicer.mDen !== 1n) {
            result += "/" + nicer.mDen;
        }
        return result;
    }

    public static toString(r: BoundedRational | null) {
        if (r === null) {
            return "not a small rational";
        }
        return r.toString();
    }

    /**
     * Returns a truncated (rounded towards 0) representation of the result.
     * Includes n digits to the right of the decimal point.
     * @param n result precision, >= 0
     */
    public toStringTruncated(n: number): string {
        let digits = (abs_n(this.mNum) * (10n ** BigInt(n)) / abs_n(this.mDen)).toString();
        let len = digits.length;
        if (len < n + 1) {
            digits = "0".repeat(n + 1 - len) + digits;
            len = n + 1;
        }
        return (this.signum() < 0 ? "-" : "") + digits.substring(0, len - n) + "."
            + digits.substring(len - n);
    }

    public crValue(): CR {
        return CR.valueOfN(this.mNum).divide(CR.valueOfN(this.mDen));
    }

    public intValue(): number {
        let reduced = this.reduce();
        if (reduced.mDen !== 1n) {
            throw new ArithmeticException("intValue of non-int");
        }
        return Number(reduced.mNum);
    }

    // Approximate number of bits to left of binary point.
    // Negative indicates leading zeroes to the right of binary point.
    public wholeNumberBits(): number {
        if (this.mNum === 0n) {
            return CRConstants.INTEGER_MIN;
        } else {
            return bitLength_n(this.mNum) - bitLength_n(this.mDen);
        }
    }

    /**
     * Is this number too big for us to continue with rational arithmetic?
     * We return fals for integers on the assumption that we have no better fallback.
     */
    private tooBig(): boolean {
        if (this.mDen === 1n) {
            return false;
        }
        return (bitLength_n(this.mNum) + bitLength_n(this.mDen) > BoundedRationalConstants.MAX_SIZE);
    }

    /**
     * Return an equivalent fraction with a positive denominator.
     */
    private positiveDen(): BoundedRational {
        if (this.mDen > 0n) {
            return this;
        }
        return new BoundedRational(-this.mNum, -this.mDen);
    }

    /**
     * Return an equivalent fraction in lowest terms.
     * Denominator sign may remain negative.
     */
    private reduce(): BoundedRational {
        if (this.mDen === 1n) {
            return this;  // Optimization only
        }
        let divisor = gcd_n(this.mNum, this.mDen);
        return new BoundedRational(this.mNum / divisor, this.mDen / divisor);
    }

    /**
     * Return a possibly reduced version of r that's not tooBig().
     * Return null if none exists.
     */
    private static maybeReduce(r: BoundedRational | null): BoundedRational | null {
        if (r === null) return null;
        // Reduce randomly, with 1/16 probability, or if the result is too big.
        if (!r.tooBig() && (Math.random() < (1 / 16))) {
            return r;
        }
        let result = r.positiveDen();
        result = result.reduce();
        if (!result.tooBig()) {
            return result;
        }
        return null;
    }

    public compareTo(r: BoundedRational): number {
        // Compare by multiplying both sides by denominators, invert result if denominator product
        // was negative.
        return compare_n(this.mNum * r.mDen, r.mNum * this.mDen) * signum_n(this.mDen)
            * signum_n(r.mDen);
    }

    public signum(): number {
        return signum_n(this.mNum) * signum_n(this.mDen);
    }

    public equals(r: BoundedRational): boolean {
        return r !== null && this.compareTo(r) === 0;
    }

    // We use static methods for arithmetic, so that we can easily handle the null case.  We try
    // to catch domain errors whenever possible, sometimes even when one of the arguments is null,
    // but not relevant.

    /**
     * Returns equivalent BigInteger result if it exists, null if not.
     */
    public static asBigInteger(r: BoundedRational | null): bigint | null {
        if (r === null) {
            return null;
        }
        if (r.mNum % r.mDen === 0n) {
            return r.mNum / r.mDen;
        } else {
            return null;
        }
    }

    public static add(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null {
        if (r1 === null || r2 === null) {
            return null;
        }
        let den = r1.mDen * r2.mDen;
        let num = (r1.mNum * r2.mDen) + (r2.mNum * r1.mDen);
        return BoundedRational.maybeReduce(new BoundedRational(num, den));
    }

    /**
     * Return the argument, but with the opposite sign.
     * Returns null only for a null argument.
     */
    public static negate(r: BoundedRational | null): BoundedRational | null {
        if (r === null) {
            return null;
        }
        return new BoundedRational(-r.mNum, r.mDen);
    }

    public static subtract(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null {
        return BoundedRational.add(r1, BoundedRational.negate(r2));
    }

    /**
     * Return product of r1 and r2 without reducing the result.
     */
    private static rawMultiply(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null {
        // It's tempting but marginally unsound to reduce 0 * null to 0.  The null could represent
        // an infinite value, for which we failed to throw an exception because it was too big.
        if (r1 === null || r2 === null) {
            return null;
        }
        // Optimize the case of our special ONE constant, since that's cheap and somewhat frequent.
        if (r1 === BoundedRational.ONE) {
            return r2;
        }
        if (r2 === BoundedRational.ONE) {
            return r1;
        }
        let num = r1.mNum * r2.mNum;
        let den = r1.mDen * r2.mDen;
        return new BoundedRational(num, den);
    }

    public static multiply(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null {
        return BoundedRational.maybeReduce(BoundedRational.rawMultiply(r1, r2));
    }

    /**
     * Return the reciprocal of r (or null if the argument was null).
     */
    public static inverse(r: BoundedRational | null): BoundedRational | null {
        if (r === null) {
            return null;
        }
        if (r.mNum === 0n) {
            throw new ZeroDivisionException();
        }
        return new BoundedRational(r.mDen, r.mNum);
    }

    public static divide(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null {
        return BoundedRational.multiply(r1, BoundedRational.inverse(r2));
    }

    public static sqrt(r: BoundedRational | null): BoundedRational | null {
        // Return non-null if numerator and denominator are small perfect squares.
        if (r === null) {
            return null;
        }
        r = r.positiveDen().reduce();
        if (r.mNum < 0n) {
            throw new ArithmeticException("sqrt(negative)");
        }
        let num_double_sqrt = Math.round(Math.sqrt(Number(r.mNum)));
        if (num_double_sqrt === Infinity) {
            return null;
        }
        let num_sqrt = BigInt(num_double_sqrt);
        if ((num_sqrt * num_sqrt) !== r.mNum) {
            return null;
        }
        let num_den_sqrt = Math.round(Math.sqrt(Number(r.mDen)));
        if (num_den_sqrt === Infinity) {
            return null;
        }
        let den_sqrt = BigInt(num_den_sqrt);
        if ((den_sqrt * den_sqrt) !== r.mDen) {
            return null;
        }
        return new BoundedRational(num_sqrt, den_sqrt);
    }

    public static ZERO: BoundedRational = new BoundedRational(0n);
    public static HALF: BoundedRational = new BoundedRational(1n, 2n);
    public static MINUS_HALF: BoundedRational = new BoundedRational(-1n, 2n);
    public static THIRD: BoundedRational = new BoundedRational(1n, 3n);
    public static QUARTER: BoundedRational = new BoundedRational(1n, 4n);
    public static SIXTH: BoundedRational = new BoundedRational(1n, 6n);
    public static ONE: BoundedRational = new BoundedRational(1n);
    public static MINUS_ONE: BoundedRational = new BoundedRational(-1n);
    public static TWO: BoundedRational = new BoundedRational(2n);
    public static MINUS_TWO: BoundedRational = new BoundedRational(-2n);
    public static TEN: BoundedRational = new BoundedRational(10n);
    public static TWELVE: BoundedRational = new BoundedRational(12n);

    /**
     * Compute integral power of this, assuming this has been reduced and exp is >= 0.
     */
    private rawPow(exp: bigint): BoundedRational | null {
        if (exp === 1n) {
            return this;
        }
        if ((exp & 1n) === 1n) {
            return BoundedRational.rawMultiply(this.rawPow(exp - 1n), this);
        }
        if (exp === 0n) {
            return BoundedRational.ONE;
        }
        let tmp = this.rawPow(exp >> 1n);

        let result = BoundedRational.rawMultiply(tmp, tmp);
        if (result === null || result.tooBig()) {
            return null;
        }
        return result;
    }

    /**
     * Compute an integral power of this.
     */
    public pow(exp: bigint): BoundedRational | null {
        let expSign = signum_n(exp);
        if (expSign === 0) {
            // Questionable if base has undefined or zero value.
            // java.lang.Math.pow() returns 1 anyway, so we do the same.
            return BoundedRational.ONE;
        }
        if (exp === 1n) {
            return this;
        }
        // Reducing once at the beginning means there's no point in reducing later.
        let reduced = this.reduce().positiveDen();
        // First handle cases in which huge exponents could give compact results.
        if (reduced.mDen === 1n) {
            if (reduced.mNum === 0n) {
                return BoundedRational.ZERO;
            }
            if (reduced.mNum === 1n) {
                return BoundedRational.ONE;
            }
            if (reduced.mNum === -1n) {
                if ((exp & 1n) === 1n) {
                    return BoundedRational.MINUS_ONE;
                } else {
                    return BoundedRational.ONE;
                }
            }
        }
        if (bitLength_n(exp) > 1000) {
            // Stack overflow is likely; a useful rational result is not.
            return null;
        }
        if (expSign < 0) {
            return BoundedRational.inverse(reduced)!.rawPow(-exp);
        } else {
            return reduced.rawPow(exp);
        }
    }

    public static pow(base: BoundedRational | null, exp: BoundedRational | null): BoundedRational | null {
        if (exp === null) {
            return null;
        }
        if (base === null) {
            return null;
        }
        exp = exp.reduce().positiveDen();
        if (exp.mDen !== 1n) {
            return null;
        }
        return base.pow(exp.mNum);
    }

    /**
     * Return the number of decimal digits to the right of the decimal point required to represent
     * the argument exactly.
     * Return Integer.MAX_VALUE if that's not possible.  Never returns a value less than zero, even
     * if r is a power of ten.
     */
    public static digitsRequired(r: BoundedRational): number {
        if (r === null) {
            return CRConstants.INTEGER_MAX;
        }
        let powersOfTwo = 0;  // Max power of 2 that divides denominator
        let powersOfFive = 0;  // Max power of 5 that divides denominator
        // Try the easy case first to speed things up.
        if (r.mDen === 1n) {
            return 0;
        }
        r = r.reduce();
        let den = r.mDen;
        if (bitLength_n(den) > BoundedRationalConstants.MAX_SIZE) {
            return CRConstants.INTEGER_MAX;
        }
        while ((den & 1n) === 0n) {
            ++powersOfTwo;
            den = den >> 1n;
        }
        while ((den % 5n) === 0n) {
            ++powersOfFive;
            den /= 5n;
        }
        // If the denominator has a factor of other than 2 or 5 (the divisors of 10), the decimal
        // expansion does not terminate.  Multiplying the fraction by any number of powers of 10
        // will not cancel the demoniator.  (Recall the fraction was in lowest terms to start
        // with.) Otherwise the powers of 10 we need to cancel the denominator is the larger of
        // powersOfTwo and powersOfFive.
        if (den !== 1n && den !== -1n) {
            return BoundedRationalConstants.MAX_SIZE;
        }
        return Math.max(powersOfTwo, powersOfFive);
    }
}

const enum UnifiedRealConstants {
    // Various helpful constants
    DEFAULT_COMPARE_TOLERANCE = -1000
}

/**
 * Computable real numbers, represented so that we can get exact decidable comparisons
 * for a number of interesting special cases, including rational computations.
 *
 * A real number is represented as the product of two numbers with different representations:
 * A) A BoundedRational that can only represent a subset of the rationals, but supports
 *    exact computable comparisons.
 * B) A lazily evaluated "constructive real number" that provides operations to evaluate
 *    itself to any requested number of digits.
 * Whenever possible, we choose (B) to be one of a small set of known constants about which we
 * know more.  For example, whenever we can, we represent rationals such that (B) is 1.
 * This scheme allows us to do some very limited symbolic computation on numbers when both
 * have the same (B) value, as well as in some other situations.  We try to maximize that
 * possibility.
 *
 * Arithmetic operations and operations that produce finite approximations may throw unchecked
 * exceptions produced by the underlying CR and BoundedRational packages, including
 * CR.PrecisionOverflowException and CR.AbortedException.
 */
class UnifiedReal {
    mRatFactor: BoundedRational;
    mCrFactor: CR;

    private static check(b: boolean): void {
        if (!b) {
            throw new AssertionError();
        }
    }

    constructor(rat: BoundedRational | null, cr: CR) {
        if (rat === null) {
            throw new ArithmeticException("Building UnifiedReal from null");
        }
        // We don't normally traffic in null CRs, and hence don't test explicitly.
        this.mCrFactor = cr;
        this.mRatFactor = rat;
    }

    public static newCR(cr: CR): UnifiedReal {
        return new UnifiedReal(BoundedRational.ONE, cr);
    }

    public static newBR(rat: BoundedRational): UnifiedReal {
        return new UnifiedReal(rat, UnifiedReal.CR_ONE);
    }

    public static newN(n: bigint) {
        return UnifiedReal.newBR(new BoundedRational(n));
    }

    // Well-known CR constants we try to use in the mCrFactor position:
    private static readonly CR_ONE = CR.ONE;
    private static readonly CR_PI = CR.PI;
    private static readonly CR_E = CR.ONE.exp();
    private static readonly CR_SQRT2 = CR.valueOfN(2n).sqrt();
    private static readonly CR_SQRT3 = CR.valueOfN(3n).sqrt();
    private static readonly CR_LN2 = CR.valueOfN(2n).ln();
    private static readonly CR_LN3 = CR.valueOfN(3n).ln();
    private static readonly CR_LN5 = CR.valueOfN(5n).ln();
    private static readonly CR_LN6 = CR.valueOfN(6n).ln();
    private static readonly CR_LN7 = CR.valueOfN(7n).ln();
    private static readonly CR_LN10 = CR.valueOfN(10n).ln();


    // Square roots that we try to recognize.
    // We currently recognize only a small fixed collection, since the sqrt() function needs to
    // identify numbers of the form <SQRT[i]>*n^2, and we don't otherwise know of a good
    // algorithm for that.
    private static sSqrts: readonly (CR | null)[] = Object.freeze([
        null,
        CR.ONE,
        UnifiedReal.CR_SQRT2,
        UnifiedReal.CR_SQRT3,
        null,
        CR.valueOfN(5n).sqrt(),
        CR.valueOfN(6n).sqrt(),
        CR.valueOfN(7n).sqrt(),
        null,
        null,
        CR.valueOfN(10n).sqrt()]);

    // Natural logs of small integers that we try to recognize.
    private static sLogs: readonly (CR | null)[] = Object.freeze([
        null,
        null,
        UnifiedReal.CR_LN2,
        UnifiedReal.CR_LN3,
        null,
        UnifiedReal.CR_LN5,
        UnifiedReal.CR_LN6,
        UnifiedReal.CR_LN7,
        null,
        null,
        UnifiedReal.CR_LN10]);

    // Some convenient UnifiedReal constants.
    public static readonly PI = UnifiedReal.newCR(UnifiedReal.CR_PI);
    public static readonly E = UnifiedReal.newCR(UnifiedReal.CR_E);
    public static readonly ZERO = UnifiedReal.newBR(BoundedRational.ZERO);
    public static readonly ONE = UnifiedReal.newBR(BoundedRational.ONE);
    public static readonly MINUS_ONE = UnifiedReal.newBR(BoundedRational.MINUS_ONE);
    public static readonly TWO = UnifiedReal.newBR(BoundedRational.TWO);
    public static readonly MINUS_TWO = UnifiedReal.newBR(BoundedRational.MINUS_TWO);
    public static readonly HALF = UnifiedReal.newBR(BoundedRational.HALF);
    public static readonly MINUS_HALF = UnifiedReal.newBR(BoundedRational.MINUS_HALF);
    public static readonly TEN = UnifiedReal.newBR(BoundedRational.TEN);
    public static readonly RADIANS_PER_DEGREE = new UnifiedReal(new BoundedRational(1n, 180n), UnifiedReal.CR_PI);
    private static readonly SIX = UnifiedReal.newN(6n);
    private static readonly HALF_SQRT2 = new UnifiedReal(BoundedRational.HALF, UnifiedReal.CR_SQRT2);
    private static readonly SQRT3 = UnifiedReal.newCR(UnifiedReal.CR_SQRT3);
    private static readonly HALF_SQRT3 = new UnifiedReal(BoundedRational.HALF, UnifiedReal.CR_SQRT3);
    private static readonly THIRD_SQRT3 = new UnifiedReal(BoundedRational.THIRD, UnifiedReal.CR_SQRT3);
    private static readonly PI_OVER_2 = new UnifiedReal(BoundedRational.HALF, UnifiedReal.CR_PI);
    private static readonly PI_OVER_3 = new UnifiedReal(BoundedRational.THIRD, UnifiedReal.CR_PI);
    private static readonly PI_OVER_4 = new UnifiedReal(BoundedRational.QUARTER, UnifiedReal.CR_PI);
    private static readonly PI_OVER_6 = new UnifiedReal(BoundedRational.SIXTH, UnifiedReal.CR_PI);


    /**
     * Given a constructive real cr, try to determine whether cr is the square root of
     * a small integer.  If so, return its square as a BoundedRational.  Otherwise return null.
     * We make this determination by simple table lookup, so spurious null returns are
     * entirely possible, or even likely.
     */
    private static getSquare(cr: CR): BoundedRational | null {
        const sSqrts = UnifiedReal.sSqrts;
        for (let i = 0; i < sSqrts.length; ++i) {
            if (sSqrts[i] === cr) {
                return new BoundedRational(BigInt(i));
            }
        }
        return null;
    }

    /**
     * Given a constructive real cr, try to determine whether cr is the logarithm of a small
     * integer.  If so, return exp(cr) as a BoundedRational.  Otherwise return null.
     * We make this determination by simple table lookup, so spurious null returns are
     * entirely possible, or even likely.
     */
    private getExp(cr: CR): BoundedRational | null {
        const sLogs = UnifiedReal.sLogs;
        for (let i = 0; i < sLogs.length; ++i) {
            if (sLogs[i] === cr) {
                return new BoundedRational(BigInt(i));
            }
        }
        return null;
    }

    /**
     * If the argument is a well-known constructive real, return its name.
     * The name of "CR_ONE" is the empty string.
     * No named constructive reals are rational multiples of each other.
     * Thus two UnifiedReals with different named mCrFactors can be equal only if both
     * mRatFactors are zero or possibly if one is CR_PI and the other is CR_E.
     * (The latter is apparently an open problem.)
     */
    private static crName(cr: CR): string | null {
        if (cr === UnifiedReal.CR_ONE) {
            return "";
        }
        if (cr === UnifiedReal.CR_PI) {
            return "\u03C0";   // GREEK SMALL LETTER PI
        }
        if (cr === UnifiedReal.CR_E) {
            return "e";
        }
        const sSqrts = UnifiedReal.sSqrts;
        for (let i = 0; i < sSqrts.length; ++i) {
            if (cr === sSqrts[i]) {
                return "\u221A" /* SQUARE ROOT */ + i;
            }
        }
        const sLogs = UnifiedReal.sLogs;
        for (let i = 0; i < sLogs.length; ++i) {
            if (cr === sLogs[i]) {
                return "ln(" + i + ")";
            }
        }
        return null;
    }

    /**
     * Would crName() return non-Null?
     */
    private static isNamed(cr: CR): boolean {
        if (cr === UnifiedReal.CR_ONE || cr === UnifiedReal.CR_PI || cr === UnifiedReal.CR_E) {
            return true;
        }
        const sSqrts = UnifiedReal.sSqrts;
        for (let i = 0; i < sSqrts.length; ++i) {
            if (cr === sSqrts[i]) {
                return true;
            }
        }
        const sLogs = UnifiedReal.sLogs;
        for (let i = 0; i < sLogs.length; ++i) {
            if (cr === sLogs[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Is cr known to be algebraic (as opposed to transcendental)?
     * Currently only produces meaningful results for the above known special
     * constructive reals.
     */
    private static definitelyAlgebraic(cr: CR): boolean {
        return cr === UnifiedReal.CR_ONE || UnifiedReal.getSquare(cr) !== null;
    }

    /**
     * Is this number known to be rational?
     */
    public definitelyRational(): boolean {
        return this.mCrFactor === UnifiedReal.CR_ONE || this.mRatFactor.signum() === 0;
    }

    /**
     * Is this number known to be irrational?
     * TODO: We could track the fact that something is irrational with an explicit flag, which
     * could cover many more cases.  Whether that matters in practice is TBD.
     */
    public definitelyIrrational(): boolean {
        return !this.definitelyRational() && UnifiedReal.isNamed(this.mCrFactor);
    }

    /**
     * Is this number known to be algebraic?
     */
    public definitelyAlgebraic(): boolean {
        return UnifiedReal.definitelyAlgebraic(this.mCrFactor) || this.mRatFactor.signum() === 0;
    }

    /**
     * Is this number known to be transcendental?
     */
    public definitelyTranscendental(): boolean {
        return !this.definitelyAlgebraic() && UnifiedReal.isNamed(this.mCrFactor);
    }

    /**
     * Is it known that the two constructive reals differ by something other than a
     * a rational factor, i.e. is it known that two UnifiedReals
     * with those mCrFactors will compare unequal unless both mRatFactors are zero?
     * If this returns true, then a comparison of two UnifiedReals using those two
     * mCrFactors cannot diverge, though we don't know of a good runtime bound.
     */
    private static definitelyIndependent(r1: CR, r2: CR): boolean {
        // The question here is whether r1 = x*r2, where x is rational, where r1 and r2
        // are in our set of special known CRs, can have a solution.
        // This cannot happen if one is CR_ONE and the other is not.
        // (Since all others are irrational.)
        // This cannot happen for two named square roots, which have no repeated factors.
        // (To see this, square both sides of the equation and factor.  Each prime
        // factor in the numerator and denominator occurs twice.)
        // This cannot happen for e or pi on one side, and a square root on the other.
        // (One is transcendental, the other is algebraic.)
        // This cannot happen for two of our special natural logs.
        // (Otherwise ln(m) = (a/b)ln(n) ==> m = n^(a/b) ==> m^b = n^a, which is impossible
        // because either m or n includes a prime factor not shared by the other.)
        // This cannot happen for a log and a square root.
        // (The Lindemann-Weierstrass theorem tells us, among other things, that if
        // a is algebraic, then exp(a) is transcendental.  Thus if l in our finite
        // set of logs where algebraic, expl(l), must be transacendental.
        // But exp(l) is an integer.  Thus the logs are transcendental.  But of course the
        // square roots are algebraic.  Thus they can't be rational multiples.)
        // Unfortunately, we do not know whether e/pi is rational.
        if (r1 === r2) {
            return false;
        }
        if (r1 === UnifiedReal.CR_E || r1 === UnifiedReal.CR_PI) {
            return UnifiedReal.definitelyAlgebraic(r2);
        }
        if (r2 === UnifiedReal.CR_E || r2 === UnifiedReal.CR_PI) {
            return UnifiedReal.definitelyAlgebraic(r1);
        }
        return UnifiedReal.isNamed(r1) && UnifiedReal.isNamed(r2);
    }

    /**
     * Convert to String reflecting raw representation.
     * Debug or log messages only, not pretty.
     */
    public toString(): string {
        return this.mRatFactor.toString() + "*" + this.mCrFactor.toString();
    }

    /**
     * Convert to readable String.
     * Intended for user output.  Produces exact expression when possible.
     */
    public toNiceString(): string {
        if (this.mCrFactor === UnifiedReal.CR_ONE || this.mRatFactor.signum() === 0) {
            return this.mRatFactor.toNiceString();
        }
        let name = UnifiedReal.crName(this.mCrFactor);
        if (name !== null) {
            let bi = BoundedRational.asBigInteger(this.mRatFactor);
            if (bi !== null) {
                if (bi === 1n) {
                    return name;
                }
                return this.mRatFactor.toNiceString() + name;
            }
            return "(" + this.mRatFactor.toNiceString() + ")" + name;
        }
        if (this.mRatFactor === BoundedRational.ONE) {
            return this.mCrFactor.toString();
        }
        return this.crValue().toString();
    }

    /**
     * Will toNiceString() produce an exact representation?
     */
    public exactlyDisplayable(): boolean {
        return UnifiedReal.crName(this.mCrFactor) !== null;
    }

    // Number of extra bits used in evaluation below to prefer truncation to rounding.
    // Must be <= 30.
    private static readonly EXTRA_PREC = 10;
    private static readonly EXTRA_PREC_BIG = 10n;

    /**
     * Returns a truncated representation of the result.
     * If exactlyTruncatable(), we round correctly towards zero. Otherwise the resulting digit
     * string may occasionally be rounded up instead.
     * Always includes a decimal point in the result.
     * The result includes n digits to the right of the decimal point.
     * @param n result precision, >= 0
     */
    public toStringTruncated(n: number): string {
        if (this.mCrFactor === UnifiedReal.CR_ONE || this.mRatFactor === BoundedRational.ZERO) {
            return this.mRatFactor.toStringTruncated(n);
        }
        const scaled = CR.valueOfN((10n ** BigInt(n))).multiply(this.crValue());
        let negative = false;
        let intScaled: bigint;
        if (this.exactlyTruncatable()) {
            intScaled = scaled.get_appr(0);
            if (intScaled < 0n) {
                negative = true;
                intScaled = -intScaled;
            }
            if (CR.valueOfN(intScaled).compareTo(scaled.abs()) > 0) {
                intScaled = intScaled - 1n;
            }
            UnifiedReal.check(CR.valueOfN(intScaled).compareTo(scaled.abs()) < 0);
        } else {
            // Approximate case.  Exact comparisons are impossible.
            intScaled = scaled.get_appr(-UnifiedReal.EXTRA_PREC);
            if (intScaled < 0n) {
                negative = true;
                intScaled = -intScaled;
            }
            intScaled = intScaled >> UnifiedReal.EXTRA_PREC_BIG;
        }
        let digits = intScaled.toString();
        let len = digits.length;
        if (len < n + 1) {
            digits = "0".repeat(n + 1 - len) + digits;
            len = n + 1;
        }
        return (negative ? "-" : "") + digits.substring(0, len - n) + "."
            + digits.substring(len - n);
    }

    /*
     * Can we compute correctly truncated approximations of this number?
     */
    public exactlyTruncatable(): boolean {
        // If the value is known rational, we can do exact comparisons.
        // If the value is known irrational, then we can safely compare to rational approximations;
        // equality is impossible; hence the comparison must converge.
        // The only problem cases are the ones in which we don't know.
        return this.mCrFactor === UnifiedReal.CR_ONE || this.mRatFactor === BoundedRational.ZERO || this.definitelyIrrational();
    }

    public crValue(): CR {
        return this.mRatFactor.crValue().multiply(this.mCrFactor);
    }

    /**
     * Are this and r exactly comparable?
     */
    public isComparable(u: UnifiedReal): boolean {
        // We check for ONE only to speed up the common case.
        // The use of a tolerance here means we can spuriously return false, not true.
        return this.mCrFactor === u.mCrFactor
            && (UnifiedReal.isNamed(this.mCrFactor) || this.mCrFactor.signumA(UnifiedRealConstants.DEFAULT_COMPARE_TOLERANCE) !== 0)
            || this.mRatFactor.signum() === 0 && u.mRatFactor.signum() === 0
            || UnifiedReal.definitelyIndependent(this.mCrFactor, u.mCrFactor)
            || this.crValue().compareToA(u.crValue(), UnifiedRealConstants.DEFAULT_COMPARE_TOLERANCE) !== 0;
    }

    /**
     * Return +1 if this is greater than r, -1 if this is less than r, or 0 of the two are
     * known to be equal.
     * May diverge if the two are equal and !isComparable(r).
     */
    public compareTo(u: UnifiedReal): number {
        if (this.definitelyZero() && u.definitelyZero()) return 0;
        if (this.mCrFactor === u.mCrFactor) {
            let signum = this.mCrFactor.signum();  // Can diverge if mCRFactor == 0.
            return signum * this.mRatFactor.compareTo(u.mRatFactor);
        }
        return this.crValue().compareTo(u.crValue());  // Can also diverge.
    }

    /**
     * Return +1 if this is greater than r, -1 if this is less than r, or possibly 0 of the two are
     * within 2^a of each other.
     */
    public compareToA(u: UnifiedReal, a: number): number {
        if (this.isComparable(u)) {
            return this.compareTo(u);
        } else {
            return this.crValue().compareToA(u.crValue(), a);
        }
    }

    /**
     * Return compareToA(ZERO, a).
     */
    public signumA(a: number): number {
        return this.compareToA(UnifiedReal.ZERO, a);
    }

    /**
     * Return compareTo(ZERO).
     * May diverge for ZERO argument if !isComparable(ZERO).
     */
    public signum(): number {
        return this.compareTo(UnifiedReal.ZERO);
    }

    /**
     * Equality comparison.  May erroneously return true if values differ by less than 2^a,
     * and !isComparable(u).
     */
    public approxEquals(u: UnifiedReal, a: number): boolean {
        if (this.isComparable(u)) {
            if (UnifiedReal.definitelyIndependent(this.mCrFactor, u.mCrFactor)
                && (this.mRatFactor.signum() !== 0 || u.mRatFactor.signum() !== 0)) {
                // No need to actually evaluate, though we don't know which is larger.
                return false;
            } else {
                return this.compareTo(u) === 0;
            }
        }
        return this.crValue().compareToA(u.crValue(), a) === 0;
    }

    /**
     * Returns true if values are definitely known to be equal, false in all other cases.
     * This does not satisfy the contract for Object.equals().
     */
    public definitelyEquals(u: UnifiedReal): boolean {
        return this.isComparable(u) && this.compareTo(u) === 0;
    }

    /**
     * Returns true if values are definitely known not to be equal, false in all other cases.
     * Performs no approximate evaluation.
     */
    public definitelyNotEquals(u: UnifiedReal): boolean {
        let isNamed = UnifiedReal.isNamed(this.mCrFactor);
        let uIsNamed = UnifiedReal.isNamed(u.mCrFactor);
        if (isNamed && uIsNamed) {
            if (UnifiedReal.definitelyIndependent(this.mCrFactor, u.mCrFactor)) {
                return this.mRatFactor.signum() !== 0 || u.mRatFactor.signum() !== 0;
            } else if (this.mCrFactor === u.mCrFactor) {
                return !this.mRatFactor.equals(u.mRatFactor);
            }
            return !this.mRatFactor.equals(u.mRatFactor);
        }
        if (this.mRatFactor.signum() === 0) {
            return uIsNamed && u.mRatFactor.signum() !== 0;
        }
        if (u.mRatFactor.signum() === 0) {
            return isNamed && this.mRatFactor.signum() !== 0;
        }
        return false;
    }

    // And some slightly faster convenience functions for special cases:

    public definitelyZero(): boolean {
        return this.mRatFactor.signum() === 0;
    }

    /**
     * Can this number be determined to be definitely nonzero without performing approximate
     * evaluation?
     */
    public definitelyNonZero(): boolean {
        return UnifiedReal.isNamed(this.mCrFactor) && this.mRatFactor.signum() !== 0;
    }

    public definitelyOne(): boolean {
        return this.mCrFactor === UnifiedReal.CR_ONE && this.mRatFactor.equals(BoundedRational.ONE);
    }

    /**
     * Return equivalent BoundedRational, if known to exist, null otherwise
     */
    public boundedRationalValue(): BoundedRational | null {
        if (this.mCrFactor === UnifiedReal.CR_ONE || this.mRatFactor.signum() === 0) {
            return this.mRatFactor;
        }
        return null;
    }

    /**
     * Returns equivalent BigInteger result if it exists, null if not.
     */
    public bigIntegerValue(): bigint | null {
        let r = this.boundedRationalValue();
        return BoundedRational.asBigInteger(r);
    }

    public add(u: UnifiedReal): UnifiedReal {
        if (this.mCrFactor === u.mCrFactor) {
            let nRatFactor = BoundedRational.add(this.mRatFactor, u.mRatFactor);
            if (nRatFactor !== null) {
                return new UnifiedReal(nRatFactor, this.mCrFactor);
            }
        }
        if (this.definitelyZero()) {
            // Avoid creating new mCrFactor, even if they don't currently match.
            return u;
        }
        if (u.definitelyZero()) {
            return this;
        }
        return UnifiedReal.newCR(this.crValue().add(u.crValue()));
    }

    public negate(): UnifiedReal {
        return new UnifiedReal(BoundedRational.negate(this.mRatFactor), this.mCrFactor);
    }

    public subtract(u: UnifiedReal): UnifiedReal {
        return this.add(u.negate());
    }

    public multiply(u: UnifiedReal): UnifiedReal {
        // Preserve a preexisting mCrFactor when we can.
        if (this.mCrFactor === UnifiedReal.CR_ONE) {
            let nRatFactor = BoundedRational.multiply(this.mRatFactor, u.mRatFactor);
            if (nRatFactor !== null) {
                return new UnifiedReal(nRatFactor, u.mCrFactor);
            }
        }
        if (u.mCrFactor === UnifiedReal.CR_ONE) {
            let nRatFactor = BoundedRational.multiply(this.mRatFactor, u.mRatFactor);
            if (nRatFactor !== null) {
                return new UnifiedReal(nRatFactor, this.mCrFactor);
            }
        }
        if (this.definitelyZero() || u.definitelyZero()) {
            return UnifiedReal.ZERO;
        }
        if (this.mCrFactor === u.mCrFactor) {
            let square = UnifiedReal.getSquare(this.mCrFactor);
            if (square !== null) {
                let nRatFactor = BoundedRational.multiply(
                    BoundedRational.multiply(square, this.mRatFactor), u.mRatFactor);
                if (nRatFactor !== null) {
                    return UnifiedReal.newBR(nRatFactor);
                }
            }
        }
        // Probably a bit cheaper to multiply component-wise.
        let nRatFactor = BoundedRational.multiply(this.mRatFactor, u.mRatFactor);
        if (nRatFactor !== null) {
            return new UnifiedReal(nRatFactor, this.mCrFactor.multiply(u.mCrFactor));
        }
        return UnifiedReal.newCR(this.crValue().multiply(u.crValue()));
    }

    /**
     * Return the reciprocal.
     */
    public inverse(): UnifiedReal {
        if (this.definitelyZero()) {
            throw new ZeroDivisionException();
        }
        let square = UnifiedReal.getSquare(this.mCrFactor);
        if (square !== null) {
            // 1/sqrt(n) = sqrt(n)/n
            let nRatFactor = BoundedRational.inverse(
                BoundedRational.multiply(this.mRatFactor, square));
            if (nRatFactor !== null) {
                return new UnifiedReal(nRatFactor, this.mCrFactor);
            }
        }
        return new UnifiedReal(BoundedRational.inverse(this.mRatFactor), this.mCrFactor.inverse());
    }

    public divide(u: UnifiedReal): UnifiedReal {
        if (this.mCrFactor === u.mCrFactor) {
            if (u.definitelyZero()) {
                throw new ZeroDivisionException();
            }
            let nRatFactor = BoundedRational.divide(this.mRatFactor, u.mRatFactor);
            if (nRatFactor !== null) {
                return new UnifiedReal(nRatFactor, UnifiedReal.CR_ONE);
            }
        }
        return this.multiply(u.inverse());
    }

    /**
     * Return the square root.
     * This may fail to return a known rational value, even when the result is rational.
     */
    public sqrt(): UnifiedReal {
        if (this.definitelyZero()) {
            return UnifiedReal.ZERO;
        }
        if (this.mCrFactor === UnifiedReal.CR_ONE) {
            let ratSqrt: BoundedRational | null;
            // Check for all arguments of the form <perfect rational square> * small_int,
            // where small_int has a known sqrt.  This includes the small_int = 1 case.
            for (let divisor = 1; divisor < UnifiedReal.sSqrts.length; ++divisor) {
                if (UnifiedReal.sSqrts[divisor] !== null) {
                    ratSqrt = BoundedRational.sqrt(
                        BoundedRational.divide(this.mRatFactor, new BoundedRational(BigInt(divisor))));
                    if (ratSqrt !== null) {
                        return new UnifiedReal(ratSqrt, UnifiedReal.sSqrts[divisor]!);
                    }
                }
            }
        }
        return UnifiedReal.newCR(this.crValue().sqrt());
    }

    /**
     * Return (this mod 2pi)/(pi/6) as a BigInteger, or null if that isn't easily possible.
     */
    private getPiTwelfths(): bigint | null {
        if (this.definitelyZero()) return 0n;
        if (this.mCrFactor === UnifiedReal.CR_PI) {
            let quotient = BoundedRational.asBigInteger(
                BoundedRational.multiply(this.mRatFactor, BoundedRational.TWELVE));
            if (quotient === null) {
                return null;
            }
            return quotient % 24n;
        }
        return null;
    }

    /**
     * Computer the sin() for an integer multiple n of pi/12, if easily representable.
     * @param n value between 0 and 23 inclusive.
     */
    private static sinPiTwelfths(n: number): UnifiedReal | null {
        if (n >= 12) {
            let negResult = UnifiedReal.sinPiTwelfths(n - 12);
            return negResult === null ? null : negResult.negate();
        }
        switch (n) {
            case 0:
                return UnifiedReal.ZERO;
            case 2: // 30 degrees
                return UnifiedReal.HALF;
            case 3: // 45 degrees
                return UnifiedReal.HALF_SQRT2;
            case 4: // 60 degrees
                return UnifiedReal.HALF_SQRT3;
            case 6:
                return UnifiedReal.ONE;
            case 8:
                return UnifiedReal.HALF_SQRT3;
            case 9:
                return UnifiedReal.HALF_SQRT2;
            case 10:
                return UnifiedReal.HALF;
            default:
                return null;
        }
    }

    public sin(): UnifiedReal {
        let piTwelfths = this.getPiTwelfths();
        if (piTwelfths !== null) {
            let result = UnifiedReal.sinPiTwelfths(Number(piTwelfths));
            if (result !== null) {
                return result;
            }
        }
        return UnifiedReal.newCR(this.crValue().sin());
    }

    private static cosPiTwelfths(n: number): UnifiedReal | null {
        let sinArg = n + 6;
        if (sinArg >= 24) {
            sinArg -= 24;
        }
        return UnifiedReal.sinPiTwelfths(sinArg);
    }

    public cos(): UnifiedReal {
        let piTwelfths = this.getPiTwelfths();
        if (piTwelfths !== null) {
            let result = UnifiedReal.cosPiTwelfths(Number(piTwelfths));
            if (result !== null) {
                return result;
            }
        }
        return UnifiedReal.newCR(this.crValue().cos());
    }

    public tan(): UnifiedReal {
        let piTwelfths = this.getPiTwelfths();
        if (piTwelfths !== null) {
            let i = Number(piTwelfths);
            if (i === 6 || i === 18) {
                throw new ArithmeticException("Tangent undefined");
            }
            let top = UnifiedReal.sinPiTwelfths(i);
            let bottom = UnifiedReal.cosPiTwelfths(i);
            if (top !== null && bottom !== null) {
                return top.divide(bottom);
            }
        }
        return this.sin().divide(this.cos());
    }

    // Throw an exception if the argument is definitely out of bounds for asin or acos.
    private checkAsinDomain(): void {
        if (this.isComparable(UnifiedReal.ONE) && (this.compareTo(UnifiedReal.ONE) > 0 || this.compareTo(UnifiedReal.MINUS_ONE) < 0)) {
            throw new ArithmeticException("inverse trig argument out of range");
        }
    }

    /**
     * Return asin(n/2).  n is between -2 and 2.
     */
    public static asinHalves(n: number): UnifiedReal {
        if (n < 0) {
            return (this.asinHalves(-n).negate());
        }
        switch (n) {
            case 0:
                return UnifiedReal.ZERO;
            case 1:
                return new UnifiedReal(BoundedRational.SIXTH, CR.PI);
            case 2:
                return new UnifiedReal(BoundedRational.HALF, CR.PI);
        }
        throw new AssertionError("asinHalves: Bad argument");
    }

    /**
     * Return asin of this, assuming this is not an integral multiple of a half.
     */
    public asinNonHalves(): UnifiedReal {
        if (this.compareToA(UnifiedReal.ZERO, -10) < 0) {
            return this.negate().asinNonHalves().negate();
        }
        if (this.definitelyEquals(UnifiedReal.HALF_SQRT2)) {
            return new UnifiedReal(BoundedRational.QUARTER, UnifiedReal.CR_PI);
        }
        if (this.definitelyEquals(UnifiedReal.HALF_SQRT3)) {
            return new UnifiedReal(BoundedRational.THIRD, UnifiedReal.CR_PI);
        }
        return UnifiedReal.newCR(this.crValue().asin());
    }

    public asin(): UnifiedReal {
        this.checkAsinDomain();
        const halves = this.multiply(UnifiedReal.TWO).bigIntegerValue();
        if (halves !== null) {
            return UnifiedReal.asinHalves(Number(halves));
        }
        if (this.mCrFactor === CR.ONE || this.mCrFactor !== UnifiedReal.CR_SQRT2 || this.mCrFactor !== UnifiedReal.CR_SQRT3) {
            return this.asinNonHalves();
        }
        return UnifiedReal.newCR(this.crValue().asin());
    }

    public acos(): UnifiedReal {
        return UnifiedReal.PI_OVER_2.subtract(this.asin());
    }

    public atan(): UnifiedReal {
        if (this.compareToA(UnifiedReal.ZERO, -10) < 0) {
            return this.negate().atan().negate();
        }
        const asBI = this.bigIntegerValue();
        if (asBI !== null && asBI <= 1n) {
            const asInt = Number(asBI);
            // These seem to be all rational cases:
            switch (asInt) {
                case 0:
                    return UnifiedReal.ZERO;
                case 1:
                    return UnifiedReal.PI_OVER_4;
                default:
                    throw new AssertionError("Impossible r_int");
            }
        }
        if (this.definitelyEquals(UnifiedReal.THIRD_SQRT3)) {
            return UnifiedReal.PI_OVER_6;
        }
        if (this.definitelyEquals(UnifiedReal.SQRT3)) {
            return UnifiedReal.PI_OVER_3;
        }
        return UnifiedReal.newCR(UnaryCRFunctions.atanFunction.execute(this.crValue()));
    }

    // The (in abs value) integral exponent for which we attempt to use a recursive
    // algorithm for evaluating pow(). The recursive algorithm works independent of the sign of the
    // base, and can produce rational results. But it can become slow for very large exponents.
    private static readonly RECURSIVE_POW_LIMIT = 1000n;
    // The corresponding limit when we're using rational arithmetic. This should fail fast
    // anyway, but we avoid ridiculously deep recursion.
    private static readonly HARD_RECURSIVE_POW_LIMIT = 1n << 1000n;


    /**
     * Compute an integral power of a constructive real, using the standard recursive algorithm.
     * exp is known to be positive.
     */
    private static recursivePow(base: CR, exp: bigint): CR {
        if (exp === 1n) {
            return base;
        }
        if ((exp & 1n) !== 0n) {
            return base.multiply(UnifiedReal.recursivePow(base, exp - 1n));
        }
        let tmp = UnifiedReal.recursivePow(base, exp >> 1n);
        return tmp.multiply(tmp);
    }

    /**
     * Compute an integral power of a constructive real, using the exp function when
     * we safely can. Use recursivePow when we can't. exp is known to be nozero.
     */
    private expLnPow(exp: bigint): UnifiedReal {
        let sign = this.signumA(UnifiedRealConstants.DEFAULT_COMPARE_TOLERANCE);
        if (sign > 0) {
            // Safe to take the log. This avoids deep recursion for huge exponents, which
            // may actually make sense here.
            return UnifiedReal.newCR(this.crValue().ln().multiply(CR.valueOfN(exp)).exp());
        } else if (sign < 0) {
            let result = this.crValue().negate().ln().multiply(CR.valueOfN(exp)).exp();
            if ((exp & 1n) !== 0n /* odd exponent */) {
                result = result.negate();
            }
            return UnifiedReal.newCR(result);
        } else {
            // Base of unknown sign with integer exponent. Use a recursive computation.
            // (Another possible option would be to use the absolute value of the base, and then
            // adjust the sign at the end.  But that would have to be done in the CR
            // implementation.)
            if (exp < 0n) {
                // This may be very expensive if exp.negate() is large.
                return UnifiedReal.newCR(UnifiedReal.recursivePow(this.crValue(), -exp).inverse());
            } else {
                return UnifiedReal.newCR(UnifiedReal.recursivePow(this.crValue(), exp));
            }
        }
    }


    /**
     * Compute an integral power of this.
     * This recurses roughly as deeply as the number of bits in the exponent, and can, in
     * ridiculous cases, result in a stack overflow.
     */
    private powN(exp: bigint): UnifiedReal {
        if (exp === 1n) {
            return this;
        }
        if (exp === 0n) {
            // Questionable if base has undefined value or is 0.
            // Java.lang.Math.pow() returns 1 anyway, so we do the same.
            return UnifiedReal.ONE;
        }
        let absExp = abs_n(exp);
        if (this.mCrFactor === UnifiedReal.CR_ONE && absExp <= UnifiedReal.HARD_RECURSIVE_POW_LIMIT) {
            const ratPow = this.mRatFactor.pow(exp);
            // We count on this to fail, e.g. for very large exponents, when it would
            // otherwise be too expensive.
            if (ratPow !== null) {
                return UnifiedReal.newBR(ratPow);
            }
        }
        if (absExp > UnifiedReal.RECURSIVE_POW_LIMIT) {
            return this.expLnPow(exp);
        }
        let square = UnifiedReal.getSquare(this.mCrFactor);
        if (square !== null) {
            const nRatFactor =
                BoundedRational.multiply(this.mRatFactor.pow(exp), square.pow(exp >> 1n));
            if (nRatFactor !== null) {
                if ((exp & 1n) === 1n) {
                    // Odd power: Multiply by remaining square root.
                    return new UnifiedReal(nRatFactor, this.mCrFactor);
                } else {
                    return UnifiedReal.newBR(nRatFactor);
                }
            }
        }
        return this.expLnPow(exp);
    }

    /**
     * Return this ^ expon.
     * This is really only well-defined for a positive base, particularly since
     * 0^x is not continuous at zero. (0^0 = 1 (as is epsilon^0), but 0^epsilon is 0.
     * We nonetheless try to do reasonable things at zero, when we recognize that case.
     */
    public pow(expon: UnifiedReal): UnifiedReal {
        if (this.mCrFactor === UnifiedReal.CR_E) {
            if (this.mRatFactor.equals(BoundedRational.ONE)) {
                return expon.exp();
            } else {
                let ratPart = UnifiedReal.newBR(this.mRatFactor).pow(expon);
                return expon.exp().multiply(ratPart);
            }
        }
        const expAsBR = expon.boundedRationalValue();
        if (expAsBR !== null) {
            let expAsBI = BoundedRational.asBigInteger(expAsBR);
            if (expAsBI !== null) {
                return this.powN(expAsBI);
            } else {
                // Check for exponent that is a multiple of a half.
                expAsBI = BoundedRational.asBigInteger(
                    BoundedRational.multiply(BoundedRational.TWO, expAsBR));
                if (expAsBI !== null) {
                    return this.powN(expAsBI).sqrt();
                }
            }
        }
        // If the exponent were known zero, we would have handled it above.
        if (this.definitelyZero()) {
            return UnifiedReal.ZERO;
        }
        let sign = this.signumA(UnifiedRealConstants.DEFAULT_COMPARE_TOLERANCE);
        if (sign < 0) {
            throw new ArithmeticException("Negative base for pow() with non-integer exponent");
        }
        return UnifiedReal.newCR(this.crValue().ln().multiply(expon.crValue()).exp());
    }

    /**
     * Raise the argument to the 16th power.
     */
    private static pow16(n: number): bigint {
        if (n > 10) {
            throw new AssertionError("Unexpected pow16 argument");
        }
        let result = BigInt(n);
        result *= result;
        result *= result;
        result *= result;
        result *= result;
        return result;
    }

    /**
     * Return the integral log with respect to the given base if it exists, 0 otherwise.
     * n is presumed positive.
     */
    private static getIntLog(n: bigint, base: number): bigint {
        let nAsDouble = Number(n);
        let approx = Math.log(nAsDouble) / Math.log(base);
        // A relatively quick test first.
        // Unfortunately, this doesn't help for values to big to fit in a Double.
        if (isFinite(nAsDouble) && Math.abs(approx - Math.round(approx)) > 1.0e-6) {
            return 0n;
        }
        let result = 0n;
        let bigBase = BigInt(base);
        let base16th: bigint | null = null;  // base^16, computed lazily
        while ((n % bigBase) === 0n) {
            n = n / bigBase;
            ++result;
            // And try a slightly faster computation for large n:
            if (base16th === null) {
                base16th = UnifiedReal.pow16(base);
            }
            while ((n % base16th) === 0n) {
                n = n / base16th;
                result += 16n;
            }
        }
        if (n === 1n) {
            return result;
        }
        return 0n;
    }

    public ln(): UnifiedReal {
        if (this.mCrFactor === UnifiedReal.CR_E) {
            return new UnifiedReal(this.mRatFactor, UnifiedReal.CR_ONE).ln().add(UnifiedReal.ONE);
        }
        if (this.isComparable(UnifiedReal.ZERO)) {
            if (this.signum() <= 0) {
                throw new ArithmeticException("log(non-positive)");
            }
            let compare1 = this.compareToA(UnifiedReal.ONE, UnifiedRealConstants.DEFAULT_COMPARE_TOLERANCE);
            if (compare1 === 0) {
                if (this.definitelyEquals(UnifiedReal.ONE)) {
                    return UnifiedReal.ZERO;
                }
            } else if (compare1 < 0) {
                return this.inverse().ln().negate();
            }
            const bi = BoundedRational.asBigInteger(this.mRatFactor);
            if (bi !== null) {
                if (this.mCrFactor === UnifiedReal.CR_ONE) {
                    // Check for a power of a small integer.  We can use sLogs[] to return
                    // a more useful answer for those.
                    const sLogs = UnifiedReal.sLogs;
                    for (let i = 0; i < sLogs.length; ++i) {
                        if (sLogs[i] !== null) {
                            let intLog = UnifiedReal.getIntLog(bi, i);
                            if (intLog !== 0n) {
                                return new UnifiedReal(new BoundedRational(intLog), sLogs[i]!);
                            }
                        }
                    }
                } else {
                    // Check for n^k * sqrt(n), for which we can also return a more useful answer.
                    let square = UnifiedReal.getSquare(this.mCrFactor);
                    if (square !== null) {
                        let intSquare = square.intValue();
                        const sLogs = UnifiedReal.sLogs;
                        if (sLogs[intSquare] !== null) {
                            let intLog = UnifiedReal.getIntLog(bi, intSquare);
                            if (intLog !== 0n) {
                                let nRatFactor =
                                    BoundedRational.add(new BoundedRational(intLog),
                                        BoundedRational.HALF);
                                if (nRatFactor !== null) {
                                    return new UnifiedReal(nRatFactor, sLogs[intSquare]!);
                                }
                            }
                        }
                    }
                }
            }
        }
        return UnifiedReal.newCR(this.crValue().ln());
    }

    public exp(): UnifiedReal {
        if (this.definitelyEquals(UnifiedReal.ZERO)) {
            return UnifiedReal.ONE;
        }
        if (this.definitelyEquals(UnifiedReal.ONE)) {
            // Avoid redundant computations, and ensure we recognize all instances as equal.
            return UnifiedReal.E;
        }
        const crExp = this.getExp(this.mCrFactor);
        if (crExp !== null) {
            let needSqrt = false;
            let ratExponent: BoundedRational | null = this.mRatFactor;
            let asBI = BoundedRational.asBigInteger(ratExponent);
            if (asBI === null) {
                // check for multiple of one half.
                needSqrt = true;
                ratExponent = BoundedRational.multiply(ratExponent, BoundedRational.TWO);
            }
            let nRatFactor = BoundedRational.pow(crExp, ratExponent);
            if (nRatFactor !== null) {
                let result = UnifiedReal.newBR(nRatFactor);
                if (needSqrt) {
                    result = result.sqrt();
                }
                return result;
            }
        }
        return UnifiedReal.newCR(this.crValue().exp());
    }

    /**
     * Generalized factorial.
     * Compute n * (n - step) * (n - 2 * step) * etc.  This can be used to compute factorial a bit
     * faster, especially if BigInteger uses sub-quadratic multiplication.
     */
    private static genFactorial(n: bigint, step: bigint): bigint {
        if (n > 4n * step) {
            let prod1 = UnifiedReal.genFactorial(n, 2n * step);
            let prod2 = UnifiedReal.genFactorial(n - step, 2n * step);
            return prod1 * prod2;
        } else {
            if (n === 0n) {
                return 1n;
            }
            let res = n;
            for (let i = n - step; i > 1n; i -= step) {
                res = res * i;
            }
            return res;
        }
    }

    /**
     * Factorial function.
     * Fails if argument is clearly not an integer.
     * May round to nearest integer if value is close.
     */
    public fact(): UnifiedReal {
        let asBI = this.bigIntegerValue();
        if (asBI === null) {
            asBI = this.crValue().get_appr(0);  // Correct if it was an integer.
            if (!this.approxEquals(UnifiedReal.newN(asBI), UnifiedRealConstants.DEFAULT_COMPARE_TOLERANCE)) {
                throw new ArithmeticException("Non-integral factorial argument");
            }
        }
        if (asBI < 0n) {
            throw new ArithmeticException("Negative factorial argument");
        }
        if (bitLength_n(asBI) > 20) {
            // Will fail.  LongValue() may not work. Punt now.
            throw new ArithmeticException("Factorial argument too big");
        }
        let biResult = UnifiedReal.genFactorial(asBI, 1n);
        let nRatFactor = new BoundedRational(biResult);
        return UnifiedReal.newBR(nRatFactor);
    }

    /**
     * Return the number of decimal digits to the right of the decimal point required to represent
     * the argument exactly.
     * Return Integer.MAX_VALUE if that's not possible.  Never returns a value less than zero, even
     * if r is a power of ten.
     */
    public digitsRequired(): number {
        if (this.mCrFactor === UnifiedReal.CR_ONE || this.mRatFactor.signum() === 0) {
            return BoundedRational.digitsRequired(this.mRatFactor);
        } else {
            return CRConstants.INTEGER_MAX;
        }
    }

    /**
     * Return an upper bound on the number of leading zero bits.
     * These are the number of 0 bits
     * to the right of the binary point and to the left of the most significant digit.
     * Return Integer.MAX_VALUE if we cannot bound it.
     */
    public leadingBinaryZeroes(): number {
        if (UnifiedReal.isNamed(this.mCrFactor)) {
            // Only ln(2) is smaller than one, and could possibly add one zero bit.
            // Adding 3 gives us a somewhat sloppy upper bound.
            const wholeBits = this.mRatFactor.wholeNumberBits();
            if (wholeBits === CRConstants.INTEGER_MIN) {
                return CRConstants.INTEGER_MAX;
            }
            if (wholeBits >= 3) {
                return 0;
            } else {
                return -wholeBits + 3;
            }
        }
        return CRConstants.INTEGER_MAX;
    }

    /**
     * Is the number of bits to the left of the decimal point greater than bound?
     * The result is inexact: We roughly approximate the whole number bits.
     */
    public approxWholeNumberBitsGreaterThan(bound: number): boolean {
        if (UnifiedReal.isNamed(this.mCrFactor)) {
            return this.mRatFactor.wholeNumberBits() > bound;
        } else {
            return bitLength_n(this.crValue().get_appr(bound - 2)) > 2;
        }
    }
}

// @ts-ignore
if (typeof module !== "undefined") {
    // @ts-ignore
    module.exports = {
        CR: CR,
        BoundedRational: BoundedRational,
        UnifiedReal: UnifiedReal,
        UnaryCRFunction: UnaryCRFunction,
        UnaryCRFunctions: UnaryCRFunctions
    }
}
