import prettyBytes from 'pretty-bytes';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { FormValidFileState } from '../../../../state/types';
import { UploaderAction } from '../../../../state/uploader-action';
import ImgFromFile from '../../../ImgFromFile';
import FormValidFileCurrentState from './components/FormValidFileCurrentState';
import { getDimensions, getRemoveButtonText } from './FormValidFile-helpers';

type OwnProps = {
  fileState: FormValidFileState;
};
type DispatchProps = {
  dispatch: Dispatch;
};
type StateProps = {};
type Props = OwnProps & DispatchProps & StateProps;

const imgProps = { height: 60, className: 'formValidFile__img' };

class FormValidFile extends React.PureComponent<Props> {
  onRemoveButtonClick: React.ReactEventHandler<HTMLButtonElement> = _event => {
    this.props.dispatch(UploaderAction.RemoveFile({ id: this.props.fileState.id }));
  };

  renderRemoveButton = (removeButtonText: string) => (
    <button
      onClick={this.onRemoveButtonClick}
      // We must declare this type to avoid this button triggering submit
      type="button"
    >
      {removeButtonText}
    </button>
  );

  render() {
    const { fileState } = this.props;
    const { file, currentState } = fileState;
    const currentStateElement = <FormValidFileCurrentState fileState={fileState} />;

    const dimensions = getDimensions(currentState);
    const dimensionsEl = (
      <Fragment>
        <dt>Width</dt>
        <dd>{dimensions.width}</dd>
        <dt>Height</dt>
        <dd>{dimensions.height}</dd>
      </Fragment>
    );

    const formattedFileSize = prettyBytes(file.size);
    const metadata = (
      <div>
        <h3>Metadata</h3>
        <dl>
          <dt>File name</dt>
          <dd>{file.name}</dd>
          <dt>File size</dt>
          <dd>{formattedFileSize}</dd>
          {dimensionsEl}
        </dl>
      </div>
    );

    const removeButtonText = getRemoveButtonText(currentState);

    return (
      <div className="formValidFile">
        <ImgFromFile file={file} {...imgProps} />
        <div>
          <div>{this.renderRemoveButton(removeButtonText)}</div>
          {metadata}
          {currentStateElement}
        </div>
      </div>
    );
  }
}

export default connect()(FormValidFile);
