import * as React from 'react';
import LightboxComponent from './Lightbox';

const ImageViewerComponent: React.FC<{
  loading: boolean;
  error: Error | null;
  data: string | null;
}> = ({ loading, data, error }) => {
  if (loading) {
    return (
      <div className="image-viewer">
        <div className="wrapper -loading">
          <div className="skeleton" />
        </div>
      </div>
    );
  }
  if (data) {
    return (
      <div className="image-viewer">
        <LightboxComponent src={data}>
          {({ setIsOpen }) => {
            return (
              <div
                className="wrapper -loaded"
                style={{ backgroundImage: `url(${data})` }}
                onClick={(e: React.MouseEvent) => {
                  setIsOpen(true);
                  e.stopPropagation();
                }}
              >
                <img src={data} />
              </div>
            );
          }}
        </LightboxComponent>
      </div>
    );
  }
  return null;
};

export default ImageViewerComponent;
