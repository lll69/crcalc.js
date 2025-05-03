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

// Superficial sanity test for the constructive reals package.

// Added test for division by negative number.  Hans_Boehm@hp.com, 8/13/01
// Modified to use AssertionFailedError. hboehm@google.com, 6/6/14
// Modified further for Android/JUnit testing framework, 12/15/14
// Added basic asin and acos tests, improved messages,
//        hboehm@google.com, 5/22/15

// @ts-ignore
const { CR, UnaryCRFunctions } = await import("./cr.js");

class AssertionFailedError extends Error {
    constructor(message: string) {
        super("AssertionFailedError: " + message);
    }
}

class CRTest {
    private static check(x: boolean, s: string): void {
        if (!x) throw new AssertionFailedError(s);
    }
    private static check_eq(x: CR, y: CR, s: string): void {
        if (x.compareToA(y, -50) != 0) {
            throw new AssertionFailedError(s + "(" + x + " vs. " + y + ")");
        }
    }
    private static check_appr_eq(x: number, y: number, s: string) {
        if (Math.abs(x - y) > 0.000001) {
            throw new AssertionFailedError(s + "(" + x + " vs. " + y + ")");
        }
    }
    // TODO: Break this up into meaningful smaller tests.
    public testCR(): void {
        let zero = CR.valueOfN(0n);
        let one = CR.valueOfN(1n);
        let two = CR.valueOfN(2n);
        CRTest.check(one.signum() == 1, "signum(1) failed");
        CRTest.check(one.negate().signum() == -1, "signum(-1) failed");
        CRTest.check(zero.signumA(-100) == 0, "signum(0) failed");
        CRTest.check(one.compareToA(two, -10) == -1, "comparison failed");
        CRTest.check(two.toStringD(4) == ("2.0000"), "toString failed");
        CRTest.check_eq(one.shiftLeft(1), two, "shiftLeft failed");
        CRTest.check_eq(two.shiftRight(1), one, "shiftRight failed");
        CRTest.check_eq(one.add(one), two, "add failed 1");
        CRTest.check_eq(one.max(two), two, "max failed");
        CRTest.check_eq(one.min(two), one, "min failed");
        CRTest.check_eq(one.abs(), one, "abs failed 1");
        CRTest.check_eq(one.negate().abs(), one, "abs failed 2");
        let three = two.add(one);
        let four = two.add(two);
        CRTest.check_eq(CR.valueOfN(4n), four, "2 + 2 failed");
        CRTest.check_eq(CR.valueOfN(3n), three, "2 + 1 failed");
        CRTest.check_eq(one.negate().add(two), one, "negate failed");
        CRTest.check(one.negate().signum() == -1, "signum(-1) failed");
        CRTest.check_eq(two.multiply(two), four, "multiply failed");
        CRTest.check_eq(one.divide(four).shiftLeft(4), four, "divide failed 1");
        CRTest.check_eq(two.divide(one.negate()), two.negate(), "divide(neg) failed");
        let thirteen = CR.valueOfN(13n);
        CRTest.check_eq(one.divide(thirteen).multiply(thirteen), one,
            "divide failed 2");
        CRTest.check(thirteen.BigIntegerValue() == 13n, "BigIntegerValue failed");
        CRTest.check_eq(zero.exp(), one, "exp(0) failed");
        let e = one.exp();
        CRTest.check(e.toStringD(20).substring(0, 17)
            == ("2.718281828459045"),
            "exp(1) failed");
        CRTest.check_eq(e.ln(), one, "ln(e) failed");
        let half_pi = CR.PI.divide(two);
        let half = one.divide(two);
        let million = BigInt(1000 * 1000);
        let thousand = BigInt(1000);
        let huge = CR.valueOfN(million * million * thousand);
        let asin = UnaryCRFunctions.asinFunction;
        let acos = UnaryCRFunctions.acosFunction;
        let atan = UnaryCRFunctions.atanFunction;
        let tan = UnaryCRFunctions.tanFunction;
        CRTest.check_eq(half_pi.sin(), one, "sin(pi/2) failed");
        CRTest.check_eq(asin.execute(one), half_pi, "asin(1) failed");
        CRTest.check_eq(asin.execute(one.negate()),
            half_pi.negate(), "asin(-1) failed");
        CRTest.check_eq(asin.execute(zero), zero, "asin(0) failed");
        CRTest.check_eq(asin.execute(half.sin()), half, "asin(sin(0.5)) failed");
        CRTest.check_eq(asin.execute(one.sin()), one, "asin(sin(1) failed");
        CRTest.check_eq(acos.execute(one.cos()), one, "acos(cos(1) failed");
        CRTest.check_eq(atan.execute(tan.execute(one)), one, "atan(tan(1) failed");
        CRTest.check_eq(atan.execute(tan.execute(one.negate())), one.negate(),
            "atan(tan(-1) failed");
        CRTest.check_eq(tan.execute(atan.execute(huge)), huge,
            "tan(atan(10**15)) failed");
        let sqrt13 = thirteen.sqrt();
        CRTest.check_eq(sqrt13.multiply(sqrt13), thirteen, "sqrt(13)*sqrt(13) failed");
        let tmp = CR.PI.add(CR.valueOfN(-123n).exp());
        let tmp2 = tmp.subtract(CR.PI);
        CRTest.check(tmp2.ln().BigIntegerValue() == -123n, "BigIntegerValue(...) failed");
        for (let n = -10.0; n < 10.0; n += 2.0) {
            CRTest.check_appr_eq(Math.sin(n), CR.valueOfS(String(n)).sin().doubleValue(),
                "sin failed at " + n);
            CRTest.check_appr_eq(Math.cos(n), CR.valueOfS(String(n)).cos().doubleValue(),
                "cos failed at " + n);
            CRTest.check_appr_eq(Math.exp(n), CR.valueOfS(String(n)).exp().doubleValue(),
                "exp failed at " + n);
            CRTest.check_appr_eq(Math.asin(0.1 * n),
                CR.valueOfS(String(0.1 * n)).asin().doubleValue(),
                "asin failed at " + 0.1 * n);
            CRTest.check_appr_eq(Math.acos(0.1 * n),
                CR.valueOfS(String(0.1 * n)).acos().doubleValue(),
                "acos failed at " + 0.1 * n);
            if (n > 0.0) {
                CRTest.check_appr_eq(Math.log(n), CR.valueOfS(String(n)).ln().doubleValue(),
                    "ln failed at " + n);
            }
        }
        CRTest.check_appr_eq(Math.cos(12345678.0),
            CR.valueOfN(12345678n).cos().doubleValue(),
            "cos failed at " + 12345678);
        console.log("Success");
    }
}

new CRTest().testCR();
export { }
