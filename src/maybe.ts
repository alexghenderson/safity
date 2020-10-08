import { Result, ok, err } from "./result";

export interface IMaybe<T> {
  /* Returns true if this is a SomeMaybe */
  isSome: () => boolean;
  /* Returns true if this is a NoneMaybe */
  isNone: () => boolean;
  /* Maps the contained value */
  map: <A>(fn: (v: T) => A) => Maybe<A>;
  /* Flat maps the contained value */
  flatMap: <A>(fn: (v: T) => Maybe<A>) => Maybe<A>;
  /* Calls first function if has contained value, otherwise second function */
  match: <A>(fn1: (v: T) => A, fn2: () => A) => A;
  /* Converts SomeMaybe to an OkResult, and a NoneMaybe to an ErrorResult */
  okOr: <E>(err: E) => Result<T, E>;
  /* Returns contained value, or passed value */
  or: (v: T) => T;
  /* **UNSAFE** Unwraps the contained value. Will throw an error if called on a NoneMaybe */
  _unsafeUnwrap: () => T;
}

export class SomeMaybe<T> implements IMaybe<T> {
  constructor(private readonly _value: T) {}

  isSome(): this is SomeMaybe<T> {
    return true;
  }

  isNone(): this is NoneMaybe<T> {
    return false;
  }

  map<A>(fn: (v: T) => A): Maybe<A> {
    return some(fn(this._value));
  }

  flatMap<A>(fn: (v: T) => Maybe<A>): Maybe<A> {
    return fn(this._value);
  }

  match<A>(fn: (v: T) => A, _: () => A): A {
    return fn(this._value);
  }

  okOr<E>(_: E): Result<T, E> {
    return ok(this._value);
  }

  or(_: T) {
    return this._value;
  }

  _unsafeUnwrap() {
    return this._value;
  }

  get value() {
    return this._value;
  }
}

export class NoneMaybe<T> implements IMaybe<T> {
  isSome(): this is SomeMaybe<T> {
    return false;
  }

  isNone(): this is NoneMaybe<T> {
    return true;
  }

  map<A>(_: (v: T) => A): Maybe<A> {
    return none();
  }

  flatMap<A>(_: (v: T) => Maybe<A>): Maybe<A> {
    return none();
  }

  match<A>(_: (v: T) => A, fn: () => A): A {
    return fn();
  }

  okOr<E>(error: E): Result<T, E> {
    return err(error);
  }

  or(v: T) {
    return v;
  }

  _unsafeUnwrap(): never {
    throw new Error("Called `_unsafeUnwrap` on a NoneMaybe");
  }
}

export const some = <T>(v: T) => new SomeMaybe(v);
export const none = <T>() => new NoneMaybe<T>();
export type Maybe<T> = SomeMaybe<T> | NoneMaybe<T>;
