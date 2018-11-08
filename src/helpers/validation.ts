// This is a poor man's version of the popular `Validation` type, e.g.:
// https://github.com/gcanti/fp-ts/blob/fd0ccf39bb52622f93e01fb7b9bcb6c955d634fe/docs/Validation.md
// https://medium.com/@gcanti/functional-typescript-either-vs-validation-66c52f28ce1f
// https://folktale.origamitower.com/api/v2.3.0/en/folktale.validation.html
// http://eed3si9n.com/learning-scalaz/Validation.html

import flatten from 'lodash/flatten';

export enum Types {
  Failure = 'Failure',
  Success = 'Success',
}

export class Failure<E> {
  readonly type = Types.Failure;
  constructor(public value: E) {}
}

export class Success {
  readonly type = Types.Success;
  constructor() {}
}

export type Validation<E> = Failure<E> | Success;

const checkIsFailure = <E>(validation: Validation<E>): validation is Failure<E> =>
  validation.type === Types.Failure;

export const aggregate = <E>(validations: Validation<E>[]): Validation<E[]> => {
  const allErrors = flatten(validations.filter(checkIsFailure).map(tagged => tagged.value));

  const areAllSuccessful = allErrors.length === 0;
  if (areAllSuccessful) {
    return new Success();
  } else {
    return new Failure(allErrors);
  }
};
