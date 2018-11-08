import pipe from 'lodash/flow';
import React, { SFC } from 'react';
import {
  ACCEPTED_FILE_EXTENSIONS,
  MAXIMUM_FILE_SIZE_MEGABYTES,
  MINIMUM_MEGAPIXELS,
} from '../../../../constants';
import { createSFC } from '../../../../helpers/react-typescript';
import { withDefaults } from '../../../../helpers/with-defaults';
import {
  AllGroupsList as AllGroupsListType,
  formatFileExtensions,
  formatMegabytes,
  formatMegapixels,
  groupInvalidFiles,
  pluralizeFiles,
} from './AllGroupsList-helpers';
import Group, { Props as GroupProps } from './components/Group';
import {
  AvailableFileThumbnailImage,
  UnavailableFileThumbnailImage,
} from './components/Group/components/FileThumbnail';

const GroupListItem: SFC<GroupProps> = props =>
  props.fileWithIdList.length > 0 ? (
    <li>
      <Group {...props} />
    </li>
  ) : null;

const GroupListItemWithAvailableThumbnailImage = withDefaults({
  FileThumbnailImageComponent: AvailableFileThumbnailImage,
})(GroupListItem);
const GroupListItemWithUnavailableThumbnailImage = withDefaults({
  FileThumbnailImageComponent: UnavailableFileThumbnailImage,
})(GroupListItem);

type Props = {
  allGroupsList: AllGroupsListType;
};

const subTitles = {
  FetchDimensionsFailure: 'Make sure the file is not damaged',
  ExceedsMaximumFileSize: `Please upload images under ${formatMegabytes(
    MAXIMUM_FILE_SIZE_MEGABYTES,
  )}`,
  InsufficientMegapixels: `Please upload images over ${formatMegapixels(MINIMUM_MEGAPIXELS)}`,
  InvalidFileType: `Upload only image files (${formatFileExtensions(ACCEPTED_FILE_EXTENSIONS)})`,
};
const AllGroupsListComposed: SFC<Props> = ({ allGroupsList }) => {
  const { FetchDimensionsFailure, ValidationErrors } = allGroupsList;
  const { ExceedsMaximumFileSize, InsufficientMegapixels, InvalidFileType } = ValidationErrors;

  return (
    <ul>
      <GroupListItemWithUnavailableThumbnailImage
        title={`${FetchDimensionsFailure.length} ${pluralizeFiles(
          FetchDimensionsFailure,
        )} was unable to load`}
        subTitle={subTitles.FetchDimensionsFailure}
        fileWithIdList={FetchDimensionsFailure}
      />
      <GroupListItemWithAvailableThumbnailImage
        title={`${ExceedsMaximumFileSize.length} ${pluralizeFiles(
          ExceedsMaximumFileSize,
        )} exceeded the maximum file size`}
        subTitle={subTitles.ExceedsMaximumFileSize}
        fileWithIdList={ExceedsMaximumFileSize}
      />
      <GroupListItemWithAvailableThumbnailImage
        title={`${InsufficientMegapixels.length} ${pluralizeFiles(
          InsufficientMegapixels,
        )} did not meet the minimum size`}
        subTitle={subTitles.InsufficientMegapixels}
        fileWithIdList={InsufficientMegapixels}
      />
      <GroupListItemWithUnavailableThumbnailImage
        title={`${InvalidFileType.length} ${pluralizeFiles(InvalidFileType)} had a wrong file type`}
        subTitle={subTitles.InvalidFileType}
        fileWithIdList={InvalidFileType}
      />
    </ul>
  );
};

const AllGroupsList = createSFC(
  pipe(
    groupInvalidFiles,
    allGroupsList => <AllGroupsListComposed allGroupsList={allGroupsList} />,
  ),
);

export default AllGroupsList;
