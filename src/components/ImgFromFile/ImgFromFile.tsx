import React, { SFC } from 'react';
import { imgFromFile } from '../../HOCs/imgFromFile';

const Img: SFC<JSX.IntrinsicElements['img']> = props => <img {...props} />;
const ImgFromFile = imgFromFile(Img);

export default ImgFromFile;
