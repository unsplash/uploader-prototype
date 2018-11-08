import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createEpicMiddleware } from 'redux-observable';
import { AllUploaderActionMap, wrapUploaderActionsMiddleware } from '../state/uploader-action';
import { uploaderStateEpic } from '../state/UploaderState/epic';
import { uploaderStateReducer } from '../state/UploaderState/reducer';
import { UploaderState } from '../state/types';

export const configureAndCreateReduxStore = () => {
  const epicMiddleware = createEpicMiddleware<
    AllUploaderActionMap,
    AllUploaderActionMap,
    UploaderState
  >();
  const store = createStore(
    uploaderStateReducer,
    composeWithDevTools({ maxAge: 300 })(
      applyMiddleware(wrapUploaderActionsMiddleware, epicMiddleware),
    ),
  );
  epicMiddleware.run(uploaderStateEpic);
  return store;
};
