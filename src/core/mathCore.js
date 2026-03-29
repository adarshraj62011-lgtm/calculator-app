import * as math from 'mathjs';

/**
 * Basic Math Functions
 */
export const add = (a, b) => math.add(a, b);
export const subtract = (a, b) => math.subtract(a, b);
export const multiply = (a, b) => math.multiply(a, b);
export const divide = (a, b) => {
    if (b === 0) throw new Error("Error: Division by zero");
    return math.divide(a, b);
};
export const modulus = (a, b) => {
    if (b === 0) throw new Error("Error: Division by zero");
    return math.mod(a, b)
};
export const percentage = (value, total = 100) => math.divide(math.multiply(value, total), 100);

/**
 * Scientific Functions
 */
export const squareRoot = (a) => {
    if (a < 0) throw new Error("Error: Square root of negative number");
    return math.sqrt(a);
};
export const power = (a, b) => math.pow(a, b);
export const sin = (angle, mode = 'deg') => mode === 'deg' ? math.sin(math.unit(angle, 'deg')) : math.sin(angle);
export const cos = (angle, mode = 'deg') => mode === 'deg' ? math.cos(math.unit(angle, 'deg')) : math.cos(angle);
export const tan = (angle, mode = 'deg') => {
    let result = mode === 'deg' ? math.tan(math.unit(angle, 'deg')) : math.tan(angle);
    if (Math.abs(result) > 1e10) throw new Error("Error: Undefined");
    return result;
};
export const log10 = (a) => {
    if (a <= 0) throw new Error("Error: Logarithm of non-positive number");
    return math.log10(a);
};
export const factorial = (a) => {
    if (a < 0 || !Number.isInteger(a)) throw new Error("Error: Factorial requires a positive integer");
    return math.factorial(a);
};

export const evaluateExpression = (expr) => {
    try {
        const result = math.evaluate(expr);
        if (result === Infinity || Number.isNaN(result)) throw new Error("Error: Invalid operation");
        return result;
    } catch (error) {
        throw new Error("Error: Invalid expression");
    }
};
