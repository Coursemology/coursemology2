/* eslint no-mixed-operators: "off" */
/* eslint react/sort-comp: "off" */
/* eslint no-undef: "off" */ // For usage of fabric
import React from 'react';
import PropTypes from 'prop-types';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import { scribingTools, scribingShapes, scribingToolColor,
         scribingToolThickness, scribingToolLineStyle } from '../../constants';

import { scribingShape } from '../../propTypes';

const propTypes = {
  answerId: PropTypes.number.isRequired,
  scribing: scribingShape,
  addLayer: PropTypes.func.isRequired,
  setCanvasLoaded: PropTypes.func.isRequired,
  setCanvasProperties: PropTypes.func.isRequired,
  setToolSelected: PropTypes.func.isRequired,
  updateScribingAnswer: PropTypes.func.isRequired,
  updateScribingAnswerInLocal: PropTypes.func.isRequired,
  resetCanvasDelete: PropTypes.func.isRequired,
  resetDisableObjectSelection: PropTypes.func.isRequired,
  resetEnableObjectSelection: PropTypes.func.isRequired,
  resetEnableTextSelection: PropTypes.func.isRequired,
};

const styles = {
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
  canvas_div: {
    alignItems: 'center',
    margin: 'auto',
  },
  canvas: {
    width: '100%',
    border: '1px solid black',
  },
  toolbar: {
    marginBottom: '1em',
  },
  custom_line: {
    display: 'inline-block',
    position: 'inherit',
    width: '25px',
    height: '21px',
    marginLeft: '-2px',
    transform: 'scale(1.0, 0.2) rotate(90deg) skewX(76deg)',
  },
  tool: {
    position: 'relative',
    display: 'inline-block',
    paddingRight: '24px',
  },
};

