import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { FILES_UPPER_LIMIT } from '../../constants';
import { FormValidFileState } from '../../state/types';
import { UploaderAction } from '../../state/uploader-action';
import FormValidFile from './components/FormValidFile';
import { checkFileStatesHasRemoteDataFailure } from './FormValidFileList-helpers';

type OwnProps = { fileStates: FormValidFileState[] };
type DispatchProps = {
  dispatch: Dispatch;
};
type StateProps = {};
type Props = OwnProps & DispatchProps & StateProps;

class FormValidFileList extends React.PureComponent<Props> {
  onErrorsRetryButtonClick: React.MouseEventHandler<HTMLButtonElement> = _event => {
    this.props.dispatch(UploaderAction.RetryFailedRequestsForValidFiles({}));
  };

  render() {
    const { fileStates } = this.props;

    const fileStatesHasRemoteDataFailure = checkFileStatesHasRemoteDataFailure(fileStates);
    const maybeErrors = fileStatesHasRemoteDataFailure && (
      <p>
        There was an error with some of your files.{' '}
        <button
          onClick={this.onErrorsRetryButtonClick}
          // We must declare this type to avoid this button triggering submit
          type="button"
        >
          Retry
        </button>
      </p>
    );

    return (
      <div>
        <div>
          Valid files: {fileStates.length}/{FILES_UPPER_LIMIT}
        </div>

        <ul>
          {fileStates.map(fileState => (
            <li key={fileState.id}>
              <FormValidFile fileState={fileState} />
            </li>
          ))}
        </ul>

        {maybeErrors}
      </div>
    );
  }
}

export default connect()(FormValidFileList);
