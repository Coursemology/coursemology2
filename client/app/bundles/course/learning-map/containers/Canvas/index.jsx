import React, { useRef, useState } from 'react';
import Levels from '../Levels';
import ArrowOverlay from '../ArrowOverlay';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Xwrapper } from 'react-xarrows';
import ZoomActionElements from '../../components/ZoomActionElements';

const styles = {
  cursorPosition: {
    position: 'absolute',
  },
  wrapper: {
    outline: 'none',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
  zoomAnimation: {
    animationTime: 300,
    animationType: 'easeOutCubic',
  }
};

const arrowAnchorPositions = ['left', 'right'];

const Canvas = () => {
  const gateInputSizeThreshold = 5;
  const cursorTrackerId = 'cursor-tracker';
  const transformRef = useRef(null);
  const [scale, setScale] = useState(1);
  const zoomScale = 1.25;
  const maxScale = 1.5;
  const minScale = 0.25;

  const getGateInputId = (isSummaryGate, parentNodeId, childNodeId) => {
    return isSummaryGate ? `${childNodeId}-summary-gate` : `${parentNodeId}-to-${childNodeId}-gate-input`;
  };

  const getGateId = (nodeId) => {
    return `${nodeId}-gate`;
  };

  const getGateConnectionPointId = (nodeId) => {
    return `${getGateId(nodeId)}-connection-point`;
  };

  const getNodeConnectionPointId = (nodeId) => {
    return `${nodeId}-connection-point`;
  };

  const onZoom = (setTransform, isZoomingIn) => {
    const state = transformRef.current.state;
    const newScale = isZoomingIn ? Math.min(state.scale * zoomScale, maxScale) : Math.max(state.scale / zoomScale, minScale);
    setTransform(state.positionX, state.positionY, newScale);
    setScale(newScale);
  }

  return (
    <TransformWrapper
      doubleClick={{disabled: true}}
      limitToBounds={false}
      pinch={{disabled: true}}
      minScale={0.2}
      maxScale={1.5}
      wheel={{disabled: true}}
      zoomIn={styles.zoomAnimation}
      zoomOut={styles.zoomAnimation}
      ref={transformRef}
    >
      {({ setTransform }) => (
        <>
          <Xwrapper>
            <ZoomActionElements
              zoomIn={() => { onZoom(setTransform, true) }}
              zoomOut={() => { onZoom(setTransform, false) }}
            />
            <div
              style={styles.wrapper}
              tabIndex={0}
            >
              <TransformComponent>
                <Levels
                  gateInputSizeThreshold={gateInputSizeThreshold}
                  getGateConnectionPointId={getGateConnectionPointId}
                  getGateId={getGateId}
                  getGateInputId={getGateInputId}
                  getNodeConnectionPointId={getNodeConnectionPointId}
                />
                <ArrowOverlay
                  cursorTrackerId={cursorTrackerId}
                  gateInputSizeThreshold={gateInputSizeThreshold}
                  getGateConnectionPointId={getGateConnectionPointId}
                  getGateInputId={getGateInputId}
                  getNodeConnectionPointId={getNodeConnectionPointId}
                  scale={scale}
                />
              </TransformComponent>
            </div>
          </Xwrapper>
        </>
      )}
    </TransformWrapper>
  );
}

export default Canvas;
