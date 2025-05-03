# CRCalc.js

Constructive Real calculating library modified from AOSP

[TOC]

# Usage

## Exceptions

### PrecisionOverflowException

> Indicates that the number of bits of precision requested by
> a computation on constructive reals required more than 28 bits,
> and was thus in danger of overflowing an int.
> This is likely to be a symptom of a diverging computation,
> *e.g.* division by zero.

### ZeroDivisionException

Division by zero.

### ArithmeticException

Arithmetic Exception.

### NumberFormatException

Invalid radix.

### AssertionError

Assertion Error.

*End of Exceptions*

## class CR

### Introduction

> Constructive real numbers, also known as recursive, or computable reals.
> Each recursive real number is represented as an object that provides an
> approximation function for the real number.  
> The approximation function guarantees that the generated approximation
> is accurate to the specified precision.  
> Arithmetic operations on constructive reals produce new such objects;
> they typically do not perform any real computation.  
> In this sense, arithmetic computations are exact: They produce
> a description which describes the exact answer, and can be used to
> later approximate it to arbitrary precision.
>
> When approximations are generated, *e.g.* for output, they are
> accurate to the requested precision; no cumulative rounding errors
> are visible.  
> In order to achieve this precision, the approximation function will often
> need to approximate subexpressions to greater precision than was originally
> demanded.  Thus the approximation of a constructive real number
> generated through a complex sequence of operations may eventually require
> evaluation to very high precision.  This usually makes such computations
> prohibitively expensive for large numerical problems.  
> But it is perfectly appropriate for use in a desk calculator,
> for small numerical problems, for the evaluation of expressions
> computated by a symbolic algebra system, for testing of accuracy claims
> for floating point code on small inputs, or the like.
>
> We expect that the vast majority of uses will ignore the particular
> implementation, and the member functons `approximate`
> and `get_appr`.  Such applications will treat `CR` as
> a conventional numerical type, with an interface modelled on
> `java.math.BigInteger`.  No subclasses of `CR`
> will be explicitly mentioned by such a program.
>
> All standard arithmetic operations, as well as a few algebraic
> and transcendal functions are provided.  Constructive reals are
> immutable; thus all of these operations return a new constructive real.
>
> A few uses will require explicit construction of approximation functions.
> The requires the construction of a subclass of `CR` with
> an overridden `approximate` function.  Note that `approximate`
> should only be defined, but never called.  `get_appr`
> provides the same functionality, but adds the caching necessary to obtain
> reasonable performance.
>
> Any operation may also throw `PrecisionOverflowException`
> If the precision request generated during any subcalculation overflows
> a 28-bit integer.  (This should be extremely unlikely, except as an
> outcome of a division by zero, or other erroneous computation.)

### CR.ZERO
`static ZERO: CR = CR.valueOfN(0n)`

### CR.ONE
`static ONE: CR = CR.valueOfN(1n)`

### CR.PI
`static PI: CR`

The ratio of a circle's circumference to its diameter.

### CR.atan_PI
`static atan_PI: CR`

Our old PI implementation. Keep this around for now to allow checking.  
This implementation may also be faster for `BigInteger` implementations
that support only quadratic multiplication, but exhibit high performance
for small computations.  (The standard Android 6 implementation supports
subquadratic multiplication, but has high constant overhead.) Many other
atan-based formulas are possible, but based on superficial
experimentation, this is roughly as good as the more complex formulas.

### CR.valueOfN(n)
`static valueOfN(n: bigint): CR`

The constructive real number corresponding to a `bigint`.

### CR.valueOfS(s, radix?)
`static valueOfS(s: String, radix?: int): CR`

Return the constructive real number corresponding to the given
textual representation and radix.  
**Parameters:**
* `s` - [-] digit\* [. digit\*]
* `radix` - radix

### CR.shift(k, n)
`static shift(k: bigint, n: bigint): bigint`

Multiply `k` by `2**n`.

### CR.scale(k, n)
`static scale(k: bigint, n: bigint): bigint`

Multiply by `2**n`, rounding result.

### CR.zeroes(n)
`static zeroes(n: int): string`

A helper function for `toString`.
Generate a `string` containing `n` zeroes.

### compareToRA(x, r, a)
`compareToRA(x: CR, r: int, a: int): int`

