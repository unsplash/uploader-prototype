// This helper allows us to run individual epics for each item in a dynamic list (e.g. files in the
// uploader).

// When the list item is added to the list state, the epic will be start running.

// When the list item is removed from the list state, the epic will be unsubscribed from, thereby
// aborting any pending work (e.g. requests).

// We should do a blog post on this!

// https://github.com/redux-observable/redux-observable/issues/562

import { Option } from 'funfix-core';
import difference from 'lodash/difference';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import { Action as ReduxAction } from 'redux';
import { ActionsObservable, Epic } from 'redux-observable';
import { Observable, OperatorFunction } from 'rxjs';
import { mergeHigherOrderArray } from 'rxjs-etc/observable/mergeHigherOrderArray';
import { distinctUntilChanged, map, scan } from 'rxjs/operators';
import { catOption$ } from './observable-option';
import { getStateObservable } from './redux-observable';

type RunListEpicsParams<ListItemState, Action extends ReduxAction> = {
  action$: ActionsObservable<Action>;
  getListItemKey: (listItemState: ListItemState) => string;
  selectListItem: (id: string) => (states: ListItemState[]) => Option<ListItemState>;
  listItemEpic: Epic<Action, Action, ListItemState>;
};
export const runListEpics = <ListItemState, Action extends ReduxAction>({
  action$,
  getListItemKey,
  selectListItem,
  listItemEpic,
}: RunListEpicsParams<ListItemState, Action>): OperatorFunction<ListItemState[], Action> => {
  type ListItemAction$sById = { [id: string]: Observable<Action> };

  const seed: ListItemAction$sById = {};

  return listItemStates$ => {
    const getListItemStateStateObservable = (id: string, initialState: ListItemState) => {
      const listItemState$ = listItemStates$.pipe(
        map(selectListItem(id)),
        // When the list item is removed, this observable will emit `None` right before it
        // is unsubscribed, so we filter this out.
        catOption$(),
        distinctUntilChanged(),
      );
      return getStateObservable(listItemState$, initialState);
    };

    return listItemStates$.pipe(
      // When an ID is added, invoke the epic and store the result.
      // When an ID is deleted, delete the epic result.
      scan((listItemAction$sById: ListItemAction$sById, listItemStates: ListItemState[]) => {
        const listItemStatesById = keyBy(listItemStates, getListItemKey);
        const oldIds = Object.keys(listItemAction$sById);

        const addedStates = omit(listItemStatesById, oldIds);
        const added = mapValues(addedStates, (listItemState, addedId) => {
          const listItemStateObservable$ = getListItemStateStateObservable(addedId, listItemState);
          const listItemAction$ = listItemEpic(action$, listItemStateObservable$, {});
          return listItemAction$;
        });

        const newIds = Object.keys(listItemStatesById);
        const deletedIds = difference(oldIds, newIds);
        const afterDeleted = omit(listItemAction$sById, deletedIds);
        return {
          ...added,
          ...afterDeleted,
        };
      }, seed),
      map(listItemAction$sById => Object.values(listItemAction$sById)),
      // When an observable is added, subscribe and emit values.
      // When an observable is deleted, unsubscribe.
      mergeHigherOrderArray(),
    );
  };
};
