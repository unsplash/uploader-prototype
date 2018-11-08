import React, { SFC } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {
  PublishedFileState,
  PublishingCompleteUploaderState,
  PublishingRequestFailureFileState,
} from '../../state/types';
import { UploaderAction } from '../../state/uploader-action';

type FailureFileStatesOwnProps = {
  failureFileStates: PublishingRequestFailureFileState[];
};
type DispatchProps = {
  dispatch: Dispatch;
};
type FailureFileStatesProps = FailureFileStatesOwnProps & DispatchProps;

class FailureFileStatesComposed extends React.PureComponent<FailureFileStatesProps> {
  onRetryButtonClick: React.MouseEventHandler<HTMLButtonElement> = _event => {
    this.props.dispatch(UploaderAction.RollbackPublishingRequestFailuresToForm({}));
  };

  render() {
    const { failureFileStates } = this.props;
    const failureListElements = failureFileStates.map(fileState => {
      const { currentState } = fileState;
      const { publishRequestFailure } = currentState;
      const message = `Failure: ${publishRequestFailure}`;
      return (
        <li key={fileState.id}>
          {fileState.file.name}: {message}
        </li>
      );
    });
    return (
      <div>
        <p>Failed: {failureFileStates.length}</p>
        <ul>{failureListElements}</ul>
        <button onClick={this.onRetryButtonClick}>Rollback to form</button>
      </div>
    );
  }
}

const FailureFileStates = connect()(FailureFileStatesComposed);

const renderSuccessFileStates = (successFileStates: PublishedFileState[]) => {
  const successListElements = successFileStates.map(fileState => {
    const { currentState } = fileState;
    const { publishResponse } = currentState;
    const message = `Success: ${publishResponse.id}`;
    return (
      <li key={fileState.id}>
        {fileState.file.name}: {message}
      </li>
    );
  });
  return (
    <div>
      Succeeded: {successFileStates.length}
      <ul>{successListElements}</ul>
    </div>
  );
};

const displayName = 'PublishingComplete';

const PublishingComplete: SFC<
  PublishingCompleteUploaderState
> = publishingCompleteUploaderState => {
  const listElements = PublishingCompleteUploaderState.match({
    AllFailed: ({ failureFileStates }) => (
      <FailureFileStates failureFileStates={failureFileStates} />
    ),
    SomeFailed: ({ failureFileStates, successFileStates }) => (
      <div>
        {renderSuccessFileStates(successFileStates)}
        <FailureFileStates failureFileStates={failureFileStates} />
      </div>
    ),
    AllSucceeded: ({ successFileStates }) => renderSuccessFileStates(successFileStates),
  })(publishingCompleteUploaderState);

  return (
    <div>
      <h3>Publishing: complete</h3>
      <p>{publishingCompleteUploaderState.tag}</p>
      {listElements}
    </div>
  );
};

PublishingComplete.displayName = displayName;

export default PublishingComplete;
