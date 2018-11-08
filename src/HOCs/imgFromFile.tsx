import React, { ComponentType } from 'react';
import getDisplayName from 'recompose/getDisplayName';

type Props = {
  file: File;
};

type RequiredImgProps = Pick<JSX.IntrinsicElements['img'], 'src' | 'onLoad'>;

export const imgFromFile = function<ComposedComponentProps extends RequiredImgProps>(
  ComposedComponent: ComponentType<ComposedComponentProps>,
) {
  const displayName = `ImgFromFile(${getDisplayName(ComposedComponent)})`;

  class ImgFromFile extends React.PureComponent<Props & ComposedComponentProps> {
    static displayName = displayName;

    imgSrc = window.URL.createObjectURL(this.props.file);

    revokeImgSrc() {
      window.URL.revokeObjectURL(this.imgSrc);
    }

    onLoad: React.ReactEventHandler<HTMLImageElement> = _event => {
      // We must revoke the object URL once we're finished using it to avoid leaking memory.
      this.revokeImgSrc();
    };

    render() {
      const {
        file: _file,
        // @ts-ignore
        // https://github.com/Microsoft/TypeScript/issues/14409
        ...composedComponentProps
      } = this.props;
      return (
        <ComposedComponent {...composedComponentProps} src={this.imgSrc} onLoad={this.onLoad} />
      );
    }
  }

  return ImgFromFile;
};