Return `0` if `x = y` to within the indicated tolerance,
`-1` if `x < y`, and `+1` if `x > y`.  If `x` and `y` are indeed
equal, it is guaranteed that `0` will be returned.  If
they differ by less than the tolerance, anything
may happen.  The tolerance allowed is
the maximum of `(abs(this)+abs(x))*(2**r)` and `2**a`.  
**Parameters:**
* `x` - The other constructive real
* `r` - Relative tolerance in bits
* `a` - Absolute tolerance in bits

### compareToA(x, a)
`compareToA(x: CR, a: int): int`

Approximate comparison with only an absolute tolerance.  
Identical to the three argument version `compareToRA`, but without a relative
tolerance.  
Result is 0 if both constructive reals are equal, indeterminate
if they differ by less than 2**a.  
**Parameters:**
* `x` - The other constructive real
* `a` - Absolute tolerance in bits

### compareTo(x)
`compareTo(x: CR): int`

Return `-1` if `this < x`, or `+1` if `this > x`.  
Should be called only if `this != x`.  
If `this == x`, this will not terminate correctly; typically it
will run until it exhausts memory.  
If the two constructive reals may be equal, the two or 3 argument
version of `compareTo` should be used.  
**Parameters:**
* `x` - The other constructive real

### signumA(a)
`signumA(a: int): int`

Equivalent to `compareToA(CR.valueOf(0), a)`.  
**Parameters:**
* `a` - Absolute tolerance in bits

### signum()
`signum(): int`

Return `-1` if negative, `+1` if positive.  
Should be called only if `this != 0`.  
In the 0 case, this will not terminate correctly; typically it
will run until it exhausts memory.  
If the two constructive reals may be equal, the one or two argument
version of `signum` should be used.  

### toStringR(n, radix)
`toStringR(n: int, radix: int): string`

Return a textual representation accurate to `n` places
to the right of the decimal point.  `n` must be nonnegative.  
**Parameters:**
* `n` - Number of digits (>= 0) included to the right of decimal point
* `radix` - Base ( >= 2, <= 16) for the resulting representation.

### toStringD(n)
`toStringD(n: int): string`

Equivalent to `toStringR(n,10)`.  
**Parameters:**  
* `n` - Number of digits included to the right of decimal point

### toString()
`toString(): string`

Equivalent to `toStringR(10, 10)`.

### BigIntegerValue()
`BigIntegerValue(): bigint`

Return a `BigInt` which differs by less than one from the
constructive real.

### doubleValue()
`doubleValue(): number`

This value is not precise! Use `toStringD` and `toStringR` instead!

