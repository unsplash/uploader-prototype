import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { UploaderAction } from '../../state/uploader-action';
import { FormInvalidFileState } from '../../state/types';
import AllGroupsList from './components/AllGroupsList';

type OwnProps = { fileStates: FormInvalidFileState[] };
type DispatchProps = {
  dispatch: Dispatch;
};
type StateProps = {};
type Props = OwnProps & DispatchProps & StateProps;

class FormInvalidFileList extends React.PureComponent<Props> {
  onClearButtonClick: React.MouseEventHandler<HTMLButtonElement> = _event => {
    this.props.dispatch(UploaderAction.ClearInvalidFiles({}));
  };

  render() {
    const { fileStates } = this.props;

    return (
      <div>
        <div>Invalid files: {fileStates.length}</div>
        <button
          onClick={this.onClearButtonClick}
          // We must declare this type to avoid this button triggering submit
          type="button"
        >
          Clear
        </button>
        <AllGroupsList fileStates={fileStates} />
      </div>
    );
  }
}

export default connect()(FormInvalidFileList);
