import React, { CSSProperties, Fragment, SFC } from 'react';
import ImgFromFile from '../../../../../../../ImgFromFile';

export type FileThumbnailImageComponent = SFC<{
  file: File;
}>;

export const UnavailableFileThumbnailImage: FileThumbnailImageComponent = () => (
  <div>Unable to display image</div>
);
const availableThumbnailImageStyle: CSSProperties = {
  height: 60,
};
export const AvailableFileThumbnailImage: FileThumbnailImageComponent = ({ file }) => (
  <ImgFromFile file={file} style={availableThumbnailImageStyle} />
);

type Props = {
  file: File;
  ImageComponent: FileThumbnailImageComponent;
};
const FileThumbnail: SFC<Props> = ({ file, ImageComponent }) => (
  <Fragment>
    <ImageComponent file={file} />
    <div>Filename: {file.name}</div>
  </Fragment>
);

export default FileThumbnail;
