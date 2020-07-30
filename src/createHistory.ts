import { State, Location, GactHistory, Listener } from "./types";

const PopStateEventType = "popstate";

/**
 * Retrieves the current `Location`
 *
 * @typeParam S - the state associated with a location;
 */
function getLocation<S extends State>(): Location<S> {
  const { pathname, search, hash } = window.location;
  const state = window.history.state || null;
  return {
    pathname,
    search,
    hash,
    state,
  };
}

/**
 * Creates a `GactHistory`.
 *
 * @typeParam S - the state associated with a location;
 */
export function createHistory<S extends State = State>(): GactHistory<S> {
  let location = getLocation<S>();
  const listeners: Set<Listener<S>> = new Set();

  function subscribe(listener: Listener<S>): () => void {
    listeners.add(listener);

    return function(): void {
      listeners.delete(listener);
    };
  }

  function transition(): void {
    location = getLocation();

    for (const listener of listeners) {
      listener(location);
    }
  }

  function push(url: string, state?: State): void {
    // try...catch because iOS limits us to 100 pushState calls :/
    // TODO: Support forced reloading
    try {
      window.history.pushState(state, "", url);
    } catch (error) {
      // They are going to lose state here, but there is no real
      // way to warn them about it since the page will refresh...
      window.location.assign(url);
    }

    transition();
  }

  function replace(url: string, state?: State): void {
    // TODO: Support forced reloading
    window.history.replaceState(state, "", url);

    transition();
  }

  function go(delta: number): void {
    window.history.go(delta);
  }

  function back(): void {
    window.history.back();
  }

  function forward(): void {
    window.history.forward();
  }

  window.addEventListener(PopStateEventType, transition);

  return {
    get location(): Location<S> {
      return location;
    },
    subscribe,
    push,
    replace,
    go,
    back,
    forward,
  };
}
