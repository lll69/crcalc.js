/*
 * Copyright (C) 2006 The Android Open Source Project
 * Copyright 2026 lll69
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const SCROLL_FRICTION = 0.015;
const mFlingFriction = SCROLL_FRICTION;
const DEFAULT_DURATION = 250;
const SCROLL_MODE = 0;
const FLING_MODE = 1;

const DECELERATION_RATE = 2.3582018154259448; // (float) (Math.log(0.78) / Math.log(0.9));
const INFLEXION = 0.35; // Tension lines cross at (INFLEXION, 1)
// const START_TENSION = 0.5;
// const END_TENSION = 1.0;
// const P1 = START_TENSION * INFLEXION;
// const P2 = 1.0 - END_TENSION * (1.0 - INFLEXION);

const NB_SAMPLES = 100;
// The values below come from calculated values in Android code
const SPLINE_POSITION = new Float32Array([0.000022888183591973643, 0.028561000304762274, 0.05705195792956655, 0.08538917797618413, 0.11349556286812107, 0.14129881694635613, 0.16877157254923383, 0.19581093511175632, 0.22239649722992452, 0.24843841866631658, 0.2740024733220569, 0.298967680744136, 0.32333234658228116, 0.34709556909569184, 0.3702249257894571, 0.39272483400399893, 0.41456988647721615, 0.43582889025419114, 0.4564192786416, 0.476410299013587, 0.4957560715637827, 0.5145493169954743, 0.5327205670880077, 0.5502846891191615, 0.5673274324802855, 0.583810881323224, 0.5997478744397482, 0.615194045299478, 0.6301165005270208, 0.6445484042257972, 0.6585198219185201, 0.6720397744233084, 0.6850997688076114, 0.6977281404741683, 0.7099506591298411, 0.7217749311525871, 0.7331784038850426, 0.7442308394229518, 0.7549087205105974, 0.7652471277371271, 0.7752251637549381, 0.7848768260203478, 0.7942056937103814, 0.8032299679689082, 0.8119428702388629, 0.8203713516576219, 0.8285187880808974, 0.8363794492831295, 0.8439768562813565, 0.851322799855549, 0.8584111051351724, 0.8652534074722162, 0.8718525580962131, 0.8782333271742155, 0.8843892099362031, 0.8903155590440985, 0.8960465359221951, 0.9015574505919048, 0.9068736766459904, 0.9119951682409297, 0.9169321898723632, 0.9216747065581234, 0.9262420604674766, 0.9306331858366086, 0.9348476990715433, 0.9389007110754832, 0.9427903495057521, 0.9465220679845756, 0.9500943036519721, 0.9535176728088761, 0.9567898524767604, 0.959924306623116, 0.9629127700159108, 0.9657622101750765, 0.9684818726275105, 0.9710676079044347, 0.9735231939498, 0.9758514437576309, 0.9780599066560445, 0.9801485715370128, 0.9821149805689633, 0.9839677526782791, 0.9857085499421516, 0.9873347811966005, 0.9888547171706613, 0.9902689443512227, 0.9915771042095881, 0.9927840651641069, 0.9938913963715834, 0.9948987305580712, 0.9958114963810524, 0.9966274782266875, 0.997352148697352, 0.9979848677523623, 0.9985285021374979, 0.9989844084453229, 0.9993537595844986, 0.999638729860106, 0.9998403888004533, 0.9999602810470701, 1]);
// const SPLINE_TIME = [0.0000020027160644794924, 0.00350088851162047, 0.007003151791358426, 0.01050731073492783, 0.014013891323670516, 0.017523412749995883, 0.021044179982194544, 0.024568856901080967, 0.0280979711137775, 0.031639706541330116, 0.03519451220773723, 0.03875514964645756, 0.0423372877837665, 0.045926214637862096, 0.04952993904436044, 0.05315635506474042, 0.056798371623819593, 0.060456429916064494, 0.06413833724598199, 0.06784445620030391, 0.07156781872033202, 0.07531616674972634, 0.07909715635060191, 0.08290382420836998, 0.08673654031211295, 0.09059567291543116, 0.09448879921236587, 0.09841623592301589, 0.10238548120098706, 0.1063824572603719, 0.11042187412541163, 0.11449677016440878, 0.11861462606887548, 0.12278282373185179, 0.126987355296371, 0.13124270691768766, 0.13554909374444132, 0.13989962399357997, 0.1443086837217326, 0.1487764311805297, 0.15329594218191872, 0.1578814921261533, 0.16251906080588643, 0.16722992199176986, 0.17200706421147602, 0.1768505231543152, 0.18176734137227613, 0.18675748211549406, 0.19183493654626624, 0.19699255455317474, 0.20223014913089796, 0.20755459289568823, 0.21297253856042192, 0.21849070813859012, 0.22410868710132487, 0.22983299382488986, 0.23565609107139063, 0.24159827112776977, 0.2476587777887822, 0.2538367425768127, 0.2601470810489064, 0.2665984291093018, 0.2731778623571628, 0.2799115355460708, 0.28681154956949156, 0.29384830367495496, 0.3010749218486822, 0.3084750439598085, 0.31606022895742814, 0.32383978803299374, 0.3318244247571328, 0.3400374455238979, 0.3484872109433661, 0.3571820722994804, 0.36612940062166444, 0.3753490685824846, 0.3848863316828227, 0.3947316813052522, 0.404900823219966, 0.41544681404329575, 0.42638092640322844, 0.43773771089022984, 0.4495569232067814, 0.4618604042728439, 0.4747289145198632, 0.48817716003830636, 0.5023105238939309, 0.5171495959740469, 0.5328215387321904, 0.5494551735755775, 0.5671297441043959, 0.5860694487019174, 0.6064431326010606, 0.6285359393086591, 0.6527741896434158, 0.6797394217927349, 0.7102442039790938, 0.7458008080547917, 0.7892455212301439, 0.8480819880681568, 1];

/** Controls the viscous fluid effect (how much of it). */
const VISCOUS_FLUID_SCALE = 8.0;
// The values below come from calculated values in Android code
const VISCOUS_FLUID_NORMALIZE = 1.000576751788537;
const VISCOUS_FLUID_OFFSET = 0;