export default class ScribingCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.line = undefined;
    this.rect = undefined;
    this.ellipse = undefined;
    this.viewportLeft = 0;
    this.viewportTop = 0;
    this.textCreated = false;
  }

  componentDidMount() {
    this.initializeCanvas(
        this.props.answerId,
        this.props.scribing.answer.image_url);
  }

  shouldComponentUpdate(nextProps) {
    if (this.canvas) {
      this.canvas.isDrawingMode = nextProps.scribing.isDrawingMode;
      this.canvas.freeDrawingBrush.color = this.props.scribing.colors[scribingToolColor.DRAW];
      this.canvas.defaultCursor = nextProps.scribing.cursor;
      this.currentCursor = nextProps.scribing.cursor;

      this.canvas.zoomToPoint({
        x: this.canvas.height / 2,
        y: this.canvas.width / 2,
      }, nextProps.scribing.canvasZoom);
      this.canvas.trigger('mouse:move', { isForced: true });

      if (nextProps.scribing.isDisableObjectSelection) {
        this.disableObjectSelection();
        this.props.resetDisableObjectSelection(this.props.answerId);
      }
      if (nextProps.scribing.isEnableObjectSelection) {
        this.enableObjectSelection();
        this.props.resetEnableObjectSelection(this.props.answerId);
      }
      if (nextProps.scribing.isEnableTextSelection) {
        this.enableTextSelection();
        this.props.resetEnableTextSelection(this.props.answerId);
      }
      if (nextProps.scribing.isDelete) {
        const activeGroup = this.canvas.getActiveGroup();
        const activeObject = this.canvas.getActiveObject();

        if (activeObject) {
          this.canvas.remove(activeObject);
        } else if (activeGroup) {
          const objectsInGroup = activeGroup.getObjects();
          this.canvas.discardActiveGroup();
          objectsInGroup.forEach(object => (this.canvas.remove(object)));
        }
        this.canvas.renderAll();
        this.props.resetCanvasDelete(this.props.answerId);
      }
    }

    // Render canvas only at the beginning
    return !this.props.scribing.isCanvasLoaded;
  }

  disableObjectSelection() {
    this.canvas.forEachObject((object) => {
      object.selectable = false; // eslint-disable-line no-param-reassign
      object.hoverCursor = this.currentCursor; // eslint-disable-line no-param-reassign
    });
  }

  // This method only enable selection for interactive texts
  enableTextSelection() {
    this.canvas.clear();
    this.initializeScribblesAndBackground(false);
    this.canvas.forEachObject((object) => {
      // eslint-disable-next-line no-param-reassign
      object.selectable = (object.type === 'i-text');
      // eslint-disable-next-line no-param-reassign
      object.hoverCursor = (object.type === 'i-text') ? 'pointer' : this.currentCursor;
    });
  }

  // This method clears the selection-disabled scribbles
  // and reloads them to enable selection again
  enableObjectSelection() {
    this.canvas.clear();
    this.initializeScribblesAndBackground(false);
  }

  // Canvas Event Handlers

  onMouseDownCanvas = (options) => {
    this.mouseCanvasDragStartPoint = this.getCanvasPoint(options.e);

    // To facilitate panning
    this.mouseDownFlag = true;
    this.viewportLeft = this.canvas.viewportTransform[4];
    this.viewportTop = this.canvas.viewportTransform[5];
    this.mouseStartPoint = this.getMousePoint(options.e);

    this.isOverActiveObject = (options.target !== null
      && options.target === this.canvas.getActiveObject());

    const getStrokeDashArray = (toolType) => {
      switch (this.props.scribing.lineStyles[toolType]) {
        case 'dotted': {
          return [1, 3];
        }
        case 'dashed': {
          return [10, 5];
        }
        case 'solid':
        default: {
          return [];
        }
      }
    };

    if (this.mouseCanvasDragStartPoint) {
      if (this.props.scribing.selectedTool === scribingTools.SELECT) {
        this.canvas.selectionBorderColor = 'gray';
        this.canvas.selectionDashArray = [1, 3];
      } else {
        this.canvas.selectionBorderColor = 'transparent';
        this.canvas.selectionDashArray = [];
      }

      if (this.props.scribing.selectedTool === scribingTools.LINE
          && !this.isOverActiveObject) {
        // Make previous line unselectable if it exists
        if (this.line && this.line.type === 'line') {
          this.line.selectable = false;
        }

        const strokeDashArray = getStrokeDashArray(scribingToolLineStyle.LINE);
        this.line = new fabric.Line(
          [
            this.mouseCanvasDragStartPoint.x, this.mouseCanvasDragStartPoint.y,
            this.mouseCanvasDragStartPoint.x, this.mouseCanvasDragStartPoint.y,
          ],
          {
            stroke: `${this.props.scribing.colors[scribingToolColor.LINE]}`,
            strokeWidth: this.props.scribing.thickness[scribingToolThickness.LINE],
            strokeDashArray,
            selectable: true,
          }
        );
        this.canvas.add(this.line);
        this.canvas.setActiveObject(this.line);
        this.canvas.renderAll();
      } else if (this.props.scribing.selectedTool === scribingTools.SHAPE
                  && !this.isOverActiveObject) {
        const strokeDashArray = getStrokeDashArray(scribingToolLineStyle.SHAPE_BORDER);
        switch (this.props.scribing.selectedShape) {
          case scribingShapes.RECT: {
            // Make previous rect unselectable if it exists
            if (this.rect && this.rect.type === 'rect') {
              this.rect.selectable = false;
            }

            this.rect = new fabric.Rect({
              left: this.mouseCanvasDragStartPoint.x,
              top: this.mouseCanvasDragStartPoint.y,
              stroke: `${this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]}`,
              strokeWidth: this.props.scribing.thickness[scribingToolThickness.SHAPE_BORDER],
              strokeDashArray,
              fill: `${this.props.scribing.colors[scribingToolColor.SHAPE_FILL]}`,
              width: 1,
              height: 1,
              selectable: true,
            });
            this.canvas.add(this.rect);
            this.canvas.setActiveObject(this.rect);
            this.canvas.renderAll();
            break;
          }
          case scribingShapes.ELLIPSE: {
            // Make previous line unselectable if it exists
            if (this.ellipse && this.ellipse.type === 'ellipse') {
              this.ellipse.selectable = false;
            }

            this.ellipse = new fabric.Ellipse({
              left: this.mouseCanvasDragStartPoint.x,
              top: this.mouseCanvasDragStartPoint.y,
              stroke: `${this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]}`,
              strokeWidth: this.props.scribing.thickness[scribingToolThickness.SHAPE_BORDER],
              strokeDashArray,
              fill: `${this.props.scribing.colors[scribingToolColor.SHAPE_FILL]}`,
              rx: 1,
              ry: 1,
              selectable: true,
            });
            this.canvas.add(this.ellipse);
            this.canvas.setActiveObject(this.ellipse);
            this.canvas.renderAll();
            break;
          }
          default: {
            break;
          }
        }
      }
    }

    if (this.props.scribing.selectedTool !== scribingTools.TYPE
        && this.textCreated) {
      this.textCreated = false;

    // Only allow one i-text to be created per selection of TEXT mode
    // Second click in non-text area will exit to SELECT mode
    } else if (!this.isOverText
        && this.props.scribing.selectedTool === scribingTools.TYPE
        && !this.textCreated) {
      const text = new fabric.IText('Text', {
        fontFamily: this.props.scribing.fontFamily,
        fontSize: this.props.scribing.fontSize,
        fill: this.props.scribing.colors[scribingToolColor.TYPE],
        left: this.mouseCanvasDragStartPoint.x,
        top: this.mouseCanvasDragStartPoint.y,
      });
      this.canvas.add(text);
      this.canvas.setActiveObject(text);
      text.enterEditing();
      this.canvas.renderAll();
      this.textCreated = true;
    } else if (!this.isOverText && this.textCreated) {
      this.props.setToolSelected(this.props.answerId, scribingTools.SELECT);
      this.textCreated = false;
    }
  }

  onMouseMoveCanvas = (options) => {
    const dragPointer = this.getCanvasPoint(options.e);

    // Do panning action
    const tryPan = (left, top) => {
      // limit panning
      let finalLeft = Math.min(left, 0);
      finalLeft = Math.max(finalLeft, (this.canvas.getZoom() - 1) * this.canvas.getWidth() * -1);
      let finalTop = Math.min(top, 0);
      finalTop = Math.max(finalTop, (this.canvas.getZoom() - 1) * this.canvas.getHeight() * -1);

      // apply calculated pan transforms
      this.canvas.viewportTransform[4] = finalLeft;
      this.canvas.viewportTransform[5] = finalTop;
      this.canvas.renderAll();
    };

    if (this.mouseDownFlag) {
      if (dragPointer
          && this.props.scribing.selectedTool === scribingTools.LINE
          && !this.isOverActiveObject) {
        this.line.set({ x2: dragPointer.x, y2: dragPointer.y });
        this.canvas.renderAll();
      } else if (dragPointer
                  && this.props.scribing.selectedTool === scribingTools.SHAPE
                  && !this.isOverActiveObject) {
        switch (this.props.scribing.selectedShape) {
          case scribingShapes.RECT: {
            const dragProps = this.generateMouseDragProperties(
              this.mouseCanvasDragStartPoint,
              dragPointer
            );
            this.rect.set({
              left: dragProps.left,
              top: dragProps.top,
              width: dragProps.width,
              height: dragProps.height,
            });
            this.canvas.renderAll();
            break;
          }
          case scribingShapes.ELLIPSE: {
            const dragProps = this.generateMouseDragProperties(
              this.mouseCanvasDragStartPoint,
              dragPointer
            );
            this.ellipse.set({
              left: dragProps.left,
              top: dragProps.top,
              rx: dragProps.width / 2,
              ry: dragProps.height / 2,
            });
            this.canvas.renderAll();
            break;
          }
          default: {
            break;
          }
        }
      } else if (this.props.scribing.selectedTool === scribingTools.PAN) {
        const mouseCurrentPoint = this.getMousePoint(options.e);
        const deltaLeft = mouseCurrentPoint.x - this.mouseStartPoint.x;
        const deltaTop = mouseCurrentPoint.y - this.mouseStartPoint.y;
        const newLeft = this.viewportLeft + deltaLeft;
        const newTop = this.viewportTop + deltaTop;
        tryPan(newLeft, newTop);
      }
    } else if (options.isForced) {
      // Facilitates zooming out
      tryPan(this.canvas.viewportTransform[4], this.canvas.viewportTransform[5]);
    }
  }

  onMouseUpCanvas = () => {
    this.mouseDownFlag = false;
    if (this.props.scribing.selectedTool === scribingTools.LINE
      || this.props.scribing.selectedTool === scribingTools.SHAPE) {
      this.saveScribbles();
    }
  }

  onMouseOver = (options) => {
    if (options.target && options.target.type === 'i-text') {
      this.isOverText = true;
    }
  }

  onMouseOut = () => (this.isOverText = false)

  // Limit moving of objects to within the canvas
  onObjectMovingCanvas = (options) => {
    const obj = options.target;
     // if object is too big ignore
    if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
      return;
    }
    obj.setCoords();
    // top-left  corner
    if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
      obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
      obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
    }
    // bot-right corner
    if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height
      || obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width) {
      obj.top = Math.min(obj.top,
        (obj.canvas.height - obj.getBoundingRect().height
        + obj.top - obj.getBoundingRect().top));
      obj.left = Math.min(obj.left,
        (obj.canvas.width - obj.getBoundingRect().width
        + obj.left - obj.getBoundingRect().left));
    }
  }

  // Helpers

  // Legacy code needed to support migrated v1 scribing questions.
  // This code scales/unscales the scribbles by a standard number.
  normaliseScribble(scribble, isDenormalise) {
    const STANDARD = 1000;
    let factor;

    if (isDenormalise) {
      factor = this.canvas.getWidth() / STANDARD;
    } else {
      factor = STANDARD / this.canvas.getWidth();
    }

    scribble.set({
      scaleX: scribble.scaleX * factor,
      scaleY: scribble.scaleY * factor,
      left: scribble.left * factor,
      top: scribble.top * factor,
    });
  }

  denormaliseScribble(scribble) {
    return this.normaliseScribble(scribble, true);
  }

  initializeScribblesAndBackground = (isFirstInit) => {
    const { scribbles } = this.props.scribing.answer;
    const { layers } = this.props.scribing;
    const userId = this.props.scribing.answer.user_id;

    this.isScribblesLoaded = false;
    let userScribble = [];

    layers.forEach(layer => this.canvas.add(layer.scribbleGroup));

    if (scribbles) {
      scribbles.forEach((scribble) => {
        const objects = JSON.parse(scribble.content).objects;
        const fabricObjs = [];

        // Parse JSON to Fabric.js objects
        for (let i = 0; i < objects.length; i++) {
          const klass = fabric.util.getKlass(objects[i].type);
          klass.fromObject(objects[i], (obj) => {
            this.denormaliseScribble(obj);
            fabricObjs.push(obj);
          });
        }

        // Create layer for each user's scribble
        // Layer for other users' scribble
        // Disables scribble selection
        if (isFirstInit && scribble.creator_id !== userId) {
          // eslint-disable-next-line no-undef
          const scribbleGroup = new fabric.Group(fabricObjs);
          scribbleGroup.selectable = false;

          const showLayer = (isShown) => {
            // eslint-disable-next-line no-param-reassign
            scribbleGroup._objects.forEach(obj => (obj.setVisible(isShown)));
            this.canvas.renderAll();
          };
          // Populate layers list
          const newScribble = {
            ...scribble,
            isDisplayed: true,
            showLayer,
            scribbleGroup,
          };
          this.props.addLayer(this.props.answerId, newScribble);
          this.canvas.add(scribbleGroup);
        } else if (scribble.creator_id === userId) {
          // Add other user's layers first to avoid blocking of user's layer
          userScribble = fabricObjs;
        }
      });

      // Layer for current user's scribble
      // Enables scribble selection
      userScribble.map(obj => (this.canvas.add(obj)));
    }
    this.canvas.setBackground();
    this.canvas.renderAll();
    this.isScribblesLoaded = true;
  }

  initializeCanvas(answerId, imageUrl) {
    this.image = new Image(); // eslint-disable-line no-undef
    this.image.src = imageUrl;

    this.image.onload = () => {
      // Get the calculated width of canvas, 750 is min width for scribing toolbar
      const element = document.getElementById(`canvas-${answerId}`);
      const maxWidth = Math.max(element.getBoundingClientRect().width, 750);

      this.width = Math.min(this.image.width, maxWidth);
      this.scale = Math.min(this.width / this.image.width, 1);
      this.height = this.scale * this.image.height;

      this.canvas = new fabric.Canvas(`canvas-${answerId}`, {
        width: this.width,
        height: this.height,
        preserveObjectStacking: true,
        renderOnAddRemove: false,
        objectCaching: false,
        statefullCache: false,
        noScaleCache: true,
        needsItsOwnCache: false,
        selectionColor: 'transparent',
      });

      this.props.setCanvasProperties(this.props.answerId, this.width, this.height, maxWidth);

      const fabricImage = new fabric.Image(
        this.image,
        { opacity: 1, scaleX: this.scale, scaleY: this.scale }
      );
      this.canvas.setBackground = () => (
        this.canvas.setBackgroundImage(fabricImage, this.canvas.renderAll.bind(this.canvas))
      );

      const canvasElem = document.getElementById(`canvas-container-${answerId}`);
      const canvasContainerElem = canvasElem.getElementsByClassName('canvas-container')[0];
      canvasContainerElem.style.margin = '0 auto';

      this.initializeScribblesAndBackground(true);

      this.canvas.on('mouse:down', this.onMouseDownCanvas);
      this.canvas.on('mouse:move', this.onMouseMoveCanvas);
      this.canvas.on('mouse:up', this.onMouseUpCanvas);
      this.canvas.on('mouse:over', this.onMouseOver);
      this.canvas.on('mouse:out', this.onMouseOut);
      this.canvas.on('object:moving', this.onObjectMovingCanvas);
      this.canvas.on('object:modified', this.saveScribbles);
      this.canvas.on('object:added', this.saveScribbles);
      this.canvas.on('object:removed', this.saveScribbles);
      this.canvas.on('text:editing:exited', this.onTextChanged);

      this.scaleCanvas();
      this.props.setCanvasLoaded(this.props.answerId, true, this.canvas);
    };
  }

  // Adjusting canvas height after canvas initialization
  // helps to scale/move scribbles accordingly
  scaleCanvas() {
    this.canvas.setWidth(this.width);
    this.canvas.setHeight(this.height);
    this.canvas.renderAll();
  }

  // Scribble Helpers

  saveScribbles = () => (
    new Promise((resolve) => {
      if (this.isScribblesLoaded) {
        const answerId = this.props.answerId;
        const answerActableId = this.props.scribing.answer.answer_id;
        const json = this.getScribbleJSON();
        this.props.updateScribingAnswerInLocal(answerId, json);
        this.props.updateScribingAnswer(answerId, answerActableId, json);
      }
      resolve();
    })
  )

  getScribbleJSON() {
    // Remove non-user scribings in canvas
    this.props.scribing.layers.forEach((layer) => {
      if (layer.creator_id !== this.props.scribing.answer.user_id) {
        layer.showLayer(false);
      }
    });

    // Only save rescaled user scribings
    const objects = this.canvas._objects;
    objects.forEach((obj) => {
      this.normaliseScribble(obj);
    });
    const json = JSON.stringify(objects);

    // Scale back user scribings
    objects.forEach((obj) => {
      this.denormaliseScribble(obj);
    });

    // Add back non-user scribings according canvas state
    this.props.scribing.layers.forEach(layer => (layer.showLayer(layer.isDisplayed)));
    return `{"objects": ${json}}`;
  }

  onTextChanged = () => {
    this.saveScribbles();
    this.props.setToolSelected(this.props.answerId, scribingTools.SELECT);
  }

  // Utility Helpers

  getRgbaHelper = json => (
    `rgba(${json.r},${json.g},${json.b},${json.a})`
  );

  getMousePoint = event => (
    {
      x: event.clientX,
      y: event.clientY,
    }
  );

  // Generates the left, top, width and height of the drag
  generateMouseDragProperties = (point1, point2) => (
    {
      left: point1.x < point2.x ? point1.x : point2.x,
      top: point1.y < point2.y ? point1.y : point2.y,
      width: Math.abs(point1.x - point2.x),
      height: Math.abs(point1.y - point2.y),
    }
  );

  getCanvasPoint(event) {
    if (!event) return undefined;
    const pointer = this.canvas.getPointer(event);
    return {
      x: pointer.x,
      y: pointer.y,
    };
  }

  render() {
    const answerId = this.props.answerId;
    const isCanvasLoaded = this.props.scribing.isCanvasLoaded;
    return (answerId ?
      <div style={styles.canvas_div} id={`canvas-container-${answerId}`}>
        { !isCanvasLoaded ? <LoadingIndicator /> : null }
        <canvas style={styles.canvas} id={`canvas-${answerId}`} />
      </div> : null
    );
  }
}

ScribingCanvas.propTypes = propTypes;
