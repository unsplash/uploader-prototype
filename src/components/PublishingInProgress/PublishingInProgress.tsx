import React, { SFC } from 'react';
import * as remoteData from '../../helpers/remote-data';
import { PublishingInProgressUploaderState } from '../../state/types';

const displayName = 'PublishingInProgress';

const PublishingInProgress: SFC<PublishingInProgressUploaderState> = ({ fileStates }) => {
  const listElements = fileStates.map(fileState => {
    const { currentState } = fileState;
    const { publishRequest } = currentState;
    const publishRequestState = (() => {
      switch (publishRequest.type) {
        case remoteData.Types.Success: {
          const response = publishRequest.value;
          return `Success: ID: ${response.id}`;
        }
        case remoteData.Types.Failure: {
          const failureValue = publishRequest.value;
          return `Failure: ${failureValue}`;
        }
        case remoteData.Types.NotAsked:
        case remoteData.Types.Reloading:
        case remoteData.Types.Loading:
          return `${publishRequest.type}`;
      }
    })();
    return (
      <li key={fileState.id}>
        {fileState.file.name}: {publishRequestState}
      </li>
    );
  });
  return (
    <div>
      <h3>Publishing: in progress</h3>
      <ul>{listElements}</ul>
    </div>
  );
};

PublishingInProgress.displayName = displayName;

export default PublishingInProgress;