Return a `double` which differs by less than one in the least
represented bit from the constructive real.
(We're in fact closer to round-to-nearest than that, but we can't and
don't promise correct rounding.)

### add(x)
`add(x: CR): CR`

Add two constructive reals.

### shiftLeft(n)
`shiftLeft(n: int): CR`

Multiply a constructive real by `2**n`.  
**Parameters:**  
* `n` - shift count, may be negative

### shiftRight(n)
`shiftRight(n: int): CR`

Multiply a constructive real by `2**(-n)`.  
**Parameters:**  
* `n` - shift count, may be negative

### assumeInt()
`assumeInt(): CR`

Produce a constructive real equivalent to the original, assuming
the original was an integer.  Undefined results if the original
was not an integer.  Prevents evaluation of digits to the right
of the decimal point, and may thus improve performance.

### negate()
`negate(): CR`

The additive inverse of a constructive real

### subtract(x)
`subtract(x: CR): CR`

The difference between two constructive reals

### multiply(x)
`multiply(x: CR): CR`

The product of two constructive reals

### inverse()
`inverse(): CR`
The multiplicative inverse of a constructive real.
`x.inverse()` is equivalent to `CR.valueOf(1).divide(x)`.

### divide(x)
`divide(x: CR): CR`

The quotient of two constructive reals.

### select(x, y)
`select(x: CR, y: CR): CR`

The real number `x` if `this` < `0`, or `y` otherwise.  
Requires `x` = `y` if `this` = `0`.  
Since comparisons may diverge, this is often
a useful alternative to conditionals.

### max(x)
`max(x: CR): CR`

The maximum of two constructive reals.

### min(x)
`min(x: CR): CR`

The minimum of two constructive reals.

### abs()
`abs(): CR`

The absolute value of a constructive reals.  
Note that this cannot be written as a conditional.

### exp()
`exp(): CR`

The exponential function, that is e**`this`.

### cos()
`cos(): CR`

The trigonometric cosine function.

### sin()
`sin(): CR`

The trigonometric sine function.

### asin()
`asin(): CR`

The trignonometric arc (inverse) sine function.

### acos()
`acos(): CR`

The trignonometric arc (inverse) cosine function.

### ln()
`ln(): CR`

The natural (base e) logarithm.

### sqrt()
`sqrt(): CR`

The square root of a constructive real.

*End of class CR*

## class UnaryCRFunction

### Introduction

> Unary functions on constructive reals implemented as objects.
> The `execute` member computes the function result.
> Unary function objects on constructive reals inherit from
> `UnaryCRFunction`.

### execute(x)
`abstract execute(x: CR): CR`

Computes the function result.

*End of class UnaryCRFunction*

## object UnaryCRFunctions

* **sinFunction**: `UnaryCRFunction`
* **cosFunction**: `UnaryCRFunction`
* **tanFunction**: `UnaryCRFunction`
* **asinFunction**: `UnaryCRFunction`
* **acosFunction**: `UnaryCRFunction`
* **atanFunction**: `UnaryCRFunction`

*End of object UnaryCRFunctions*

## class BoundedRational

### Introduction

> Rational numbers that may turn to null if they get too big.  
> For many operations, if the length of the nuumerator plus the length of the denominator exceeds
> a maximum size, we simply return null, and rely on our caller do something else.  
> We currently never return null for a pure integer or for a BoundedRational that has just been
> constructed.
>
> We also implement a number of irrational functions.  These return a non-null result only when
> the result is known to be rational.

### BoundedRational Constants

* **BoundedRational.ZERO** = `new BoundedRational(0n)`
* **BoundedRational.HALF** = `new BoundedRational(1n, 2n)`
* **BoundedRational.MINUS_HALF** = `new BoundedRational(-1n, 2n)`
* **BoundedRational.THIRD** = `new BoundedRational(1n, 3n)`
* **BoundedRational.QUARTER** = `new BoundedRational(1n, 4n)`
* **BoundedRational.SIXTH** = `new BoundedRational(1n, 6n)`
* **BoundedRational.ONE** = `new BoundedRational(1n)`
* **BoundedRational.MINUS_ONE** = `new BoundedRational(-1n)`
* **BoundedRational.TWO** = `new BoundedRational(2n)`
* **BoundedRational.MINUS_TWO** = `new BoundedRational(-2n)`
* **BoundedRational.TEN** = `new BoundedRational(10n)`
* **BoundedRational.TWELVE** = `new BoundedRational(12n)`

### BoundedRational.valueOfS(s, radix?)
`static valueOfS(s: String, radix?: int): BoundedRational`

Return the BoundedRational number corresponding to the given
textual representation and radix.  
**Parameters:**
* `s` - [-] digit\* [. digit\*]  
* `radix` - radix

### BoundedRational.toString(r)
`static toString(r: BoundedRational | null): string`

Convert to String reflecting raw representation.
Debug or log messages only, not pretty.

### BoundedRational.asBigInteger(r)
`static asBigInteger(r: BoundedRational | null): bigint | null`

Returns equivalent BigInteger result if it exists, null if not.

### BoundedRational.add(r1, r2)
`static add(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null`

### BoundedRational.negate(r)
`static negate(r: BoundedRational | null): BoundedRational | null`

Return the argument, but with the opposite sign.
Returns null only for a null argument.

### BoundedRational.subtract(r1, r2)
`static subtract(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null`

### BoundedRational.multiply(r1, r2)
`static multiply(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null`

### BoundedRational.inverse(r)
`static inverse(r: BoundedRational | null): BoundedRational | null`

Return the reciprocal of r (or null if the argument was null).

### BoundedRational.divide(r1, r2)
`static divide(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null`

### BoundedRational.sqrt(r)
`static sqrt(r: BoundedRational | null): BoundedRational | null`

### BoundedRational.pow(base, exp)
`static pow(base: BoundedRational | null, exp: BoundedRational | null): BoundedRational | null`

### BoundedRational.digitsRequired(r)
`static digitsRequired(r: BoundedRational): int`

Return the number of decimal digits to the right of the decimal point required to represent
the argument exactly.  
Return `Integer.MAX_VALUE` if that's not possible.  Never returns a value less than zero, even
if r is a power of ten.

### constructor(n, d?)
`constructor(n: bigint, d: bigint = 1n)`

Constructs `n / d`

### toString()
`toString(): string`

Convert to String reflecting raw representation.
Debug or log messages only, not pretty.

### toNiceString()
`toNiceString(): string`

Convert to readable String.  
Intended for output to user.  More expensive, less useful for debugging than
toString().  Not internationalized.

### toStringTruncated(n)
`toStringTruncated(n: int): string`

Returns a truncated (rounded towards 0) representation of the result.
Includes n digits to the right of the decimal point.  
**Parameters:**
* `n` - result precision, >= 0

### crValue()
`crValue(): CR`

### intValue()
`intValue(): int`

### wholeNumberBits()
`wholeNumberBits(): int`

Approximate number of bits to left of binary point.
Negative indicates leading zeroes to the right of binary point.

### compareTo(r)
`compareTo(r: BoundedRational): int`

### signum()
`signum(): int`

### equals(r)
`equals(r: BoundedRational): boolean`

### pow(exp)
`pow(exp: bigint): BoundedRational | null`

Compute an integral power of this.

*End of class BoundedRational*

## class UnifiedReal

### Introduction

> Computable real numbers, represented so that we can get exact decidable comparisons
> for a number of interesting special cases, including rational computations.
>
> A real number is represented as the product of two numbers with different representations:  
>
> **A\)** A BoundedRational that can only represent a subset of the rationals, but supports
>    exact computable comparisons.  
> **B\)** A lazily evaluated "constructive real number" that provides operations to evaluate
>    itself to any requested number of digits.
>
> Whenever possible, we choose (B) to be one of a small set of known constants about which we
> know more.  For example, whenever we can, we represent rationals such that (B) is 1.  
> This scheme allows us to do some very limited symbolic computation on numbers when both
> have the same (B) value, as well as in some other situations.  We try to maximize that
> possibility.
>
> Arithmetic operations and operations that produce finite approximations may throw unchecked
> exceptions produced by the underlying CR and BoundedRational packages, including
> PrecisionOverflowException.

