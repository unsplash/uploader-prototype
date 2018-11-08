import { fromEvent, merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as remoteData from '../../helpers/remote-data';
import { Dimensions } from '../../types/index';
import { FetchDimensionsRequest } from '../../types/requests';

const getImageElementDimensions = (imageEl: HTMLImageElement): Dimensions => {
  const { naturalWidth: width, naturalHeight: height } = imageEl;
  return {
    width,
    height,
  };
};

export const fetchDimensions = (file: File) =>
  new Observable<FetchDimensionsRequest>(observer => {
    const url = window.URL.createObjectURL(file);

    // This will be garbage collected, so we needn't worry about deleting it
    const imageEl = document.createElement('img');

    const fetchDimensionsRequest$ = merge(
      of(new remoteData.Loading()),
      fromEvent(imageEl, 'load').pipe(
        map(_event => getImageElementDimensions(imageEl)),
        map(dimensions => new remoteData.Success(dimensions)),
      ),
      fromEvent(imageEl, 'error').pipe(
        map(_event => new remoteData.Failure('Error loading image.')),
      ),
    );

    const subscription = fetchDimensionsRequest$.subscribe(observer);

    // This will trigger the image download immediately.
    imageEl.src = url;

    return () => {
      subscription.unsubscribe();
      window.URL.revokeObjectURL(url);
    };
  });
