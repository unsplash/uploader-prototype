import React, { Fragment, SFC } from 'react';
import { FileWithId } from '../../../../../../state/types';
import FileThumbnail, {
  FileThumbnailImageComponent as FileThumbnailImageComponentType,
} from './components/FileThumbnail';

export type Props = {
  title: string;
  subTitle: string;
  fileWithIdList: Array<FileWithId>;
  FileThumbnailImageComponent: FileThumbnailImageComponentType;
};

const Group: SFC<Props> = ({ title, subTitle, fileWithIdList, FileThumbnailImageComponent }) => (
  <Fragment>
    <p>{title}</p>
    <p>{subTitle}</p>
    <ul>
      {fileWithIdList.map(fileWithId => (
        <li key={fileWithId.id}>
          <FileThumbnail file={fileWithId.file} ImageComponent={FileThumbnailImageComponent} />
        </li>
      ))}
    </ul>
  </Fragment>
);

export default Group;
