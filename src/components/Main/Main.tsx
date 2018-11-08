import React, { SFC } from 'react';
import { Provider } from 'react-redux';
import { configureAndCreateReduxStore } from '../../helpers/redux';
import Demos from '../Demos';
import Uploader from '../Uploader';

const store = configureAndCreateReduxStore();

const urlSearchParams = new window.URLSearchParams(window.location.search);
const SHOULD_RENDER_DEMOS_QUERY_PARAM = 'should_render_demos';
const shouldRenderDemos = urlSearchParams.has(SHOULD_RENDER_DEMOS_QUERY_PARAM);

const Main: SFC<{}> = () => (
  <Provider store={store}>{shouldRenderDemos ? <Demos /> : <Uploader />}</Provider>
);

export default Main;
