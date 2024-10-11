"use client";

import { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import styles from '../styles/Home.module.css';

const ImageEditor = () => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const imageObj = useRef(new Image());
  const transformerRef = useRef<Konva.Transformer | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gears, setGears] = useState<Konva.Image[]>([]);

  useEffect(() => {
    const stage = new Konva.Stage({
      container: 'container',
      width: 600,
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
        const width = 600;
        const height = imageObj.current.height * width / imageObj.current.width;

        const konvaImage = new Konva.Image({
          image: imageObj.current,
          x: 0,
          y: 0,
          width,
          height,
        });
        layerRef.current?.add(konvaImage);
        stageRef.current?.width(width);
        stageRef.current?.height(height);
        layerRef.current?.draw();
        // Ensure the transformer is on top
        transformerRef.current?.moveToTop();
      };
    };
    reader.readAsDataURL(file);
  };

  const addGear = (src: string) => {
    const gearImage = new Image();
    gearImage.src = src;
    gearImage.onload = () => {
      const aspectRatio = gearImage.width / gearImage.height;
      const konvaGear = new Konva.Image({
        image: gearImage,
        x: 50,
        y: 50,
        width: 100 * aspectRatio, // Calculate width based on aspect ratio
        height: 100,
        draggable: true,
      });
  
      const removeButton = new Konva.Text({
        text: 'X',
        fontSize: 20,
        fill: 'red',
        visible: false,
        draggable: false,
      });
  
      removeButton.on('click', () => {
        removeGear(konvaGear, removeButton);
      });
  
      konvaGear.on('transform', () => {
        updateRemoveButtonPosition(konvaGear, removeButton);
      });
  
      konvaGear.on('dragmove', () => {
        updateRemoveButtonPosition(konvaGear, removeButton);
      });
  
      konvaGear.on('click', () => {
        // Hide all other close buttons
        setGears((prevGears) => {
          prevGears.forEach((gear) => {
            const otherRemoveButton = gear.getAttr('removeButton');
            if (otherRemoveButton && otherRemoveButton !== removeButton) {
              otherRemoveButton.visible(false);
            }
          });
          return prevGears;
        });
  
        transformerRef.current?.nodes([konvaGear]);
        transformerRef.current?.getLayer()?.batchDraw();
        // Show the remove button
        removeButton.visible(true);
        updateRemoveButtonPosition(konvaGear, removeButton);
        removeButton.moveToTop();
        layerRef.current?.batchDraw();
      });
  
      konvaGear.setAttr('removeButton', removeButton);
  
      layerRef.current?.add(removeButton);
      layerRef.current?.add(konvaGear);
      layerRef.current?.draw();
      setGears((prevGears) => [...prevGears, konvaGear]);
      // Ensure the transformer is on top
      transformerRef.current?.moveToTop();
    };
  };
  
  const updateRemoveButtonPosition = (gear: Konva.Image, removeButton: Konva.Text) => {
    removeButton.position({
      x: gear.x() + gear.width() * gear.scaleX(),
      y: gear.y() - 20,
    });
  };
  
  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      stage.on('click', (e) => {
        if (e.target === stage) {
          transformerRef.current?.nodes([]);
          gears.forEach((gear) => {
            const removeButton = gear.getAttr('removeButton');
            if (removeButton) {
              removeButton.visible(false);
            }
          });
          layerRef.current?.batchDraw();
        }
      });
    }
  }, [gears]);

  const removeGear = (gear: Konva.Image, removeButton: Konva.Text) => {
    gear.remove();
    removeButton.remove();
    transformerRef.current?.detach();
    layerRef.current?.draw();
    setGears((prevGears) => prevGears.filter((g) => g !== gear));
  };

  const exportImage = () => {
    if (stageRef.current && transformerRef.current) {
      // Hide the transformer and close buttons
      transformerRef.current.nodes([]);
      gears.forEach((gear) => {
        const removeButton = gear.getAttr('removeButton');
        if (removeButton) {
          removeButton.visible(false);
        }
      });
      transformerRef.current.getLayer()?.batchDraw();
  
      // Export the image
      const dataURL = stageRef.current.toDataURL();
  
      // Show the transformer and close buttons again
      gears.forEach((gear) => {
        const removeButton = gear.getAttr('removeButton');
        if (removeButton) {
          removeButton.visible(false);
        }
      });
      transformerRef.current.getLayer()?.batchDraw();
  
      // Create a link and trigger the download
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
      <button className={styles.exportButton} onClick={() => addGear('/crown.png')}>Add Crown</button>
      <button className={styles.exportButton} onClick={() => addGear('/red-saber.png')}>Add Red Saber</button>
      <button className={styles.exportButton} onClick={() => addGear('/green-saber.png')}>Add Green Saber</button>
      <button className={styles.exportButton} onClick={exportImage}>Export Image</button>
    </div>
  );
};

export default ImageEditor;
