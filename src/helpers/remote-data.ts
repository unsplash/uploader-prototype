// http://package.elm-lang.org/packages/krisajenkins/remotedata/4.3.0/RemoteData
import { Option } from 'funfix-core';
import overSome from 'lodash/overSome';

export enum Types {
  NotAsked = 'NotAsked',
  Loading = 'Loading',
  Reloading = 'Reloading',
  Failure = 'Failure',
  Success = 'Success',
}

export class NotAsked {
  readonly type = Types.NotAsked;
}

export type LoadingUpload = { progress: { loaded: number } };

export class Loading {
  readonly type = Types.Loading;
  // TODO: this is not serialisable
  constructor(public maybeUpload: Option<LoadingUpload> = Option.none()) {}
}

export class Reloading<A> {
  readonly type = Types.Reloading;
  constructor(public value: A) {}
}

export class Failure<E> {
  readonly type = Types.Failure;
  constructor(public value: E) {}
}

export class Success<A> {
  readonly type = Types.Success;
  constructor(public value: A) {}
}

export type Loaded<E, A> = Failure<E> | Success<A>;

// eslint-disable-next-line space-infix-ops
export type RemoteData<E, A> = NotAsked | Loading | Reloading<A> | Loaded<E, A>;

export const checkIsSuccess = <E, A>(remoteData: RemoteData<E, A>): remoteData is Success<A> =>
  remoteData.type === Types.Success;
export const checkIsNotAsked = <E, A>(remoteData: RemoteData<E, A>): remoteData is NotAsked =>
  remoteData.type === Types.NotAsked;
export const checkIsFailure = <E, A>(remoteData: RemoteData<E, A>): remoteData is Failure<E> =>
  remoteData.type === Types.Failure;
export const checkIsLoading = <E, A>(remoteData: RemoteData<E, A>): remoteData is Loading =>
  remoteData.type === Types.Loading;
export const checkIsReloading = <E, A>(remoteData: RemoteData<E, A>): remoteData is Reloading<A> =>
  remoteData.type === Types.Reloading;
export const checkIsLoaded = <E, A>(remoteData: RemoteData<E, A>): remoteData is Loaded<E, A> =>
  overSome(checkIsFailure, checkIsSuccess)(remoteData);

export const getLoaded = <E, A>(remoteData: RemoteData<E, A>): Option<Loaded<E, A>> =>
  Option.of(remoteData).filter(checkIsLoaded);
export const getFailureValue = <E, A>(remoteData: RemoteData<E, A>): Option<E> =>
  Option.of(remoteData)
    .filter(checkIsFailure)
    .map(tagged => tagged.value);
export const getSuccessValue = <E, A>(remoteData: RemoteData<E, A>): Option<A> =>
  Option.of(remoteData)
    .filter(checkIsSuccess)
    .map(tagged => tagged.value);
