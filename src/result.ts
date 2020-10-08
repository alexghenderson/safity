export interface IResult<T, E> {
  /* Returns true if this is an ErrorResult */
  isError: () => boolean;
  /* Returns true if this is an OkResult */
  isOk: () => boolean;
  /* Maps the contained value */
  map: <A>(fn: (v: T) => A) => Result<A, E>;
  /* Maps the contained error */
  mapError: <A>(fn: (e: E) => A) => Result<T, A>;
  /* Executes first callback if has contained value, or second if has contained error */
  match: <A>(fn1: (v: T) => A, fn2: (e: E) => A) => A;
  /* Returns the contained value, or `v` if it is an ErrorResult */
  or: (v: T) => T;
  /* **UNSAFE** Unwraps and returns the contained value. Will throw error if called on an ErrorResult */
  _unsafeUnwrap: () => T;
  /* **UNSAFE** Unwraps and returns the contained error. Will throw error if called on an OkResult */
  _unsafeUnwrapError: () => E;
}

class ErrorResult<T, E> implements IResult<T, E> {
  constructor(private readonly _error: E) {}

  isError(): this is ErrorResult<T, E> {
    return true;
  }

  isOk(): this is OkResult<T, E> {
    return false;
  }

  map<A>(_: (v: T) => A): Result<A, E> {
    return err(this._error);
  }

  mapError<A>(fn: (v: E) => A): Result<T, A> {
    return err(fn(this._error));
  }

  match<A>(_: (v: T) => A, fn: (e: E) => A): A {
    return fn(this._error);
  }

  or(value: T) {
    return value;
  }

  _unsafeUnwrap(): T {
    throw new Error("Called `_unsafeUnwrap` on an ErrorResult");
  }

  _unsafeUnwrapError() {
    return this._error;
  }

  get error() {
    return this._error;
  }
}

class OkResult<T, E> implements IResult<T, E> {
  constructor(private readonly _value: T) {}

  isError(): this is ErrorResult<T, E> {
    return false;
  }

  isOk(): this is OkResult<T, E> {
    return true;
  }

  map<A>(fn: (v: T) => A): Result<A, E> {
    return ok(fn(this._value));
  }

  mapError<A>(_: (v: E) => A): Result<T, A> {
    return ok(this._value);
  }

  match<A>(fn: (v: T) => A, _: (e: E) => A): A {
    return fn(this._value);
  }

  or(_: T) {
    return this._value;
  }

  _unsafeUnwrap(): T {
    return this._value;
  }

  _unsafeUnwrapError(): E {
    throw new Error("Called `_unsafeUnwrapError` on an OkResult");
  }

  get value() {
    return this._value;
  }
}

export const ok = <T, E>(value: T) => new OkResult<T, E>(value);
export const err = <T, E>(error: E) => new ErrorResult<T, E>(error);

export type Result<T, E> = OkResult<T, E> | ErrorResult<T, E>;
