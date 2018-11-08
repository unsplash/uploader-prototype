import React, { SFC } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { UploaderState } from '../../state/types';
import Form from '../Form';
import PublishingComplete from '../PublishingComplete';
import PublishingInProgress from '../PublishingInProgress';

type OwnProps = {};
type DispatchProps = {
  dispatch: Dispatch;
};
type StateProps = {
  uploaderState: UploaderState;
};
type Props = OwnProps & DispatchProps & StateProps;

const Uploader: SFC<Props> = ({ uploaderState }) => (
  <div className="container">
    <h1>Uploader</h1>
    {UploaderState.match({
      Form: formUploaderState => <Form uploaderState={formUploaderState} />,
      PublishingInProgress: publishing => <PublishingInProgress {...publishing} />,
      PublishingComplete: publishingResult => <PublishingComplete {...publishingResult} />,
    })(uploaderState)}
  </div>
);

const mapStateToProps = (state: UploaderState, _props: OwnProps): StateProps => ({
  uploaderState: state,
});

const enhance = connect(mapStateToProps);

export default enhance(Uploader);
