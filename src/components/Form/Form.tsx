import { Option } from 'funfix-core';
import React from 'react';
import { connect } from 'react-redux';
import mapProps from 'recompose/mapProps';
import { Dispatch } from 'redux';
import { FILES_UPPER_LIMIT } from '../../constants';
import { FileStateWith, FormUploaderState } from '../../state/types';
import { UploaderAction } from '../../state/uploader-action';
import { checkShouldShowFilesLimitWarning } from '../../state/UploaderState/transition-guards';
import FormFetchingDimensionsFileList from '../FormFetchingDimensionsFileList';
import FormInvalidFileList from '../FormInvalidFileList';
import FormValidFileList from '../FormValidFileList';
import {
  checkShouldDisableFileInput,
  checkShouldDisableFormSubmit,
  deriveGroupedFileStates,
  FILE_INPUT_ACCEPT,
} from './Form-helpers';

type OwnProps = {
  uploaderState: FormUploaderState;
};

type MappedProps = ReturnType<typeof propsMapper>;

type DispatchProps = {
  dispatch: Dispatch;
};
type StateProps = {};
type ConnectedProps = DispatchProps & StateProps;

type Props = ConnectedProps & MappedProps;

const displayName = 'Form';

type FileStatesListComponent<C extends any> = React.ComponentType<{
  fileStates: Array<FileStateWith<C>>;
}>;
const renderFileStatesList = <C extends any>({
  fileStates,
  Component,
}: {
  fileStates: Array<FileStateWith<C>>;
  Component: FileStatesListComponent<C>;
}) => (fileStates.length > 0 ? <Component fileStates={fileStates} /> : null);

class Form extends React.PureComponent<Props> {
  static displayName = displayName;

  resetFileInput(fileInputElement: HTMLInputElement) {
    // https://stackoverflow.com/a/24608023/5932012
    fileInputElement.value = '';
  }

  onFileInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const fileInputElement = event.target;
    const fileList = Option.of(fileInputElement.files).get();
    // Convert to array so we can use array methods. Also, we need to make a copy as the files
    // list is mutable.
    const files = Array.from(fileList);
    this.props.dispatch(UploaderAction.AddFiles({ files }));

    this.resetFileInput(fileInputElement);
  };

  onDropboxDragOver: React.DragEventHandler<HTMLDivElement> = event => {
    // We must prevent the default here in order to allow subsequent drop events:
    // https://stackoverflow.com/questions/8414154/html5-drop-event-doesnt-work-unless-dragover-is-handled
    event.preventDefault();

    event.dataTransfer.dropEffect = 'copy';
  };
  onDropboxDrop: React.DragEventHandler<HTMLDivElement> = event => {
    event.preventDefault();
    const { dataTransfer } = event;
    const { files: fileList } = dataTransfer;
    // Convert to array so we can use array methods.
    const files = Array.from(fileList);
    this.props.dispatch(UploaderAction.AddFiles({ files }));
  };

  onResetButtonClick: React.MouseEventHandler<HTMLButtonElement> = _event => {
    this.props.dispatch(UploaderAction.Reset({}));
  };

  onFormSubmit: React.FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    this.props.dispatch(UploaderAction.PublishFiles({}));
  };

  onLimitWarningHideButtonClick: React.MouseEventHandler<HTMLButtonElement> = _event => {
    this.props.dispatch(UploaderAction.HideFilesLimitWarning({}));
  };

  render() {
    const {
      groupedFileStates,
      shouldDisableFileInput,
      shouldDisableFormSubmit,
      shouldShowFilesLimitWarning,
    } = this.props;

    const conditionalDropboxProps: JSX.IntrinsicElements['div'] = shouldDisableFileInput
      ? {
          style: {
            opacity: 0.5,
          },
        }
      : {
          onDragOver: this.onDropboxDragOver,
          onDrop: this.onDropboxDrop,
        };

    const maybeLimitWarning = shouldShowFilesLimitWarning && (
      <div className="form__limitWarning">
        <p>Warning: {FILES_UPPER_LIMIT} files only</p>
        <button
          onClick={this.onLimitWarningHideButtonClick}
          // We must declare this type to avoid this button triggering submit
          type="button"
        >
          Hide
        </button>
      </div>
    );

    return (
      <form onSubmit={this.onFormSubmit}>
        <h2>Add files</h2>
        {maybeLimitWarning}
        <div className="dropboxAndInput">
          <div className="dropbox" {...conditionalDropboxProps}>
            Drop files here
          </div>

          <input
            type="file"
            multiple
            accept={FILE_INPUT_ACCEPT}
            onChange={this.onFileInputChange}
            disabled={shouldDisableFileInput}
          />
        </div>

        {renderFileStatesList({
          fileStates: groupedFileStates.fetchingDimensions,
          Component: FormFetchingDimensionsFileList,
        })}
        {renderFileStatesList({
          fileStates: groupedFileStates.invalid,
          Component: FormInvalidFileList,
        })}
        {renderFileStatesList({
          fileStates: groupedFileStates.valid,
          Component: FormValidFileList,
        })}

        <div>
          <button type="reset" onClick={this.onResetButtonClick}>
            Reset
          </button>
          <button type="submit" disabled={shouldDisableFormSubmit}>
            Publish
          </button>
        </div>
      </form>
    );
  }
}

const propsMapper = (props: OwnProps) => ({
  groupedFileStates: deriveGroupedFileStates(props.uploaderState),
  shouldDisableFormSubmit: checkShouldDisableFormSubmit(props.uploaderState),
  shouldDisableFileInput: checkShouldDisableFileInput(props.uploaderState),
  shouldShowFilesLimitWarning: checkShouldShowFilesLimitWarning(props.uploaderState),
});

export default mapProps(propsMapper)(connect()(Form));
