import { Action, Middleware } from 'redux';
import { ofType } from 'unionize';
import { unionizeReduxAction } from '../helpers/unionize';
import {
  FetchDimensionsRequest,
  FetchPresignedUrlRequest,
  PublishRequest,
  UploadToS3Request,
} from '../types/requests';

type FileActionBase = { id: string };

export const UploaderAction = unionizeReduxAction({
  AddFiles: ofType<{ files: File[] }>(),
  RemoveFile: ofType<{ id: string }>(),
  Reset: ofType<{}>(),
  PublishFiles: ofType<{}>(),
  ClearInvalidFiles: ofType<{}>(),
  RetryFailedRequestsForValidFiles: ofType<{}>(),
  HideFilesLimitWarning: ofType<{}>(),
  RollbackPublishingRequestFailuresToForm: ofType<{}>(),
  PublishingCompleted: ofType<{}>(),
});
export type UploaderAction = typeof UploaderAction._Union;
export type UploaderActionRecord = typeof UploaderAction._Record;

export const FormFileAction = unionizeReduxAction({
  UpdateFileFetchDimensionsRequest: ofType<
    FileActionBase & {
      fetchDimensionsRequest: FetchDimensionsRequest;
    }
  >(),
  UpdateFileFetchPresignedUrlRequest: ofType<
    FileActionBase & {
      fetchPresignedUrlRequest: FetchPresignedUrlRequest;
    }
  >(),
  UpdateFileUploadToS3Request: ofType<FileActionBase & { uploadToS3Request: UploadToS3Request }>(),
});
export type FormFileAction = typeof FormFileAction._Union;
export type FormFileActionRecord = typeof FormFileAction._Record;

export const PublishingInProgressFileAction = unionizeReduxAction({
  UpdateFilePublishRequest: ofType<FileActionBase & { publishRequest: PublishRequest }>(),
});
export type PublishingInProgressFileAction = typeof PublishingInProgressFileAction._Union;

export const AllUploaderAction = unionizeReduxAction({
  Uploader: ofType<UploaderAction>(),
  FormFile: ofType<FormFileAction>(),
  PublishingInProgressFile: ofType<PublishingInProgressFileAction>(),
});
export type AllUploaderAction = typeof AllUploaderAction._Union;
type AllUploaderActionRecord = typeof AllUploaderAction._Record;

export type AllUploaderActionMap = AllUploaderActionRecord[keyof AllUploaderActionRecord];

const UploaderActionKeys = Object.keys(UploaderAction._Record);
const FormFileActionKeys = Object.keys(FormFileAction._Record);
const PublishingInProgressFileActionKeys = Object.keys(PublishingInProgressFileAction._Record);

const checkIsUploaderAction = (action: Action): action is UploaderAction =>
  UploaderActionKeys.includes(action.type);
const checkIsFormFileAction = (action: Action): action is FormFileAction =>
  FormFileActionKeys.includes(action.type);
const checkIsPublishingInProgressFileAction = (
  action: Action,
): action is PublishingInProgressFileAction =>
  PublishingInProgressFileActionKeys.includes(action.type);

/**
 * This middleware will wrap the inner actions with `AllUploaderAction`, avoiding the need for us
 * to wrap actions every time we create them in Components/Epics.
 */
export const wrapUploaderActionsMiddleware: Middleware = _store => next => <A extends Action>(
  action: A,
) => {
  if (checkIsFormFileAction(action)) {
    const wrappedAction = AllUploaderAction.FormFile(action);
    return next((wrappedAction as any) as A);
  } else if (checkIsPublishingInProgressFileAction(action)) {
    const wrappedAction = AllUploaderAction.PublishingInProgressFile(action);
    return next((wrappedAction as any) as A);
  } else if (checkIsUploaderAction(action)) {
    const wrappedAction = AllUploaderAction.Uploader(action);
    return next((wrappedAction as any) as A);
  } else {
    return next(action);
  }
};