### UnifiedReal Constants
* **UnifiedReal.PI** = `UnifiedReal.newCR(UnifiedReal.CR_PI)`
* **UnifiedReal.E** = `UnifiedReal.newCR(UnifiedReal.CR_E)`
* **UnifiedReal.ZERO** = `UnifiedReal.newBR(BoundedRational.ZERO)`
* **UnifiedReal.ONE** = `UnifiedReal.newBR(BoundedRational.ONE)`
* **UnifiedReal.MINUS_ONE** = `UnifiedReal.newBR(BoundedRational.MINUS_ONE)`
* **UnifiedReal.TWO** = `UnifiedReal.newBR(BoundedRational.TWO)`
* **UnifiedReal.MINUS_TWO** = `UnifiedReal.newBR(BoundedRational.MINUS_TWO)`
* **UnifiedReal.HALF** = `UnifiedReal.newBR(BoundedRational.HALF)`
* **UnifiedReal.MINUS_HALF** = `UnifiedReal.newBR(BoundedRational.MINUS_HALF)`
* **UnifiedReal.TEN** = `UnifiedReal.newBR(BoundedRational.TEN)`
* **UnifiedReal.RADIANS_PER_DEGREE** = `new UnifiedReal(new BoundedRational(1n, 180n), UnifiedReal.CR_PI)`

### UnifiedReal.asinHalves(n)
`static asinHalves(n: int): UnifiedReal`

Return asin(n/2).  n is between -2 and 2.

### definitelyRational()
`definitelyRational(): boolean`

Is this number known to be rational?

### definitelyIrrational()
`definitelyIrrational(): boolean`

Is this number known to be irrational?

### definitelyAlgebraic()
`definitelyAlgebraic(): boolean`

Is this number known to be algebraic?

### definitelyTranscendental()
`definitelyTranscendental(): boolean`

Is this number known to be transcendental?

### toString()
`toString(): string`

Convert to String reflecting raw representation.
Debug or log messages only, not pretty.

### toNiceString()
`toNiceString(): string`

Convert to readable String.  
Intended for user output.  Produces exact expression when possible.

### exactlyDisplayable()
`exactlyDisplayable(): boolean`

Will toNiceString() produce an exact representation?

### toStringTruncated(n)
`toStringTruncated(n: int): string`

Returns a truncated representation of the result.  
If `exactlyTruncatable()`, we round correctly towards zero. Otherwise the resulting digit
string may occasionally be rounded up instead.  
Always includes a decimal point in the result.  
The result includes n digits to the right of the decimal point.  
**Parameters:**
* `n` result precision, >= 0

### exactlyTruncatable()
`exactlyTruncatable(): boolean`

Can we compute correctly truncated approximations of this number?

