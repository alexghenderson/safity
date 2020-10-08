import { ok, err, OkResult, ErrorResult } from "../src/result";
import { some, none, SomeMaybe, NoneMaybe } from "../src/maybe";
import { call, callAsync, UnknownError } from "../src/interop";

describe("OkResult", () => {
  it("Create an OkResult", () => {
    const val = ok("test");
    expect(val.isOk()).toBe(true);
    expect(val.isError()).toBe(false);
    expect(val).toBeInstanceOf(OkResult);
  });

  it("OkResult.map", () => {
    const val = ok("test");
    expect(val.map((v) => v.toUpperCase())._unsafeUnwrap()).toBe("TEST");
    expect(val.map((v) => v.toUpperCase())).toBeInstanceOf(OkResult);
  });

  it("OkResult.mapError", () => {
    const mapper = jest.fn();
    const val = ok("test");
    expect(val.mapError(mapper)._unsafeUnwrap()).toBe("test");
    expect(val.mapError(mapper)).toBeInstanceOf(OkResult);
    expect(mapper).not.toHaveBeenCalled();
  });

  it("OkResult.flatMap", () => {
    const val = ok("test");
    expect(val.flatMap((v) => ok(v.toUpperCase()))).toBeInstanceOf(OkResult);
    expect(
      val.flatMap((v) => ok(v.toUpperCase()))._unsafeUnwrap()
    ).not.toBeInstanceOf(OkResult);
    expect(val.flatMap((v) => ok(v.toUpperCase()))._unsafeUnwrap()).toBe(
      "TEST"
    );
  });

  it("OkResult.flatMapError", () => {
    const matcher = jest.fn();
    const val = ok("test");
    expect(val.flatMapError(matcher)).toBeInstanceOf(OkResult);
    expect(val.flatMapError(matcher)._unsafeUnwrap()).not.toBeInstanceOf(
      OkResult
    );
    expect(val.flatMapError(matcher)._unsafeUnwrap()).toBe("test");
    expect(matcher).not.toHaveBeenCalled();
  });

  it("OkResult.match", () => {
    const okmatcher = jest.fn();
    const errmatcher = jest.fn();
    const val = ok("test");
    val.match(okmatcher, errmatcher);
    expect(okmatcher).toHaveBeenCalled();
    expect(errmatcher).not.toHaveBeenCalled();
  });

  it("OkResult.or", () => {
    const val = ok("test");
    expect(val.or("other")).toBe("test");
  });
});

describe("ErrorResult", () => {
  it("Create an ErrorResult", () => {
    const val = err("test");
    expect(val.isOk()).toBe(false);
    expect(val.isError()).toBe(true);
    expect(val).toBeInstanceOf(ErrorResult);
  });

  it("ErrorResult.map", () => {
    const mapper = jest.fn();
    const val = err("test");
    expect(val.map(mapper)._unsafeUnwrapError()).toBe("test");
    expect(val.map(mapper)).toBeInstanceOf(ErrorResult);
    expect(mapper).not.toHaveBeenCalled();
  });

  it("ErrorResult.mapError", () => {
    const val = err("test");
    expect(val.mapError((v) => v.toUpperCase())._unsafeUnwrapError()).toBe(
      "TEST"
    );
    expect(val.mapError((v) => v.toUpperCase())).toBeInstanceOf(ErrorResult);
  });

  it("ErrorResult.flatMap", () => {
    const mapper = jest.fn();
    const val = err("test");
    expect(val.flatMap(mapper)).toBeInstanceOf(ErrorResult);
    expect(val.flatMap(mapper)._unsafeUnwrapError()).not.toBeInstanceOf(
      ErrorResult
    );
    expect(val.flatMap(mapper)._unsafeUnwrapError()).toBe("test");
    expect(mapper).not.toHaveBeenCalled();
  });

  it("ErrorResult.flatMapError", () => {
    const val = err("test");
    expect(val.flatMapError((v) => err(v.toUpperCase()))).toBeInstanceOf(
      ErrorResult
    );
    expect(
      val.flatMapError((v) => err(v.toUpperCase()))._unsafeUnwrapError()
    ).not.toBeInstanceOf(ErrorResult);
    expect(
      val.flatMapError((v) => err(v.toUpperCase()))._unsafeUnwrapError()
    ).toBe("TEST");
  });

  it("ErrorResult.match", () => {
    const okmatcher = jest.fn();
    const errmatcher = jest.fn();
    const val = err("test");
    val.match(okmatcher, errmatcher);
    expect(okmatcher).not.toHaveBeenCalled();
    expect(errmatcher).toHaveBeenCalled();
  });

  it("ErrorResult.or", () => {
    const val = err("test");
    expect(val.or("other")).toBe("other");
  });
});

