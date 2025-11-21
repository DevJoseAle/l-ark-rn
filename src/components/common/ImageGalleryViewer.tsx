// src/components/common/ImageGalleryViewer.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import ImageView from 'react-native-image-viewing';

interface ImageSource {
  uri: string;
}

interface ImageGalleryViewerProps {
  images: ImageSource[];
  initialIndex?: number;
  style?: any;
  imageStyle?: any;
  children?: React.ReactNode;
}

export const ImageGalleryViewer: React.FC<ImageGalleryViewerProps> = ({
  images,
  initialIndex = 0,
  style,
  imageStyle,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePress = (index: number) => {
    setCurrentIndex(index);
    setVisible(true);
  };

  if (children) {
    // Si se pasan children, renderizar custom
    return (
      <>
        <TouchableOpacity onPress={() => handlePress(0)} style={style}>
          {children}
        </TouchableOpacity>

        <ImageView
          images={images}
          imageIndex={currentIndex}
          visible={visible}
          onRequestClose={() => setVisible(false)}
          swipeToCloseEnabled={true}
          doubleTapToZoomEnabled={true}
        />
      </>
    );
  }

  // Renderizar imagen por defecto
  return (
    <>
      <TouchableOpacity onPress={() => handlePress(0)} style={style}>
        <Image source={{ uri: images[0]?.uri }} style={imageStyle} />
      </TouchableOpacity>

      <ImageView
        images={images}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    </>
  );
};

// Para grids de múltiples imágenes
interface ImageGridViewerProps {
  images: ImageSource[];
  renderItem: (image: ImageSource, index: number) => React.ReactNode;
}

export const ImageGridViewer: React.FC<ImageGridViewerProps> = ({ images, renderItem }) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePress = (index: number) => {
    setCurrentIndex(index);
    setVisible(true);
  };

  return (
    <>
      {images.map((image, index) => (
        <TouchableOpacity key={index} onPress={() => handlePress(index)}>
          {renderItem(image, index)}
        </TouchableOpacity>
      ))}

      <ImageView
        images={images}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    </>
  );
};
