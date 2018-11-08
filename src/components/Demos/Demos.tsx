import React, { SFC } from 'react';
import { formDemos } from '../Form/Form-demos';
import { publishingCompleteDemos } from '../PublishingComplete/PublishingComplete-demos';
import { publishingInProgressDemos } from '../PublishingInProgress/PublishingInProgress-demos';

const Demos: SFC<{}> = () => (
  <div>
    <h1>Demos</h1>
    {formDemos}
    {publishingInProgressDemos}
    {publishingCompleteDemos}
  </div>
);

export default Demos;
