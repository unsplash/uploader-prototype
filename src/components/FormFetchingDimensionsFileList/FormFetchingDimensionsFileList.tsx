import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { FormFetchingDimensionsFileState } from '../../state/types';
import FormFetchingDimensionsFile from './components/FormFetchingDimensionsFile';

type OwnProps = { fileStates: FormFetchingDimensionsFileState[] };
type DispatchProps = {
  dispatch: Dispatch;
};
type StateProps = {};
type Props = OwnProps & DispatchProps & StateProps;

class FormFetchingDimensionsFileList extends React.PureComponent<Props> {
  render() {
    const { fileStates } = this.props;
    return (
      <div>
        <div>Fetching dimensions for files: {fileStates.length}</div>
        <ul>
          {fileStates.map(fileState => (
            <li key={fileState.id}>
              <FormFetchingDimensionsFile fileState={fileState} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default connect()(FormFetchingDimensionsFileList);
