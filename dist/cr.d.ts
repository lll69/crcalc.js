declare const enum CRConstants {
    INTEGER_MIN = -2147483648,
    INTEGER_MAX = 2147483647
}
declare class ExceptionBase extends Error {
    constructor(type: string, message?: string);
}
/**
 * Indicates that the number of bits of precision requested by
 * a computation on constructive reals required more than 28 bits,
 * and was thus in danger of overflowing an int.
 * This is likely to be a symptom of a diverging computation,
 * <I>e.g.</i> division by zero.
 */
declare class PrecisionOverflowException extends ExceptionBase {
    constructor(message?: string);
}
declare class ArithmeticException extends ExceptionBase {
    constructor(message?: string);
}
declare class NumberFormatException extends ExceptionBase {
    constructor(message?: string);
}
declare class ZeroDivisionException extends ArithmeticException {
    constructor();
}
declare class AssertionError extends ExceptionBase {
    constructor(message?: string);
}
declare function gcd_n(a: bigint, b: bigint): bigint;
declare function abs_n(x: bigint): bigint;
declare function compare_n(x: bigint, y: bigint): number;
declare function signum_n(x: bigint): number;
declare function bitLength_n(t: bigint): number;
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
declare abstract class CR {
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
    min_prec: number;
    /**
     * The scaled approximation corresponding to min_prec.
     */
    max_appr: bigint;
    /**
     * min_prec and max_val are valid.
     */
    appr_valid: boolean;
    static bound_log2(n: number): number;
    /**
     * Check that a precision is at least a factor of 8 away from
     * overflowng the integer used to hold a precision spec.
     * We generally perform this check early on, and then convince
     * ourselves that none of the operations performed on precisions
     * inside a function can generate an overflow.
     */
    static check_prec(n: number): void;
    /**
     * The constructive real number corresponding to a
     * <TT>biginteger</tt>.
     */
    static valueOfN(n: bigint): CR;
    static ZERO: CR;
    static ONE: CR;
    /** Multiply k by 2**n. */
    static shift(k: bigint, n: bigint): bigint;
    /** Multiply by 2**n, rounding result */
    static scale(k: bigint, n: bigint): bigint;
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
    get_appr(precision: number): bigint;
    /**
     * Return the position of the msd.
     * If x.msd() == n then
     * 2**(n-1) < abs(x) < 2**(n+1)
     * This initial version assumes that max_appr is valid
     * and sufficiently removed from zero
     * that the msd is determined.
     */
    known_msd(): number;
    /**
     * This version may return Integer.MIN_VALUE if the correct
     * answer is < n.
     */
    msd(n: number): number;
    /**
     * Functionally equivalent, but iteratively evaluates to higher
     * precision.
     */
    iter_msd(n: number): number;
    /**
     * This version returns a correct answer eventually, except
     * that it loops forever (or throws an exception when the
     * requested precision overflows) if this constructive real is zero.
     */
    msd_get(): number;
    /**
     * A helper function for toString.
     * Generate a String containing n zeroes.
     */
    static zeroes(n: number): string;
    /**
     * Natural log of 2.  Needed for some prescaling below.
     * ln(2) = 7ln(10/9) - 2ln(25/24) + 3ln(81/80)
     */
    simple_ln(): CR;
    static ten_ninths: CR;
    static twentyfive_twentyfourths: CR;
    static eightyone_eightyeths: CR;
    static ln2_1: CR;
    static ln2_2: CR;
    static ln2_3: CR;
    static ln2: CR;
    static SQRT_HALF: CR;
    /**
     * Atan of integer reciprocal.  Used for atan_PI.  Could perhaps be made
     * public.
     */
    static atan_reciprocal(n: number): CR;
    static four: CR;
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
    compareToRA(x: CR, r: number, a: number): number;
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
    compareToA(x: CR, a: number): number;
    /**
     * Return -1 if <TT>this &lt; x</tt>, or +1 if <TT>this &gt; x</tt>.
     * Should be called only if <TT>this != x</tt>.
     * If <TT>this == x</tt>, this will not terminate correctly; typically it
     * will run until it exhausts memory.
     * If the two constructive reals may be equal, the two or 3 argument
     * version of compareTo should be used.
     */
    compareTo(x: CR): number;
    /**
     * Equivalent to <TT>compareToA(CR.valueOf(0), a)</tt>
     */
    signumA(a: number): number;
    /**
     * Return -1 if negative, +1 if positive.
     * Should be called only if <TT>this != 0</tt>.
     * In the 0 case, this will not terminate correctly; typically it
     * will run until it exhausts memory.
     * If the two constructive reals may be equal, the one or two argument
     * version of signum should be used.
     */
    signum(): number;
    /**
     * Return the constructive real number corresponding to the given
     * textual representation and radix.
     *
     *       @param s        [-] digit* [. digit*]
     *       @param radix
     */
    static valueOfS(s: String, radix?: number): CR;
    /**
    * Return a textual representation accurate to <TT>n</tt> places
    * to the right of the decimal point.  <TT>n</tt> must be nonnegative.
    *
    *       @param  n       Number of digits (>= 0) included to the right of decimal point
    *       @param  radix   Base ( >= 2, <= 16) for the resulting representation.
    */
    toStringR(n: number, radix: number): string;
    /**
     * Equivalent to <TT>toStringR(n,10)</tt>
     *
     *       @param  n       Number of digits included to the right of decimal point
     */
    toStringD(n: number): string;
    /**
     * Equivalent to <TT>toStringR(10, 10)</tt>
     */
    toString(): string;
    /**
     * Return a BigInteger which differs by less than one from the
     * constructive real.
     */
    BigIntegerValue(): bigint;
    /**
     * This value is not precise! Use toStringD and toStringR instead!
     *
     * Return a double which differs by less than one in the least
     * represented bit from the constructive real.
     * (We're in fact closer to round-to-nearest than that, but we can't and
     * don't promise correct rounding.)
     */
    doubleValue(): number;
    /**
     * Add two constructive reals.
     */
    add(x: CR): CR;
    /**
     * Multiply a constructive real by 2**n.
     * @param n      shift count, may be negative
     */
    shiftLeft(n: number): CR;
    /**
     * Multiply a constructive real by 2**(-n).
     * @param n      shift count, may be negative
     */
    shiftRight(n: number): CR;
    /**
     * Produce a constructive real equivalent to the original, assuming
     * the original was an integer.  Undefined results if the original
     * was not an integer.  Prevents evaluation of digits to the right
     * of the decimal point, and may thus improve performance.
     */
    assumeInt(): CR;
    /**
     * The additive inverse of a constructive real
     */
    negate(): CR;
    /**
     * The difference between two constructive reals
     */
    subtract(x: CR): CR;
    /**
     * The product of two constructive reals
     */
    multiply(x: CR): CR;
    /**
     * The multiplicative inverse of a constructive real.
     * <TT>x.inverse()</tt> is equivalent to <TT>CR.valueOf(1).divide(x)</tt>.
     */
    inverse(): CR;
    /**
     * The quotient of two constructive reals.
     */
    divide(x: CR): CR;
    /**
     * The real number <TT>x</tt> if <TT>this</tt> < 0, or <TT>y</tt> otherwise.
     * Requires <TT>x</tt> = <TT>y</tt> if <TT>this</tt> = 0.
     * Since comparisons may diverge, this is often
     * a useful alternative to conditionals.
     */
    select(x: CR, y: CR): CR;
    /**
     * The maximum of two constructive reals.
     */
    max(x: CR): CR;
    /**
     * The minimum of two constructive reals.
     */
    min(x: CR): CR;
    /**
     * The absolute value of a constructive reals.
     * Note that this cannot be written as a conditional.
     */
    abs(): CR;
    /**
     * The exponential function, that is e**<TT>this</tt>.
     */
    exp(): CR;
    /**
     * The ratio of a circle's circumference to its diameter.
     */
    static PI: CR;
    /**
     * Our old PI implementation. Keep this around for now to allow checking.
     * This implementation may also be faster for BigInteger implementations
     * that support only quadratic multiplication, but exhibit high performance
     * for small computations.  (The standard Android 6 implementation supports
     * subquadratic multiplication, but has high constant overhead.) Many other
     * atan-based formulas are possible, but based on superficial
     * experimentation, this is roughly as good as the more complex formulas.
     */
    static atan_PI: CR;
    static half_pi: CR;
    /**
    * The trigonometric cosine function.
    */
    cos(): CR;
    /**
    * The trigonometric sine function.
    */
    sin(): CR;
    /**
    * The trignonometric arc (inverse) sine function.
    */
    asin(): CR;
    /**
    * The trignonometric arc (inverse) cosine function.
    */
    acos(): CR;
    /**
    * The natural (base e) logarithm.
    */
    ln(): CR;
    /**
    * The square root of a constructive real.
    */
    sqrt(): CR;
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
declare abstract class slow_CR extends CR {
    get_appr(precision: number): bigint;
}
/** Representation of an integer constant.  Private. */
declare class int_CR extends CR {
    value: bigint;
    constructor(n: bigint);
    protected approximate(p: number): bigint;
}
/**
 * Representation of a number that may not have been completely
 * evaluated, but is assumed to be an integer.  Hence we never
 * evaluate beyond the decimal point.
 */
declare class assumed_int_CR extends CR {
    value: CR;
    constructor(x: CR);
    protected approximate(p: number): bigint;
}
/** Representation of the sum of 2 constructive reals.  Private. */
declare class add_CR extends CR {
    op1: CR;
    op2: CR;
    constructor(x: CR, y: CR);
    protected approximate(p: number): bigint;
}
/** Representation of a CR multiplied by 2**n */
declare class shifted_CR extends CR {
    op: CR;
    count: number;
    constructor(x: CR, n: number);
    protected approximate(p: number): bigint;
}
/** Representation of the negation of a constructive real.  Private. */
declare class neg_CR extends CR {
    op: CR;
    constructor(x: CR);
    protected approximate(p: number): bigint;
}
declare class select_CR extends CR {
    selector: CR;
    selector_sign: number;
    op1: CR;
    op2: CR;
    constructor(s: CR, x: CR, y: CR);
    protected approximate(p: number): bigint;
}
declare class mult_CR extends CR {
    op1: CR;
    op2: CR;
    constructor(x: CR, y: CR);
    protected approximate(p: number): bigint;
}
/**
 * Representation of the multiplicative inverse of a constructive
 * real.  Private.  Should use Newton iteration to refine estimates.
 */
declare class inv_CR extends CR {
    op: CR;
    constructor(x: CR);
    protected approximate(p: number): bigint;
}
/**
 * Representation of the exponential of a constructive real.  Private.
 * Uses a Taylor series expansion.  Assumes |x| < 1/2.
 * Note: this is known to be a bad algorithm for
 * floating point.  Unfortunately, other alternatives
 * appear to require precomputed information.
 */
declare class prescaled_exp_CR extends CR {
    op: CR;
    constructor(x: CR);
    protected approximate(p: number): bigint;
}
/**
 * Representation of the cosine of a constructive real.  Private.
 * Uses a Taylor series expansion.  Assumes |x| < 1.
 */
declare class prescaled_cos_CR extends slow_CR {
    op: CR;
    constructor(x: CR);
    protected approximate(p: number): bigint;
}
/**
 * The constructive real atan(1/n), where n is a small integer
 * > base.
 * This gives a simple and moderately fast way to compute PI.
 */
declare class integral_atan_CR extends slow_CR {
    op: number;
    constructor(x: number);
    protected approximate(p: number): bigint;
}
/** Representation for ln(1 + op) */
declare class prescaled_ln_CR extends slow_CR {
    op: CR;
    constructor(x: CR);
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
    protected approximate(p: number): bigint;
}
/**
 * Representation of the arcsine of a constructive real.  Private.
 * Uses a Taylor series expansion.  Assumes |x| < (1/2)^(1/3).
 */
declare class prescaled_asin_CR extends slow_CR {
    op: CR;
    constructor(x: CR);
    protected approximate(p: number): bigint;
}
declare class sqrt_CR extends CR {
    op: CR;
    constructor(x: CR, min_p?: number, max_a?: bigint | null);
    protected approximate(p: number): bigint;
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
declare class gl_pi_CR extends slow_CR {
    b_prec: (number | null)[];
    b_val: (bigint | null)[];
    constructor();
    protected approximate(p: number): bigint;
}
/**
 * Unary functions on constructive reals implemented as objects.
 * The <TT>execute</tt> member computes the function result.
 * Unary function objects on constructive reals inherit from
 * <TT>UnaryCRFunction</tt>.
 */
declare abstract class UnaryCRFunction {
    abstract execute(x: CR): CR;
}
declare class sin_UnaryCRFunction extends UnaryCRFunction {
    execute(x: CR): CR;
}
declare class cos_UnaryCRFunction extends UnaryCRFunction {
    execute(x: CR): CR;
}
declare class tan_UnaryCRFunction extends UnaryCRFunction {
    execute(x: CR): CR;
}
declare class asin_UnaryCRFunction extends UnaryCRFunction {
    execute(x: CR): CR;
}
declare class acos_UnaryCRFunction extends UnaryCRFunction {
    execute(x: CR): CR;
}
declare class atan_UnaryCRFunction extends UnaryCRFunction {
    one: CR;
    execute(x: CR): CR;
}
declare const UnaryCRFunctions: Readonly<{
    sinFunction: sin_UnaryCRFunction;
    cosFunction: cos_UnaryCRFunction;
    tanFunction: tan_UnaryCRFunction;
    asinFunction: asin_UnaryCRFunction;
    acosFunction: acos_UnaryCRFunction;
    atanFunction: atan_UnaryCRFunction;
}>;
declare const enum BoundedRationalConstants {
    MAX_SIZE = 10000
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
declare class BoundedRational {
    private mNum;
    private mDen;
    constructor(n: bigint, d?: bigint);
    /**
     * Return the BoundedRational number corresponding to the given
     * textual representation and radix.
     *
     *       @param s        [-] digit* [. digit*]
     *       @param radix
     */
    static valueOfS(s: String, radix?: number): BoundedRational;
    /**
     * Convert to String reflecting raw representation.
     * Debug or log messages only, not pretty.
     */
    toString(): string;
    /**
     * Convert to readable String.
     * Intended for output to user.  More expensive, less useful for debugging than
     * toString().  Not internationalized.
     */
    toNiceString(): string;
    static toString(r: BoundedRational | null): string;
    /**
     * Returns a truncated (rounded towards 0) representation of the result.
     * Includes n digits to the right of the decimal point.
     * @param n result precision, >= 0
     */
    toStringTruncated(n: number): string;
    crValue(): CR;
    intValue(): number;
    wholeNumberBits(): number;
    /**
     * Is this number too big for us to continue with rational arithmetic?
     * We return fals for integers on the assumption that we have no better fallback.
     */
    private tooBig;
    /**
     * Return an equivalent fraction with a positive denominator.
     */
    private positiveDen;
    /**
     * Return an equivalent fraction in lowest terms.
     * Denominator sign may remain negative.
     */
    private reduce;
    /**
     * Return a possibly reduced version of r that's not tooBig().
     * Return null if none exists.
     */
    private static maybeReduce;
    compareTo(r: BoundedRational): number;
    signum(): number;
    equals(r: BoundedRational): boolean;
    /**
     * Returns equivalent BigInteger result if it exists, null if not.
     */
    static asBigInteger(r: BoundedRational | null): bigint | null;
    static add(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null;
    /**
     * Return the argument, but with the opposite sign.
     * Returns null only for a null argument.
     */
    static negate(r: BoundedRational | null): BoundedRational | null;
    static subtract(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null;
    /**
     * Return product of r1 and r2 without reducing the result.
     */
    private static rawMultiply;
    static multiply(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null;
    /**
     * Return the reciprocal of r (or null if the argument was null).
     */
    static inverse(r: BoundedRational | null): BoundedRational | null;
    static divide(r1: BoundedRational | null, r2: BoundedRational | null): BoundedRational | null;
    static sqrt(r: BoundedRational | null): BoundedRational | null;
    static ZERO: BoundedRational;
    static HALF: BoundedRational;
    static MINUS_HALF: BoundedRational;
    static THIRD: BoundedRational;
    static QUARTER: BoundedRational;
    static SIXTH: BoundedRational;
    static ONE: BoundedRational;
    static MINUS_ONE: BoundedRational;
    static TWO: BoundedRational;
    static MINUS_TWO: BoundedRational;
    static TEN: BoundedRational;
    static TWELVE: BoundedRational;
    /**
     * Compute integral power of this, assuming this has been reduced and exp is >= 0.
     */
    private rawPow;
    /**
     * Compute an integral power of this.
     */
    pow(exp: bigint): BoundedRational | null;
    static pow(base: BoundedRational | null, exp: BoundedRational | null): BoundedRational | null;
    /**
     * Return the number of decimal digits to the right of the decimal point required to represent
     * the argument exactly.
     * Return Integer.MAX_VALUE if that's not possible.  Never returns a value less than zero, even
     * if r is a power of ten.
     */
    static digitsRequired(r: BoundedRational): number;
}
declare const enum UnifiedRealConstants {
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
declare class UnifiedReal {
    mRatFactor: BoundedRational;
    mCrFactor: CR;
    private static check;
    constructor(rat: BoundedRational | null, cr: CR);
    static newCR(cr: CR): UnifiedReal;
    static newBR(rat: BoundedRational): UnifiedReal;
    static newN(n: bigint): UnifiedReal;
    private static readonly CR_ONE;
    private static readonly CR_PI;
    private static readonly CR_E;
    private static readonly CR_SQRT2;
    private static readonly CR_SQRT3;
    private static readonly CR_LN2;
    private static readonly CR_LN3;
    private static readonly CR_LN5;
    private static readonly CR_LN6;
    private static readonly CR_LN7;
    private static readonly CR_LN10;
    private static sSqrts;
    private static sLogs;
    static readonly PI: UnifiedReal;
    static readonly E: UnifiedReal;
    static readonly ZERO: UnifiedReal;
    static readonly ONE: UnifiedReal;
    static readonly MINUS_ONE: UnifiedReal;
    static readonly TWO: UnifiedReal;
    static readonly MINUS_TWO: UnifiedReal;
    static readonly HALF: UnifiedReal;
    static readonly MINUS_HALF: UnifiedReal;
    static readonly TEN: UnifiedReal;
    static readonly RADIANS_PER_DEGREE: UnifiedReal;
    private static readonly SIX;
    private static readonly HALF_SQRT2;
    private static readonly SQRT3;
    private static readonly HALF_SQRT3;
    private static readonly THIRD_SQRT3;
    private static readonly PI_OVER_2;
    private static readonly PI_OVER_3;
    private static readonly PI_OVER_4;
    private static readonly PI_OVER_6;
    /**
     * Given a constructive real cr, try to determine whether cr is the square root of
     * a small integer.  If so, return its square as a BoundedRational.  Otherwise return null.
     * We make this determination by simple table lookup, so spurious null returns are
     * entirely possible, or even likely.
     */
    private static getSquare;
    /**
     * Given a constructive real cr, try to determine whether cr is the logarithm of a small
     * integer.  If so, return exp(cr) as a BoundedRational.  Otherwise return null.
     * We make this determination by simple table lookup, so spurious null returns are
     * entirely possible, or even likely.
     */
    private getExp;
    /**
     * If the argument is a well-known constructive real, return its name.
     * The name of "CR_ONE" is the empty string.
     * No named constructive reals are rational multiples of each other.
     * Thus two UnifiedReals with different named mCrFactors can be equal only if both
     * mRatFactors are zero or possibly if one is CR_PI and the other is CR_E.
     * (The latter is apparently an open problem.)
     */
    private static crName;
    /**
     * Would crName() return non-Null?
     */
    private static isNamed;
    /**
     * Is cr known to be algebraic (as opposed to transcendental)?
     * Currently only produces meaningful results for the above known special
     * constructive reals.
     */
    private static definitelyAlgebraic;
    /**
     * Is this number known to be rational?
     */
    definitelyRational(): boolean;
    /**
     * Is this number known to be irrational?
     * TODO: We could track the fact that something is irrational with an explicit flag, which
     * could cover many more cases.  Whether that matters in practice is TBD.
     */
    definitelyIrrational(): boolean;
    /**
     * Is this number known to be algebraic?
     */
    definitelyAlgebraic(): boolean;
    /**
     * Is this number known to be transcendental?
     */
    definitelyTranscendental(): boolean;
    /**
     * Is it known that the two constructive reals differ by something other than a
     * a rational factor, i.e. is it known that two UnifiedReals
     * with those mCrFactors will compare unequal unless both mRatFactors are zero?
     * If this returns true, then a comparison of two UnifiedReals using those two
     * mCrFactors cannot diverge, though we don't know of a good runtime bound.
     */
    private static definitelyIndependent;
    /**
     * Convert to String reflecting raw representation.
     * Debug or log messages only, not pretty.
     */
    toString(): string;
    /**
     * Convert to readable String.
     * Intended for user output.  Produces exact expression when possible.
     */
    toNiceString(): string;
    /**
     * Will toNiceString() produce an exact representation?
     */
    exactlyDisplayable(): boolean;
    private static readonly EXTRA_PREC;
    private static readonly EXTRA_PREC_BIG;
    /**
     * Returns a truncated representation of the result.
     * If exactlyTruncatable(), we round correctly towards zero. Otherwise the resulting digit
     * string may occasionally be rounded up instead.
     * Always includes a decimal point in the result.
     * The result includes n digits to the right of the decimal point.
     * @param n result precision, >= 0
     */
    toStringTruncated(n: number): string;
    exactlyTruncatable(): boolean;
    crValue(): CR;
    /**
     * Are this and r exactly comparable?
     */
    isComparable(u: UnifiedReal): boolean;
    /**
     * Return +1 if this is greater than r, -1 if this is less than r, or 0 of the two are
     * known to be equal.
     * May diverge if the two are equal and !isComparable(r).
     */
    compareTo(u: UnifiedReal): number;
    /**
     * Return +1 if this is greater than r, -1 if this is less than r, or possibly 0 of the two are
     * within 2^a of each other.
     */
    compareToA(u: UnifiedReal, a: number): number;
    /**
     * Return compareToA(ZERO, a).
     */
    signumA(a: number): number;
    /**
     * Return compareTo(ZERO).
     * May diverge for ZERO argument if !isComparable(ZERO).
     */
    signum(): number;
    /**
     * Equality comparison.  May erroneously return true if values differ by less than 2^a,
     * and !isComparable(u).
     */
    approxEquals(u: UnifiedReal, a: number): boolean;
    /**
     * Returns true if values are definitely known to be equal, false in all other cases.
     * This does not satisfy the contract for Object.equals().
     */
    definitelyEquals(u: UnifiedReal): boolean;
    /**
     * Returns true if values are definitely known not to be equal, false in all other cases.
     * Performs no approximate evaluation.
     */
    definitelyNotEquals(u: UnifiedReal): boolean;
    definitelyZero(): boolean;
    /**
     * Can this number be determined to be definitely nonzero without performing approximate
     * evaluation?
     */
    definitelyNonZero(): boolean;
    definitelyOne(): boolean;
    /**
     * Return equivalent BoundedRational, if known to exist, null otherwise
     */
    boundedRationalValue(): BoundedRational | null;
    /**
     * Returns equivalent BigInteger result if it exists, null if not.
     */
    bigIntegerValue(): bigint | null;
    add(u: UnifiedReal): UnifiedReal;
    negate(): UnifiedReal;
    subtract(u: UnifiedReal): UnifiedReal;
    multiply(u: UnifiedReal): UnifiedReal;
    /**
     * Return the reciprocal.
     */
    inverse(): UnifiedReal;
    divide(u: UnifiedReal): UnifiedReal;
    /**
     * Return the square root.
     * This may fail to return a known rational value, even when the result is rational.
     */
    sqrt(): UnifiedReal;
    /**
     * Return (this mod 2pi)/(pi/6) as a BigInteger, or null if that isn't easily possible.
     */
    private getPiTwelfths;
    /**
     * Computer the sin() for an integer multiple n of pi/12, if easily representable.
     * @param n value between 0 and 23 inclusive.
     */
    private static sinPiTwelfths;
    sin(): UnifiedReal;
    private static cosPiTwelfths;
    cos(): UnifiedReal;
    tan(): UnifiedReal;
    private checkAsinDomain;
    /**
     * Return asin(n/2).  n is between -2 and 2.
     */
    static asinHalves(n: number): UnifiedReal;
    /**
     * Return asin of this, assuming this is not an integral multiple of a half.
     */
    asinNonHalves(): UnifiedReal;
    asin(): UnifiedReal;
    acos(): UnifiedReal;
    atan(): UnifiedReal;
    private static readonly RECURSIVE_POW_LIMIT;
    private static readonly HARD_RECURSIVE_POW_LIMIT;
    /**
     * Compute an integral power of a constructive real, using the standard recursive algorithm.
     * exp is known to be positive.
     */
    private static recursivePow;
    /**
     * Compute an integral power of a constructive real, using the exp function when
     * we safely can. Use recursivePow when we can't. exp is known to be nozero.
     */
    private expLnPow;
    /**
     * Compute an integral power of this.
     * This recurses roughly as deeply as the number of bits in the exponent, and can, in
     * ridiculous cases, result in a stack overflow.
     */
    private powN;
    /**
     * Return this ^ expon.
     * This is really only well-defined for a positive base, particularly since
     * 0^x is not continuous at zero. (0^0 = 1 (as is epsilon^0), but 0^epsilon is 0.
     * We nonetheless try to do reasonable things at zero, when we recognize that case.
     */
    pow(expon: UnifiedReal): UnifiedReal;
    /**
     * Raise the argument to the 16th power.
     */
    private static pow16;
    /**
     * Return the integral log with respect to the given base if it exists, 0 otherwise.
     * n is presumed positive.
     */
    private static getIntLog;
    ln(): UnifiedReal;
    exp(): UnifiedReal;
    /**
     * Generalized factorial.
     * Compute n * (n - step) * (n - 2 * step) * etc.  This can be used to compute factorial a bit
     * faster, especially if BigInteger uses sub-quadratic multiplication.
     */
    private static genFactorial;
    /**
     * Factorial function.
     * Fails if argument is clearly not an integer.
     * May round to nearest integer if value is close.
     */
    fact(): UnifiedReal;
    /**
     * Return the number of decimal digits to the right of the decimal point required to represent
     * the argument exactly.
     * Return Integer.MAX_VALUE if that's not possible.  Never returns a value less than zero, even
     * if r is a power of ten.
     */
    digitsRequired(): number;
    /**
     * Return an upper bound on the number of leading zero bits.
     * These are the number of 0 bits
     * to the right of the binary point and to the left of the most significant digit.
     * Return Integer.MAX_VALUE if we cannot bound it.
     */
    leadingBinaryZeroes(): number;
    /**
     * Is the number of bits to the left of the decimal point greater than bound?
     * The result is inexact: We roughly approximate the whole number bits.
     */
    approxWholeNumberBitsGreaterThan(bound: number): boolean;
}
