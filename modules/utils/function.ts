// Utilities for working with dynamic functions.
// Exports AsyncFunction constructor for runtime async code generation.

/**
 * Equivalent to `new Function(...)` but supports `await` inside the body.
 */
export const AsyncFunction = async function () {}.constructor as any;
