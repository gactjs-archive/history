/**
 * Arbitrary data with a location
 */
export type State = object | null;

/**
 * An entry in a history stack.
 */
export type Location<S extends State = State> = {
  /**
   * A URL pathname, beginning with a /.
   */
  pathname: string;

  /**
   * A URL search string, beginning with a ?.
   */
  search: string;

  /**
   * A URL fragment identifier, beginning with a #.
   */
  hash: string;

  state: S;
};

/**
 * A subscriber to the stream of locations.
 */
export type Listener<S extends State> = (update: Location<S>) => void;

/**
 * The GactHistory enhances `window.history` with the ability to subscribe to location changes.
 */
export type GactHistory<S extends State = State> = {
  /**
   * The current location.
   */
  readonly location: Location<S>;

  /**
   * Pushes a new location onto the history stack, increasing its length by one.
   * If there were any entries in the stack after the current one, they are
   * lost.
   */
  push(url: string, state?: S): void;

  /**
   * Replaces the current location in the history stack with a new one. The
   * location that was replaced will no longer be available.
   */
  replace(url: string, state?: S): void;

  /**
   * Navigates `n` entries backward/forward in the history stack relative to the
   * current index. For example, a "back" navigation would use go(-1).
   */
  go(delta: number): void;

  /**
   * Navigates to the previous entry in the stack. Identical to go(-1).
   *
   * @remarks
   * - If the current location is the first location in the stack, this
   * will unload the current document.
   */
  back(): void;

  /**
   * Navigates to the next entry in the stack. Identical to go(1).
   */
  forward(): void;

  /**
   * Subscribes a listener to location changes.
   */
  subscribe(listener: Listener<S>): () => void;
};
