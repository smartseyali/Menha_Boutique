import React, { useState, useEffect } from 'react'
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.css';

const ZoomProductImage = ({ src, className, onError }: any) => {
  const [imageSrc, setImageSrc] = useState(src);
  const defaultImage = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.pattikadai.com'}/assets/img/product/default.jpg`;
  
  useEffect(() => {
    setImageSrc(src || defaultImage);
  }, [src, defaultImage]);

  // Use a wrapper img to detect errors since InnerImageZoom might not expose onError
  const [imgError, setImgError] = useState(false);
  const finalSrc = imgError || !imageSrc ? defaultImage : imageSrc;

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* Hidden img to test if image loads */}
      <img
        src={imageSrc || defaultImage}
        alt=""
        style={{ display: 'none' }}
        onError={() => {
          if (!imgError) {
            setImgError(true);
            if (onError) {
              onError(new Event('error'));
            }
          }
        }}
        onLoad={() => setImgError(false)}
      />
      <InnerImageZoom
        src={finalSrc}
        zoomSrc={finalSrc}
        zoomType="hover"
        zoomPreload={true}
      />
    </div>
  )
}

export default ZoomProductImage