describe("SomeMaybe", () => {
  it("Create a SomeMaybe", () => {
    const val = some("test");
    expect(val.isSome()).toBe(true);
    expect(val.isNone()).toBe(false);
    expect(val).toBeInstanceOf(SomeMaybe);
  });

  it("SomeMaybe.map", () => {
    const val = some("test");
    expect(val.map((v) => v.toUpperCase())._unsafeUnwrap()).toBe("TEST");
    expect(val.map((v) => v.toUpperCase())).toBeInstanceOf(SomeMaybe);
  });

  it("SomeMaybe.flatMap", () => {
    const val = some("test");
    expect(val.flatMap((v) => some(v.toUpperCase()))).toBeInstanceOf(SomeMaybe);
    expect(
      val.flatMap((v) => some(v.toUpperCase()))._unsafeUnwrap()
    ).not.toBeInstanceOf(SomeMaybe);
    expect(val.flatMap((v) => some(v.toUpperCase()))._unsafeUnwrap()).toBe(
      "TEST"
    );
  });

  it("SomeMaybe.match", () => {
    const somematcher = jest.fn();
    const nonematcher = jest.fn();
    const val = some("test");
    val.match(somematcher, nonematcher);
    expect(somematcher).toHaveBeenCalled();
    expect(nonematcher).not.toHaveBeenCalled();
  });

  it("SomeMaybe.okOr", () => {
    const val = some("test");
    expect(val.okOr("other")).toBeInstanceOf(OkResult);
    expect(val.okOr("other")._unsafeUnwrap()).toBe("test");
  });

  it("SomeMaybe.or", () => {
    const val = some("test");
    expect(val.or("other")).toBe("test");
  });
});

describe("NoneMaybe", () => {
  it("Create a NoneMaybe", () => {
    const val = none();
    expect(val.isSome()).toBe(false);
    expect(val.isNone()).toBe(true);
    expect(val).toBeInstanceOf(NoneMaybe);
  });

  it("NoneMaybe.map", () => {
    const mapper = jest.fn();
    const val = none();
    expect(val.map(mapper)).toBeInstanceOf(NoneMaybe);
    expect(mapper).not.toHaveBeenCalled();
  });

  it("NoneMaybe.flatMap", () => {
    const mapper = jest.fn();
    const val = none();
    expect(val.map(mapper)).toBeInstanceOf(NoneMaybe);
    expect(mapper).not.toHaveBeenCalled();
  });

  it("NoneMaybe.match", () => {
    const somematcher = jest.fn();
    const nonematcher = jest.fn();
    const val = none();
    val.match(somematcher, nonematcher);
    expect(somematcher).not.toHaveBeenCalled();
    expect(nonematcher).toHaveBeenCalled();
  });

  it("NoneMaybe.okOr", () => {
    const val = none();
    expect(val.okOr("other")).toBeInstanceOf(ErrorResult);
    expect(val.okOr("other")._unsafeUnwrapError()).toBe("other");
  });

  it("NoneMaybe.or", () => {
    const val = none();
    expect(val.or("other")).toBe("other");
  });
});

describe("Interop", () => {
  it("Call.ok", () => {
    const result = call(() => {
      return "test";
    });
    expect(result.isOk()).toBe(true);
    expect(result.isError()).toBe(false);
    expect(result._unsafeUnwrap()).toBe("test");
    expect(result).toBeInstanceOf(OkResult);
  });

  it("Call.error", () => {
    const result = call(() => {
      throw "test";
    });
    expect(result.isOk()).toBe(false);
    expect(result.isError()).toBe(true);
    expect(result._unsafeUnwrapError()).toBeInstanceOf(UnknownError);
    expect((result._unsafeUnwrapError() as UnknownError).meta).toBe("test");
    expect(result).toBeInstanceOf(ErrorResult);
  });

  it("CallAsync.ok", async () => {
    const result = await callAsync(() => Promise.resolve("test"));
    expect(result.isOk()).toBe(true);
    expect(result.isError()).toBe(false);
    expect(result._unsafeUnwrap()).toBe("test");
    expect(result).toBeInstanceOf(OkResult);
  });

  it("CallAsync.error", async () => {
    const result = await callAsync(() => Promise.reject("test"));
    expect(result.isOk()).toBe(false);
    expect(result.isError()).toBe(true);
    expect(result._unsafeUnwrapError()).toBeInstanceOf(UnknownError);
    expect((result._unsafeUnwrapError() as UnknownError).meta).toBe("test");
    expect(result).toBeInstanceOf(ErrorResult);
  });
});
