import React from 'react';
import window from 'global';

interface IFrameProps {
  id: string;
  key?: string;
  title: string;
  src: string;
  allowFullScreen: boolean;
  scale: number;
  style?: any;
}

interface BodyStyle {
  width: string;
  height: string;
  transform: string;
  transformOrigin: string;
}

export class IFrame extends React.Component<IFrameProps> {
  iframe: any = null;

  componentDidMount() {
    const { id } = this.props;
    this.iframe = window.document.getElementById(id);
  }

  shouldComponentUpdate(nextProps: IFrameProps) {
    const { scale, src } = this.props;
    return scale !== nextProps.scale || src !== nextProps.src;
  }

  componentDidUpdate(prevProps: IFrameProps) {
    const { scale } = this.props;
    if (scale !== prevProps.scale) {
      this.setIframeBodyStyle({
        width: `${scale * 100}%`,
        height: `${scale * 100}%`,
        transform: `scale(${1 / scale})`,
        transformOrigin: 'top left',
      });
    }
  }

  setIframeBodyStyle(style: BodyStyle) {
    return Object.assign(this.iframe.contentDocument.body.style, style);
  }

  render() {
    const { id, title, src, allowFullScreen, scale, ...rest } = this.props;
    return (
      <iframe
        scrolling="yes"
        id={id}
        title={title}
        src={src}
        allowFullScreen={allowFullScreen}
        {...rest}
      />
    );
  }
}

// IFrame.propTypes = {
//   id: PropTypes.string.isRequired,
//   title: PropTypes.string.isRequired,
//   src: PropTypes.string.isRequired,
//   allowFullScreen: PropTypes.bool.isRequired,
//   scale: PropTypes.number.isRequired,
// };
