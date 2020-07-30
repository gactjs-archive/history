import { createHistory, Location, GactHistory } from "../src";

type Step = (location: Location) => void;

export function execSteps(
  steps: Array<Step>,
  history: GactHistory,
  done: jest.DoneCallback
): void {
  let index = 0;
  let unsubscribe: () => void;

  function execNextStep(location: Location): void {
    const nextStep = steps[index++];
    nextStep(location);

    if (index === steps.length) {
      done();
      unsubscribe();
    }
  }

  if (steps.length) {
    unsubscribe = history.subscribe(execNextStep);

    execNextStep(history.location);
  } else {
    done();
  }
}

describe("history", () => {
  let history: GactHistory;

  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    history = createHistory();
  });

  test("push new location", function() {
    history.push("/home?the=query#the-hash", { state: true });

    const expectedLocation: Location = {
      pathname: "/home",
      search: "?the=query",
      hash: "#the-hash",
      state: { state: true },
    };

    expect(history.location).toStrictEqual(expectedLocation);
  });

  test("push new location with state", function() {
    history.push("/home?the=query#the-hash");

    const expectedLocation: Location = {
      pathname: "/home",
      search: "?the=query",
      hash: "#the-hash",
      state: null,
    };

    expect(history.location).toStrictEqual(expectedLocation);
  });

  test("replace new location", function() {
    history.replace("/home?the=query#the-hash");

    const expectedLocation: Location = {
      pathname: "/home",
      search: "?the=query",
      hash: "#the-hash",
      state: null,
    };

    expect(history.location).toStrictEqual(expectedLocation);
  });

  test("replace new location with state", function() {
    history.replace("/home?the=query#the-hash", { state: true });

    const expectedLocation: Location = {
      pathname: "/home",
      search: "?the=query",
      hash: "#the-hash",
      state: { state: true },
    };

    expect(history.location).toStrictEqual(expectedLocation);
  });

  test("calls subscriber with each new location", function() {
    const subscriber = jest.fn();
    history.subscribe(subscriber);

    history.push("/1");
    history.replace("/");

    expect(subscriber).toHaveBeenCalledTimes(2);
  });

  test("stops streaming new locations after unsubscribe", function() {
    const subscriber = jest.fn();
    const unsubscribe = history.subscribe(subscriber);

    history.push("/1");
    history.replace("/");

    unsubscribe();

    history.push("/1");
    history.replace("/");

    expect(subscriber).toHaveBeenCalledTimes(2);
  });

  test("back", function(done) {
    const steps: Array<Step> = [
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/",
        });

        history.push("/1");
      },
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/1",
        });

        history.back();
      },
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/",
        });
      },
    ];

    execSteps(steps, history, done);
  });

  test("forward", function(done) {
    const steps: Array<Step> = [
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/",
        });

        history.push("/1");
      },
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/1",
        });

        history.back();
      },
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/",
        });

        history.forward();
      },
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/1",
        });
      },
    ];

    execSteps(steps, history, done);
  });

  test("go", function(done) {
    const steps: Array<Step> = [
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/",
        });

        history.push("/1");
      },
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/1",
        });

        history.push("/2");
      },
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/2",
        });

        history.go(-2);
      },
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/",
        });

        history.go(2);
      },
      function(location): void {
        expect(location).toMatchObject({
          pathname: "/2",
        });
      },
    ];

    execSteps(steps, history, done);
  });

  test("fallback to window.location.assign if window.history.pushState fails", function() {
    const pushState = jest
      .spyOn(window.history, "pushState")
      .mockImplementation(function() {
        throw Error();
      });

    const assignLocation = jest
      .spyOn(window.location, "assign")
      .mockImplementation();

    history.push("/home");
    expect(assignLocation).toHaveBeenCalledWith("/home");

    pushState.mockRestore();
    assignLocation.mockRestore();
  });
});
