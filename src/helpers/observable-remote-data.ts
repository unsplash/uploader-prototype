import { Option } from 'funfix-core';
import { EMPTY, Observable, of, OperatorFunction, pipe, Subscriber } from 'rxjs';
import { ajax, AjaxRequest, AjaxResponse } from 'rxjs/ajax';
import { catchError, expand, map, mergeMapTo, startWith, take } from 'rxjs/operators';
import * as remoteData from './remote-data';

import RemoteData = remoteData.RemoteData;

export const ajaxUsingRemoteData = <MappedAjaxResponse>(
  request: AjaxRequest,
  mapAjaxResponse: (ajaxResponse: AjaxResponse) => MappedAjaxResponse,
): Observable<RemoteData<string, MappedAjaxResponse>> =>
  new Observable<RemoteData<string, MappedAjaxResponse>>(subscriber => {
    const progressSubscriber = new Subscriber<ProgressEvent>(
      progressEvent =>
        subscriber.next(
          new remoteData.Loading(Option.some({ progress: { loaded: progressEvent.loaded } })),
        ),
      // Forward next but not error and complete
      // When progress is complete, we send the response *then* complete.
      // When there's an error, we'll receive the error message via the response source.
      () => {},
    );
    const ajax$ = ajax({
      ...request,
      progressSubscriber,
    }).pipe(
      map(
        pipe(
          ajaxResponse => mapAjaxResponse(ajaxResponse),
          mappedAjaxResponse => new remoteData.Success(mappedAjaxResponse),
        ),
      ),
      catchError(error => of(new remoteData.Failure(error.message as string))),
      // Explicit generic needed to workaround https://github.com/ReactiveX/rxjs/issues/4013
      startWith<RemoteData<string, MappedAjaxResponse>>(new remoteData.Loading()),
    );
    const subscription = ajax$.subscribe(subscriber);
    return () => subscription.unsubscribe();
  });

// When we receive a Failure, and then when we receive a notification, repeat the observable
export const retryWhenForRemoteData = <E, A>(
  notifier$: Observable<{}>,
): OperatorFunction<RemoteData<E, A>, RemoteData<E, A>> => t$ =>
  t$.pipe(
    expand(
      (remoteDataValue: RemoteData<E, A>) =>
        remoteData.checkIsFailure(remoteDataValue)
          ? notifier$.pipe(
              take(1),
              mergeMapTo(t$),
            )
          : EMPTY,
    ),
  );
