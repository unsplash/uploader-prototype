import React from 'react';
import {
  createPublishingFileStateLoading,
  createPublishingInProgressUploaderState,
  DemoWrapper,
} from '../../helpers/demos';
import PublishingInProgress from './';

export const publishingInProgressDemos = (
  <div>
    <h2>
      <code>PublishingInProgress</code>
    </h2>
    <DemoWrapper>
      <PublishingInProgress
        {...createPublishingInProgressUploaderState({
          fileStates: [createPublishingFileStateLoading()],
        })}
      />
    </DemoWrapper>
  </div>
);
