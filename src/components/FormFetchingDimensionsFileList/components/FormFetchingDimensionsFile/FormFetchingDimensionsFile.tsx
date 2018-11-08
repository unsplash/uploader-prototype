import React, { SFC } from 'react';
import { FormFetchingDimensionsFileState } from '../../../../state/types';

type Props = { fileState: FormFetchingDimensionsFileState };

const FormFetchingDimensionsFile: SFC<Props> = ({ fileState }) => {
  const { currentState } = fileState;
  return (
    <div>
      {fileState.file.name}: {currentState.fetchDimensionsRequest.type}
    </div>
  );
};

export default FormFetchingDimensionsFile;
