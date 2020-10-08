import { Result, err, ok } from "./result";

export class UnknownError extends Error {
  constructor(readonly meta: any) {
    super("Unknown error");
  }
}

export const call = <T>(fn: () => T): Result<T, Error> => {
  try {
    const result = fn();
    return ok(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return err(e);
    }
    return err(new UnknownError(e));
  }
};

export const callAsync = async <T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> => {
  try {
    const result = await fn();
    return ok(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return err(e);
    }
    return err(new UnknownError(e));
  }
};
