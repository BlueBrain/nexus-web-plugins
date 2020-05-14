import * as React from 'react';
import { Carousel } from 'react-responsive-carousel';

import LightboxComponent from './Lightbox';

import 'react-responsive-carousel/lib/styles/carousel.min.css';

export type ImageCollection = {
  imageSrc: string;
  name?: string;
}[];

const ImageCollectionViewerComponent: React.FC<{
  loading: boolean;
  error: Error | null;
  data: ImageCollection | null;
}> = ({ loading, data = [], error }) => {
  if (loading) {
    return (
      <div className="image-collection-viewer">
        <div className="wrapper -loading">
          <div className="skeleton" />
        </div>
      </div>
    );
  }
  if (data) {
    return (
      <div className="image-collection-viewer">
        <Carousel useKeyboardArrows showThumbs={false}>
          {data.map(({ imageSrc, name }) => {
            return (
              <LightboxComponent src={imageSrc}>
                {({ setIsOpen }) => {
                  return (
                    <div
                      className="wrapper -loaded"
                      style={{ backgroundImage: `url(${imageSrc})` }}
                      onClick={(e: React.MouseEvent) => {
                        setIsOpen(true);
                        e.stopPropagation();
                      }}
                    >
                      <img src={imageSrc} />
                      {/* <p>{name}</p> */}
                    </div>
                  );
                }}
              </LightboxComponent>
            );
          })}
        </Carousel>
      </div>
    );
  }
  return null;
};

export default ImageCollectionViewerComponent;
