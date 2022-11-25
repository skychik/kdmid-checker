/**
 * Helper function for exhaustive checks of discriminated unions in TypeScript
 */
export function assertNever(value: never): never {
    throw new Error(`Unhandled discriminated union member: ${value}`);
}

const sleep = (timeInMs) => new Promise((resolve) => setTimeout(resolve, timeInMs));
export const smallSleep = async () => {
    await sleep((10 + 60 * Math.random()) * 1000);
}