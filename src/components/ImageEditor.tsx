"use client";

import { useRef, useEffect } from 'react';
import Konva from 'konva';
import styles from '../styles/Home.module.css';

const ImageEditor = () => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const imageObj = useRef(new Image());
  const crownObj = useRef(new Image());
  const transformerRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    const stage = new Konva.Stage({
      container: 'container',
      width: window.innerWidth,
      height: window.innerHeight,
    });
    stageRef.current = stage;

    const layer = new Konva.Layer();
    stage.add(layer);
    layerRef.current = layer;

    const transformer = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      boundBoxFunc: (oldBox, newBox) => {
        // limit resize
        if (newBox.width < 20 || newBox.height < 20) {
          return oldBox;
        }
        return newBox;
      },
    });
    layer.add(transformer);
    transformerRef.current = transformer;

    crownObj.current.src = '/crown.png'; // Ensure crown.png is in the public directory
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      if (e.target && typeof e.target.result === 'string') {
        imageObj.current.src = e.target.result;
      }
      imageObj.current.onload = function () {
        const konvaImage = new Konva.Image({
          image: imageObj.current,
          x: 0,
          y: 0,
          width: imageObj.current.width,
          height: imageObj.current.height,
        });
        layerRef.current?.add(konvaImage);
        stageRef.current?.width(imageObj.current.width);
        stageRef.current?.height(imageObj.current.height);

        const konvaCrown = new Konva.Image({
          image: crownObj.current,
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          draggable: true,
        });

        konvaCrown.on('click', () => {
          transformerRef.current?.nodes([konvaCrown]);
          transformerRef.current?.getLayer()?.batchDraw();
        });

        layerRef.current?.add(konvaCrown);
        layerRef.current?.draw();
        // Ensure the crown and transformer are on top
        konvaCrown.moveToTop();
        transformerRef.current?.moveToTop();
      };
    };
    reader.readAsDataURL(file);
  };

  const exportImage = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = dataURL;
      link.click();
    }
  };

  return (
    <div className={styles.container}>
      <h1>Image Editor</h1>
      <form id="upload-form">
        <input type="file" id="image-upload" accept="image/*" onChange={handleImageUpload} className={styles.hiddenFileInput} />
        <label htmlFor="image-upload" className={styles.uploadLabel}>Upload Image</label>
      </form>
      <div id="container" className={styles.canvasContainer}></div>
      <button id="export-button" className={styles.exportButton} onClick={exportImage}>Export Image</button>
    </div>
  );
};

export default ImageEditor;