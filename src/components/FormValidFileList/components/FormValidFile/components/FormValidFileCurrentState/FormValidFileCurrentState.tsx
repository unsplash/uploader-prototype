import { Option } from 'funfix-core';
import pipe from 'lodash/flow';
import prettyBytes from 'pretty-bytes';
import React, { Fragment, ReactNode } from 'react';
import * as remoteData from '../../../../../../helpers/remote-data';
import {
  FormValidFileCurrentState,
  FormValidFileCurrentStateRecord,
  FormValidFileState,
} from '../../../../../../state/types';
import {
  formatFractionAsPercentage,
  getProgressFraction,
} from './FormValidFileCurrentState-helpers';

type Props = { fileState: FormValidFileState };

class FormValidFileCurrentStateComponent extends React.PureComponent<Props> {
  renderCurrentStateUploadingToS3Loading = (loading: remoteData.Loading) => {
    const { fileState } = this.props;
    const { file } = fileState;

    const maybeUploadProgress = loading.maybeUpload.map(upload => upload.progress);
    // When the request begins, there will be no progress yet.
    const progress = maybeUploadProgress.getOrElseL(() => ({ loaded: 0 }));
    const progressFraction = getProgressFraction(file)(progress);
    const progressPercentage = formatFractionAsPercentage(progressFraction);

    return (
      <Fragment>
        <div>Loading</div>
        <div>
          Progress: file sizes: {prettyBytes(progress.loaded)}/{prettyBytes(file.size)}
        </div>
        <div>Progress: percentage: {progressPercentage}</div>
        <div>
          <progress max={1} value={progressFraction} />
        </div>
      </Fragment>
    );
  };

  renderCurrentStateUploadingToS3 = (
    uploadingToS3: FormValidFileCurrentStateRecord['UploadingToS3'],
  ) => {
    const maybeBodyNode: Option<ReactNode> = (() => {
      const uploadingToS3RemoteData = uploadingToS3.uploadToS3Request;
      switch (uploadingToS3RemoteData.type) {
        case remoteData.Types.Loading:
          return Option.some(this.renderCurrentStateUploadingToS3Loading(uploadingToS3RemoteData));
        case remoteData.Types.Success:
          return Option.some('Success');
        case remoteData.Types.Failure:
          return Option.some(`Failure: ${uploadingToS3RemoteData.value}`);
        case remoteData.Types.NotAsked:
        case remoteData.Types.Reloading:
          return Option.none();
      }
    })();
    return (
      <Fragment>
        <div>Uploading to S3</div>
        {maybeBodyNode.map(el => <div>{el}</div>).orNull()}
      </Fragment>
    );
  };

  renderCurrentStateFetchingPresignedUrl = ({
    fetchPresignedUrlRequest,
  }: FormValidFileCurrentStateRecord['FetchingPresignedUrl']) => (
    <Fragment>
      <div>Fetching pre-signed URL</div>
      <div>
        {(() => {
          switch (fetchPresignedUrlRequest.type) {
            case remoteData.Types.Failure:
              return `Failure: ${fetchPresignedUrlRequest.value}`;
            case remoteData.Types.Loading:
              return 'Loading';
            case remoteData.Types.Success:
              return 'Success';
            case remoteData.Types.NotAsked:
            case remoteData.Types.Reloading:
              return null;
          }
        })()}
      </div>
    </Fragment>
  );

  render() {
    const { fileState } = this.props;
    const { currentState } = fileState;
    return pipe(
      FormValidFileCurrentState.match<React.ReactNode>({
        FetchingPresignedUrl: this.renderCurrentStateFetchingPresignedUrl,
        UploadingToS3: this.renderCurrentStateUploadingToS3,
      }),
      (node: React.ReactNode) => (
        <div>
          <h3>Current state</h3>
          {node}
        </div>
      ),
    )(currentState);
  }
}

export default FormValidFileCurrentStateComponent;
