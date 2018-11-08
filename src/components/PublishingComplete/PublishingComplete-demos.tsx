import React from 'react';
import {
  createPublishingCompleteUploaderState,
  createPublishingFileStateFailure,
  createPublishingFileStatePublished,
  DemoWrapper,
} from '../../helpers/demos';
import { PublishingCompleteUploaderState } from '../../state/types';
import PublishingComplete from './';

export const publishingCompleteDemos = (
  <div>
    <h2>
      <code>PublishingComplete</code>
    </h2>
    <h3>All succeeded</h3>
    <DemoWrapper>
      <PublishingComplete
        {...createPublishingCompleteUploaderState(
          PublishingCompleteUploaderState.AllSucceeded({
            successFileStates: [createPublishingFileStatePublished()],
          }),
        )}
      />
    </DemoWrapper>
    <h3>Some failed</h3>
    <DemoWrapper>
      <PublishingComplete
        {...createPublishingCompleteUploaderState(
          PublishingCompleteUploaderState.SomeFailed({
            successFileStates: [createPublishingFileStatePublished()],
            failureFileStates: [createPublishingFileStateFailure()],
          }),
        )}
      />
    </DemoWrapper>
    <h3>All failed</h3>
    <DemoWrapper>
      <PublishingComplete
        {...createPublishingCompleteUploaderState(
          PublishingCompleteUploaderState.AllFailed({
            failureFileStates: [createPublishingFileStateFailure()],
          }),
        )}
      />
    </DemoWrapper>
  </div>
);
