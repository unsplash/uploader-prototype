import pipe from 'lodash/flow';
import * as remoteData from '../../../../../../helpers/remote-data';

export const getProgressFraction = (file: File) => (
  progress: remoteData.LoadingUpload['progress'],
) => progress.loaded / file.size;

export const formatFractionAsPercentage = pipe(
  (fraction: number) => fraction * 100,
  n => `${n}%`,
);