### crValue()
`crValue(): CR`

### isComparable(u)
`isComparable(u: UnifiedReal): boolean`

Are this and `u` exactly comparable?

### compareTo(u)
`compareTo(u: UnifiedReal): int`

Return `+1` if this is greater than `r`, `-1` if this is less than `r`, or `0` of the two are
known to be equal.  
May diverge if the two are equal and `!isComparable(r)`.

### compareToA(u, a)
`compareToA(u: UnifiedReal, a: int): int`

Return `+1` if this is greater than `r`, `-1` if this is less than `r`, or possibly `0` of the two are
within `2^a` of each other.

### signumA(a)
`signumA(a: int): int`

Return `compareToA(UnifiedReal.ZERO, a)`.

### signum()
`signum(): int`

Return `compareTo(UnifiedReal.ZERO)`.
May diverge for `UnifiedReal.ZERO` argument if `!isComparable(UnifiedReal.ZERO)`.

### approxEquals(u, a)
`approxEquals(u: UnifiedReal, a: int): boolean`

Equality comparison.  May erroneously return true if values differ by less than `2^a`,
and `!isComparable(u)`.

### definitelyEquals(u)
`definitelyEquals(u: UnifiedReal): boolean`

Returns true if values are definitely known to be equal, false in all other cases.
This does not satisfy the contract for Object.equals().

### definitelyNotEquals(u)
`definitelyNotEquals(u: UnifiedReal): boolean`

Returns true if values are definitely known not to be equal, false in all other cases.
Performs no approximate evaluation.

### definitelyZero()
`definitelyZero(): boolean`

### definitelyNonZero()
`definitelyNonZero(): boolean`

Can this number be determined to be definitely nonzero without performing approximate
evaluation?

### definitelyOne()
`definitelyOne(): boolean`

### boundedRationalValue()
`boundedRationalValue(): BoundedRational | null`

Return equivalent BoundedRational, if known to exist, null otherwise.

### bigIntegerValue()
`bigIntegerValue(): bigint | null`

Returns equivalent BigInteger result if it exists, null if not.

### add(u)
`add(u: UnifiedReal): UnifiedReal`

### negate()
`negate(): UnifiedReal`

### subtract(u)
`subtract(u: UnifiedReal): UnifiedReal`

### multiply(u)
`multiply(u: UnifiedReal): UnifiedReal`

### inverse()
`inverse(): UnifiedReal`

Return the reciprocal.

### divide(u)
`divide(u: UnifiedReal): UnifiedReal`

### sqrt()
`sqrt(): UnifiedReal`

Return the square root.
This may fail to return a known rational value, even when the result is rational.

### sin()
`sin(): UnifiedReal`

### cos()
`cos(): UnifiedReal`

### tan()
`tan(): UnifiedReal`

### asinNonHalves()
`asinNonHalves(): UnifiedReal`

Return asin of this, assuming this is not an integral multiple of a half.

### asin()
`asin(): UnifiedReal`

### acos()
`acos(): UnifiedReal`

### atan()
`atan(): UnifiedReal`

### pow(expon)
`pow(expon: UnifiedReal): UnifiedReal`

Return this ^ `expon`.  
This is really only well-defined for a positive base, particularly since
`0^x` is not continuous at zero. (`0^0` = `1` (as is `epsilon^0`), but `0^epsilon` is `0`.
We nonetheless try to do reasonable things at zero, when we recognize that case.

### ln()
`ln(): UnifiedReal`

### exp()
`exp(): UnifiedReal`

### fact()
`fact(): UnifiedReal`

Factorial function.  
Fails if argument is clearly not an integer.
May round to nearest integer if value is close.

### digitsRequired()
`digitsRequired(): int`

Return the number of decimal digits to the right of the decimal point required to represent
the argument exactly.  
Return Integer.MAX_VALUE if that's not possible.  Never returns a value less than zero, even
if r is a power of ten.

### leadingBinaryZeroes()
`leadingBinaryZeroes(): int`

Return the number of decimal digits to the right of the decimal point required to represent
the argument exactly.  
Return Integer.MAX_VALUE if that's not possible.  Never returns a value less than zero, even
if r is a power of ten.

### approxWholeNumberBitsGreaterThan(bound)
`approxWholeNumberBitsGreaterThan(bound: int): boolean`

Is the number of bits to the left of the decimal point greater than bound?  
The result is inexact: We roughly approximate the whole number bits.

*End of class UnifiedReal*