const { abs, exp, hypot, log, round, sign, trunc, max, min } = Math;
const pNow: typeof performance.now = performance.now.bind(performance);

const viscousFluid = (x: number) => {
    x *= VISCOUS_FLUID_SCALE;
    if (x < 1.0) {
        x -= (1.0 - exp(-x));
    } else {
        const start = 0.36787944117;   // 1/e == exp(-1)
        x = 1.0 - exp(1.0 - x);
        x = start + x * (1.0 - start);
    }
    return x;
}

const mInterpolator = (input: number) => {
    const interpolated = VISCOUS_FLUID_NORMALIZE * viscousFluid(input);
    if (interpolated > 0) {
        return interpolated + VISCOUS_FLUID_OFFSET;
    }
    return interpolated;
}

export default () => {
    let mMode = SCROLL_MODE;

    let mStartX = 0;
    let mStartY = 0;
    let mFinalX = 0;
    let mFinalY = 0;

    let mMinX = 0;
    let mMaxX = 0;
    let mMinY = 0;
    let mMaxY = 0;

    let mCurrX = 0;
    let mCurrY = 0;
    let mStartTime = 0;
    let mDuration = 0;
    let mDurationReciprocal = 0;
    let mDeltaX = 0;
    let mDeltaY = 0;
    let mFinished = true;
    const mFlywheel = true;

    let mVelocity = 0;
    let mCurrVelocity = 0;
    let mDistance = 0;

    const mPpi = (window.devicePixelRatio || 1) * 96;
    const computeDeceleration = (friction: number) => {
        return 9.80665             // g (m/s^2)
            * 39.37                // inch/meter
            * mPpi                 // pixels per inch
            * friction;
    }
    let mDeceleration = computeDeceleration(mFlingFriction);
    // A context-specific coefficient adjusted to physical values.
    let mPhysicalCoeff = computeDeceleration(0.84); // look and feel tuning
    const timePassed = () => {
        return pNow() - mStartTime;
    }
    const getCurrVelocity = () => (
        mMode == FLING_MODE ? mCurrVelocity : mVelocity - mDeceleration * timePassed() / 2000.0
    )
    const computeScrollOffset = () => {
        if (mFinished) {
            return false;
        }

        const timePassed = (pNow() - mStartTime);

        if (timePassed < mDuration) {
            switch (mMode) {
                case SCROLL_MODE:
                    const x = mInterpolator(timePassed * mDurationReciprocal);
                    mCurrX = mStartX + round(x * mDeltaX);
                    mCurrY = mStartY + round(x * mDeltaY);
                    break;
                case FLING_MODE:
                    const t = timePassed / mDuration;
                    const index = trunc(NB_SAMPLES * t);
                    let distanceCoef = 1;
                    let velocityCoef = 0;
                    if (index < NB_SAMPLES) {
                        const t_inf = index / NB_SAMPLES;
                        const t_sup = (index + 1) / NB_SAMPLES;
                        const d_inf = SPLINE_POSITION[index];
                        const d_sup = SPLINE_POSITION[index + 1];
                        velocityCoef = (d_sup - d_inf) / (t_sup - t_inf);
                        distanceCoef = d_inf + (t - t_inf) * velocityCoef;
                    }

                    mCurrVelocity = velocityCoef * mDistance / mDuration * 1000.0;

                    mCurrX = mStartX + round(distanceCoef * (mFinalX - mStartX));
                    // Pin to mMinX <= mCurrX <= mMaxX
                    mCurrX = min(mCurrX, mMaxX);
                    mCurrX = max(mCurrX, mMinX);

                    mCurrY = mStartY + round(distanceCoef * (mFinalY - mStartY));
                    // Pin to mMinY <= mCurrY <= mMaxY
                    mCurrY = min(mCurrY, mMaxY);
                    mCurrY = max(mCurrY, mMinY);

                    if (mCurrX == mFinalX && mCurrY == mFinalY) {
                        mFinished = true;
                    }

                    break;
            }
        }
        else {
            mCurrX = mFinalX;
            mCurrY = mFinalY;
            mFinished = true;
        }
        return true;
    }
    const startScroll = (startX: number, startY: number, dx: number, dy: number, duration?: number) => {
        mMode = SCROLL_MODE;
        mFinished = false;
        mDuration = (duration || DEFAULT_DURATION);
        mStartTime = pNow();
        mStartX = startX;
        mStartY = startY;
        mFinalX = startX + dx;
        mFinalY = startY + dy;
        mDeltaX = dx;
        mDeltaY = dy;
        mDurationReciprocal = 1.0 / mDuration;
    }
    const getSplineDeceleration = (velocity: number) => {
        return log(INFLEXION * abs(velocity) / (mFlingFriction * mPhysicalCoeff));
    }
    const getSplineFlingDuration = (velocity: number) => {
        const l = getSplineDeceleration(velocity);
        const decelMinusOne = DECELERATION_RATE - 1.0;
        return (1000.0 * exp(l / decelMinusOne));
    }
    const getSplineFlingDistance = (velocity: number) => {
        const l = getSplineDeceleration(velocity);
        const decelMinusOne = DECELERATION_RATE - 1.0;
        return mFlingFriction * mPhysicalCoeff * exp(DECELERATION_RATE / decelMinusOne * l);
    }
    const fling = (startX: number, startY: number, velocityX: number, velocityY: number,
        minX: number, maxX: number, minY: number, maxY: number) => {
        // Continue a scroll or fling in progress
        if (mFlywheel && !mFinished) {
            const oldVel = getCurrVelocity();

            const dx = (mFinalX - mStartX);
            const dy = (mFinalY - mStartY);
            const hyp = hypot(dx, dy);

            const ndx = dx / hyp;
            const ndy = dy / hyp;

            const oldVelocityX = ndx * oldVel;
            const oldVelocityY = ndy * oldVel;
            if (sign(velocityX) == sign(oldVelocityX) &&
                sign(velocityY) == sign(oldVelocityY)) {
                velocityX += oldVelocityX;
                velocityY += oldVelocityY;
            }
        }

        mMode = FLING_MODE;
        mFinished = false;

        const velocity = hypot(velocityX, velocityY);

        mVelocity = velocity;
        mDuration = getSplineFlingDuration(velocity);
        mStartTime = pNow();
        mStartX = startX;
        mStartY = startY;

        const coeffX = velocity == 0 ? 1.0 : velocityX / velocity;
        const coeffY = velocity == 0 ? 1.0 : velocityY / velocity;

        const totalDistance = getSplineFlingDistance(velocity);
        mDistance = (totalDistance * sign(velocity));

        mMinX = minX;
        mMaxX = maxX;
        mMinY = minY;
        mMaxY = maxY;

        mFinalX = startX + round(totalDistance * coeffX);
        // Pin to mMinX <= mFinalX <= mMaxX
        mFinalX = min(mFinalX, mMaxX);
        mFinalX = max(mFinalX, mMinX);

        mFinalY = startY + round(totalDistance * coeffY);
        // Pin to mMinY <= mFinalY <= mMaxY
        mFinalY = min(mFinalY, mMaxY);
        mFinalY = max(mFinalY, mMinY);
    }
    return {
        /**
         * 
         * Returns whether the scroller has finished scrolling.
         * 
         * @return True if the scroller has finished scrolling, false otherwise.
         */
        isFinished: () => mFinished,
        /**
         * Force the finished field to a particular value.
         *  
         * @param finished The new finished value.
         */
        forceFinished: (finished: boolean) => { mFinished = finished },
        /**
         * Returns how long the scroll event will take, in milliseconds.
         * 
         * @return The duration of the scroll in milliseconds.
         */
        getDuration: () => mDuration,
        /**
         * Returns the current X offset in the scroll. 
         * 
         * @return The new X offset as an absolute distance from the origin.
         */
        getCurrX: () => mCurrX,
        /**
         * Returns the current Y offset in the scroll. 
         * 
         * @return The new Y offset as an absolute distance from the origin.
         */
        getCurrY: () => mCurrY,
        /**
         * Returns the current velocity.
         *
         * @return The original velocity less the deceleration. Result may be
         * negative.
         */
        getCurrVelocity: getCurrVelocity,
        /**
         * Returns the start X offset in the scroll. 
         * 
         * @return The start X offset as an absolute distance from the origin.
         */
        getStartX: () => mStartX,
        /**
         * Returns the start Y offset in the scroll. 
         * 
         * @return The start Y offset as an absolute distance from the origin.
         */
        getStartY: () => mStartY,
        /**
         * Returns where the scroll will end. Valid only for "fling" scrolls.
         * 
         * @return The final X offset as an absolute distance from the origin.
         */
        getFinalX: () => mFinalX,
        /**
         * Returns where the scroll will end. Valid only for "fling" scrolls.
         * 
         * @return The final Y offset as an absolute distance from the origin.
         */
        getFinalY: () => mFinalY,
        /**
         * Call this when you want to know the new location.  If it returns true,
         * the animation is not yet finished.
         */
        computeScrollOffset: computeScrollOffset,
        /**
         * Start scrolling by providing a starting point, the distance to travel,
         * and the duration of the scroll.
         * 
         * @param startX Starting horizontal scroll offset in pixels. Positive
         *        numbers will scroll the content to the left.
         * @param startY Starting vertical scroll offset in pixels. Positive numbers
         *        will scroll the content up.
         * @param dx Horizontal distance to travel. Positive numbers will scroll the
         *        content to the left.
         * @param dy Vertical distance to travel. Positive numbers will scroll the
         *        content up.
         * @param duration Duration of the scroll in milliseconds.
         */
        startScroll: startScroll,
        /**
         * Start scrolling based on a fling gesture. The distance travelled will
         * depend on the initial velocity of the fling.
         * 
         * @param startX Starting point of the scroll (X)
         * @param startY Starting point of the scroll (Y)
         * @param velocityX Initial velocity of the fling (X) measured in pixels per
         *        second.
         * @param velocityY Initial velocity of the fling (Y) measured in pixels per
         *        second
         * @param minX Minimum X value. The scroller will not scroll past this
         *        point.
         * @param maxX Maximum X value. The scroller will not scroll past this
         *        point.
         * @param minY Minimum Y value. The scroller will not scroll past this
         *        point.
         * @param maxY Maximum Y value. The scroller will not scroll past this
         *        point.
         */
        fling: fling,
        /**
         * Stops the animation. Contrary to {@link #forceFinished(boolean)},
         * aborting the animating cause the scroller to move to the final x and y
         * position
         *
         * @see #forceFinished(boolean)
         */
        abortAnimation() {
            mCurrX = mFinalX;
            mCurrY = mFinalY;
            mFinished = true;
        },
        /**
         * Extend the scroll animation. This allows a running animation to scroll
         * further and longer, when used with {@link #setFinalX(int)} or {@link #setFinalY(int)}.
         *
         * @param extend Additional time to scroll in milliseconds.
         * @see #setFinalX(int)
         * @see #setFinalY(int)
         */
        extendDuration(extend: number) {
            const passed = timePassed();
            mDuration = passed + extend;
            mDurationReciprocal = 1.0 / mDuration;
            mFinished = false;
        },
        /**
         * Returns the time elapsed since the beginning of the scrolling.
         *
         * @return The elapsed time in milliseconds.
         */
        timePassed: timePassed,
        /**
         * Sets the final position (X) for this scroller.
         *
         * @param newX The new X offset as an absolute distance from the origin.
         * @see #extendDuration(int)
         * @see #setFinalY(int)
         */
        setFinalX(newX: number) {
            mFinalX = newX;
            mDeltaX = mFinalX - mStartX;
            mFinished = false;
        },
        /**
         * Sets the final position (Y) for this scroller.
         *
         * @param newY The new Y offset as an absolute distance from the origin.
         * @see #extendDuration(int)
         * @see #setFinalX(int)
         */
        setFinalY(newY: number) {
            mFinalY = newY;
            mDeltaY = mFinalY - mStartY;
            mFinished = false;
        },
        /**
         * @hide
         */
        isScrollingInDirection: (xvel: number, yvel: number) => (
            !mFinished && sign(xvel) == sign(mFinalX - mStartX) &&
            sign(yvel) == sign(mFinalY - mStartY)
        ),
    }
};
