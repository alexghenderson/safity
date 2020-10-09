# Safity

---

## Description

### What is Safity

Javscript is great. Unfortunately, it also sucks. It's, at times, [nonsensical](https://www.destroyallsoftware.com/talks/wat), it has no real typechecking, and it's great strength - it's looseness and flexibility - is also it's greatest drawback. It's really hard to write robust applications with it.

Not all of these issues are solvable.

Typescript (as well as Flow) have added static type checking, which offsets the lack of typechecking, but it's not perfect. Errors, for example, can't really be statically typed.

Linting has been used to offset the difficulty in writing robust code, by enforcing good practices. Again, however, this is not a perfect solution.

However, when you combine these tools, you get something pretty good. Safity aims to make it even better, by:

- Adding proper typings to error handling
- and by providing tools to properly handle errors without crashing the whole application.

Safity provides fully-typed classes and functions, inspired by Rust's `Result` and `Option` types (also a prominant role in many other languages). By using Safity, you can ensure no unexpected, and unhandled errors appear in your code.

### Why use Safity

Javascript code typically throws errors when something goes wrong. This is a common pattern among programming languages - however, it's not always a good pattern. Throwing errors creates unpredicable behaviour that can heavily affect your users. As such, it should be avoided unless the error is truly something that is unrecoverable.

Safity provides types that can be used in place of throwing errors, which provides two benefits:

- The errors can be statically typed,
- and they _force_ you to handle them, or explicitly ignore them - you can't _accidentally_ forget to handle them.

## Documentation

### Installation

`npm install safity`

To make full use of safity, it is highly recommended you combine this with typescript and a strict set of linting rules. Safity is _fully_ typed.

### Usage

#### Types

##### Result Type

The result type is used to return values and propogate errors. It represents one of two outcomes of an action:

1. A successful result (`OkResult`)
2. A failure/error result (`ErrorResult`)

Example:

```typescript
import { err, ok } from "saffity";
const possibleFailure = (): Result<string, Error> => {
  if (Math.random() < 0.5) {
    return err(new Error("Oh no, it failed!"));
  }
  return ok("Phew, it worked!");
};

const result = possibleFailure();
if (result.isOk()) {
  // It succeeded, result is an OkResult
  // and typescript recognizes this
  console.log(result.value);
}
if (result.isError()) {
  // It failed, result is an ErrorResult
  // and typescript recognizes this
  console.log(result.error.message);
}
// Alternatively
result.match(
  (value: string) => {
    console.log(value);
  },
  (error: Error) => {
    console.log(error.message);
  }
);
```

Using this, _it is very difficult to accidently ignore an error_. Typescript _will_ complain if you try to access the value without checking `isOk()` or `isError()`. Furthermore, the error is _fully_ typed.

This is anagolous to Rust's `std::Result` type, and is sometimes referred to as the `Either` monad (such as in Haskell).

Note: The Result types are inferred if not explicitly typed, but can be explicitly typed as well:

```typescript
ok("Value"); // returns OkResult<string, unknown>
ok<string, Error>("Value"); // returns OkResult<string, Error>

err(new Error("An error")); // returns ErrorResult<unknown, Error>
err<string, Error>(new Error("An error")); // returns ErrorResult<string, Error>;
```

##### Maybe Type

The Maybe type is used to represent a optional value. It is similar to simply using `undefined`, but unlike `undefined`, it is an explicit representation of a possibly unset value. Namely, it is a data structure with two possible values:

1. _Something_, of type T, or
2. Nothing.

Example:

```typescript
import { none, some } from "safity";
const getUserFromDatabase = (): Maybe<User> => {
  const user = getUser();
  if (user === null) {
    return none();
  }
  return some(user);
};

const user = getUserFromDatabase();
if (user.isSome()) {
  // User has a value
  console.log(user.value);
}
if (user.isNone()) {
  // User has no value
  console.log("No value");
}

// Alternatively
user.match(
  (value) => {
    console.log(value);
  },
  () => {
    console.log("No value");
  }
);
```

This is anagolous to Rust's `std::Option` type, and is often called the `Maybe`, `Option`, or `Optional` monad.

Note: The Maybe types are inferred if not explicitly typed, but can be explicitly typed as well:

```typescript
some("Value"); // returns SomeResult<string>
some<string>("Value"); // returns SomeResult<string>

none(); // returns NoneResult<unknown>
none<string>(); // returns NoneResult<string>
```

#### Interop

Unfortunately, Javascript's ecosystem has evolved to throw errors all over the place. Even when done responsibly, it is very easy to fail to handle these errors within your own code - either through not knowing a function throws due to poor documentation, or even through forgetting. The interop functions are designed to make calling code that _could_ throw safer, by wrapping the result in a `Result` type.

The interop function come in two varieties - `call`, and `callAsync`.

##### call

The method `call` calls a function and wraps the result in the `Result` type. If the function throws an error, `call` will wrap the result in `Error` (if not already an `Error` object), and return an `ErrorResult`. Otherwise, it will return an `OkResult`.

Example:

```typescript
import { call } from "safity";
import { somePossiblyThrowingFunction } from "other-package";

const result = call(() => somePossiblyThrowingFunction());

if (result.isOk()) {
  console.log(result.value);
}
if (result.isError()) {
  console.log("Something went wrong", result.error);
}
```

#### callAsync

The method `callAsync` is identical to `call` except it works for functions that return promises. If the promise resolves, `callAsync` will resolve to an `OkResult` containing the resolved value. If the promise is rejected, `callAsync` will resolve to a `ErrorResult` containing the rejected value (wrapped in an Error, if not already an Error object).

Example:

```typescript
import { callAsync } from "safity";
import { somePossiblyThrowingAsyncFunction } from "other-package";

callAsync(() => somePossiblyThrowingAsyncFunction()).then((result) => {
  if (result.isOk()) {
    console.log(result.value);
  }
  if (result.isError()) {
    console.log("Something went wrong", result.error);
  }
});
```

For both `call` and `callAsync`, the returning result value will be properly typed as long as the function has a clearly defined return type. They can also be explicitly typed if necessary.

Example:

```typescript
call(() => "value"); // returns OkResult<string, Error>
call(() => throw new Error("error")); // returns ErrorResult<unkown, Error>
call<string>(() => throw new Error("error")); // returns ErrorResult<string, Error>
```

**It is strongly recommended that you explicitly type the return type if the function is not typed!**

## Similar work

Safity is not the first package to do implement these types. There is a number of other packages which implement similar functionality - some of which heavily inspired Safity. A non-exhaustive list:

- [neverthrow](https://www.npmjs.com/package/neverthrow)
- [fp-ts](https://www.npmjs.com/package/fp-ts)
- [m.m](https://www.npmjs.com/package/m.m)
