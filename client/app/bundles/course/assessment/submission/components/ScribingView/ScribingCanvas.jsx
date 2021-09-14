/* eslint no-mixed-operators: "off" */
/* eslint react/sort-comp: "off" */
/* eslint no-undef: "off" */ // For usage of fabric
import React from 'react';
import PropTypes from 'prop-types';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import {
  scribingTools,
  scribingShapes,
  scribingToolColor,
  scribingToolThickness,
  scribingToolLineStyle,
} from '../../constants';

import { scribingShape } from '../../propTypes';

const propTypes = {
  answerId: PropTypes.number.isRequired,
  scribing: scribingShape,
  addLayer: PropTypes.func.isRequired,
  setCanvasLoaded: PropTypes.func.isRequired,
  setCanvasProperties: PropTypes.func.isRequired,
  setToolSelected: PropTypes.func.isRequired,
  setCurrentStateIndex: PropTypes.func.isRequired,
  setCanvasStates: PropTypes.func.isRequired,
  setActiveObject: PropTypes.func.isRequired,
  setCanvasCursor: PropTypes.func.isRequired,
  updateScribingAnswer: PropTypes.func.isRequired,
  updateScribingAnswerInLocal: PropTypes.func.isRequired,
  resetCanvasDelete: PropTypes.func.isRequired,
  resetDisableObjectSelection: PropTypes.func.isRequired,
  resetEnableObjectSelection: PropTypes.func.isRequired,
  resetCanvasDirty: PropTypes.func.isRequired,
  resetCanvasSave: PropTypes.func.isRequired,
  resetChangeTool: PropTypes.func.isRequired,
  resetUndo: PropTypes.func.isRequired,
  resetRedo: PropTypes.func.isRequired,
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
    this.copiedObjects = [];
  }

  componentDidMount() {
    const { answerId, scribing } = this.props;
    this.initializeCanvas(answerId, scribing.answer.image_url);
  }

  shouldComponentUpdate(nextProps) {
    if (this.canvas) {
      this.canvas.isDrawingMode = nextProps.scribing.isDrawingMode;
      this.canvas.freeDrawingBrush.color =
        nextProps.scribing.colors[scribingToolColor.DRAW];
      this.canvas.freeDrawingBrush.width =
        nextProps.scribing.thickness[scribingToolThickness.DRAW];
      this.canvas.defaultCursor = nextProps.scribing.cursor;
      this.currentCursor = nextProps.scribing.cursor;

      this.canvas.zoomToPoint(
        {
          x: this.canvas.height / 2,
          y: this.canvas.width / 2,
        },
        nextProps.scribing.canvasZoom
      );
      this.canvas.trigger('mouse:move', { isForced: true });

      if (nextProps.scribing.isEnableObjectSelection) {
        // Objects are selectable in Type tool, dont have to enableObjectSelection again
        const isActiveObjectText =
          this.canvas.getActiveObject() &&
          this.canvas.getActiveObject().type === 'i-text';
        if (isActiveObjectText) {
          this.canvas.getActiveObject().exitEditing();
        } else {
          this.enableObjectSelection();
        }
        this.props.resetEnableObjectSelection(this.props.answerId);
      }

      // Discard prior active object/group when using other tools
      const isNonDrawingTool =
        nextProps.scribing.selectedTool !== scribingTools.TYPE &&
        nextProps.scribing.selectedTool !== scribingTools.DRAW &&
        nextProps.scribing.selectedTool !== scribingTools.LINE &&
        nextProps.scribing.selectedTool !== scribingTools.SHAPE;

      if (nextProps.scribing.isChangeTool) {
        if (isNonDrawingTool) {
          this.canvas.discardActiveObject();
        }
        this.canvas.renderAll();
        this.props.resetChangeTool(this.props.answerId);
      }

      if (nextProps.scribing.isDisableObjectSelection) {
        this.disableObjectSelection();
        this.props.resetDisableObjectSelection(this.props.answerId);
      }
      if (nextProps.scribing.isCanvasDirty) {
        this.canvas.renderAll();
        this.props.resetCanvasDirty(this.props.answerId);
      }
      if (nextProps.scribing.isCanvasSave) {
        this.saveScribbles();
        this.props.resetCanvasSave(this.props.answerId);
      }
      if (nextProps.scribing.isUndo) {
        this.undo();
        this.props.resetUndo(this.props.answerId);
      }
      if (nextProps.scribing.isRedo) {
        this.redo();
        this.props.resetRedo(this.props.answerId);
      }
      if (nextProps.scribing.isDelete) {
        const activeObjects = this.canvas.getActiveObjects();
        this.canvas.discardActiveObject();
        activeObjects.forEach((object) => this.canvas.remove(object));
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

  // This method clears the selection-disabled scribbles
  // and reloads them to enable selection again
  enableObjectSelection() {
    const canvasState =
      this.props.scribing.canvasStates[this.props.scribing.currentStateIndex];
    const userScribbles = this.getFabricObjectsFromJson(canvasState);
    this.canvas.clear();
    this.canvas.setBackground();
    this.props.scribing.layers.forEach((layer) =>
      this.canvas.add(layer.scribbleGroup));
    userScribbles.forEach((scribble) => {
      if (scribble.type === 'i-text') {
        scribble.setControlsVisibility({
          bl: false,
          br: false,
          mb: false,
          ml: false,
          mr: false,
          mt: false,
          tl: false,
          tr: false,
        });
      }
      this.canvas.add(scribble);
    });
    this.canvas.renderAll();
    this.isScribblesLoaded = true;
  }

  // Canvas Event Handlers

  onMouseDownCanvas = (options) => {
    this.mouseCanvasDragStartPoint = this.getCanvasPoint(options.e);

    // To facilitate moving
    this.mouseDownFlag = true;
    this.viewportLeft = this.canvas.viewportTransform[4];
    this.viewportTop = this.canvas.viewportTransform[5];
    this.mouseStartPoint = this.getMousePoint(options.e);

    this.isOverActiveObject =
      options.target !== null &&
      options.target === this.canvas.getActiveObject();

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

      if (
        this.props.scribing.selectedTool === scribingTools.LINE &&
        !this.isOverActiveObject
      ) {
        // Make previous line unselectable if it exists
        if (this.line && this.line.type === 'line') {
          this.line.selectable = false;
        }

        const strokeDashArray = getStrokeDashArray(scribingToolLineStyle.LINE);
        this.line = new fabric.Line(
          [
            this.mouseCanvasDragStartPoint.x,
            this.mouseCanvasDragStartPoint.y,
            this.mouseCanvasDragStartPoint.x,
            this.mouseCanvasDragStartPoint.y,
          ],
          {
            stroke: `${this.props.scribing.colors[scribingToolColor.LINE]}`,
            strokeWidth:
              this.props.scribing.thickness[scribingToolThickness.LINE],
            strokeDashArray,
            selectable: true,
          }
        );
        this.canvas.add(this.line);
        this.canvas.setActiveObject(this.line);
        this.canvas.renderAll();
      } else if (
        this.props.scribing.selectedTool === scribingTools.SHAPE &&
        !this.isOverActiveObject
      ) {
        const strokeDashArray = getStrokeDashArray(
          scribingToolLineStyle.SHAPE_BORDER
        );
        switch (this.props.scribing.selectedShape) {
          case scribingShapes.RECT: {
            // Make previous rect unselectable if it exists
            if (this.rect && this.rect.type === 'rect') {
              this.rect.selectable = false;
            }

            this.rect = new fabric.Rect({
              left: this.mouseCanvasDragStartPoint.x,
              top: this.mouseCanvasDragStartPoint.y,
              stroke: `${
                this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]
              }`,
              strokeWidth:
                this.props.scribing.thickness[
                  scribingToolThickness.SHAPE_BORDER
                ],
              strokeDashArray,
              fill: `${
                this.props.scribing.colors[scribingToolColor.SHAPE_FILL]
              }`,
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
              stroke: `${
                this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]
              }`,
              strokeWidth:
                this.props.scribing.thickness[
                  scribingToolThickness.SHAPE_BORDER
                ],
              strokeDashArray,
              fill: `${
                this.props.scribing.colors[scribingToolColor.SHAPE_FILL]
              }`,
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

    if (
      this.props.scribing.selectedTool !== scribingTools.TYPE &&
      this.textCreated
    ) {
      this.textCreated = false;

      // Only allow one i-text to be created per selection of TEXT mode
      // Second click in non-text area will exit to SELECT mode
    } else if (
      !this.isOverText &&
      this.props.scribing.selectedTool === scribingTools.TYPE &&
      !this.textCreated
    ) {
      const text = new fabric.IText('', {
        fontFamily: this.props.scribing.fontFamily,
        fontSize: this.props.scribing.fontSize,
        fill: this.props.scribing.colors[scribingToolColor.TYPE],
        left: this.mouseCanvasDragStartPoint.x,
        top: this.mouseCanvasDragStartPoint.y,
        padding: 5,
      });
      // Don't allow scaling of text object
      text.setControlsVisibility({
        bl: false,
        br: false,
        mb: false,
        ml: false,
        mr: false,
        mt: false,
        tl: false,
        tr: false,
      });
      this.canvas.add(text);
      this.canvas.setActiveObject(text);
      text.enterEditing();
      this.canvas.renderAll();
      this.textCreated = true;
    }
  };

  onMouseMoveCanvas = (options) => {
    const dragPointer = this.getCanvasPoint(options.e);

    // Do moving action
    const tryMove = (left, top) => {
      // limit moving
      let finalLeft = Math.min(left, 0);
      finalLeft = Math.max(
        finalLeft,
        (this.canvas.getZoom() - 1) * this.canvas.getWidth() * -1
      );
      let finalTop = Math.min(top, 0);
      finalTop = Math.max(
        finalTop,
        (this.canvas.getZoom() - 1) * this.canvas.getHeight() * -1
      );

      // apply calculated move transforms
      this.canvas.viewportTransform[4] = finalLeft;
      this.canvas.viewportTransform[5] = finalTop;
      this.canvas.renderAll();
    };

    if (this.mouseDownFlag) {
      if (
        dragPointer &&
        this.props.scribing.selectedTool === scribingTools.LINE &&
        !this.isOverActiveObject
      ) {
        this.line.set({ x2: dragPointer.x, y2: dragPointer.y });
        this.canvas.renderAll();
      } else if (
        dragPointer &&
        this.props.scribing.selectedTool === scribingTools.SHAPE &&
        !this.isOverActiveObject
      ) {
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
      } else if (this.props.scribing.selectedTool === scribingTools.MOVE) {
        const mouseCurrentPoint = this.getMousePoint(options.e);
        const deltaLeft = mouseCurrentPoint.x - this.mouseStartPoint.x;
        const deltaTop = mouseCurrentPoint.y - this.mouseStartPoint.y;
        const newLeft = this.viewportLeft + deltaLeft;
        const newTop = this.viewportTop + deltaTop;
        tryMove(newLeft, newTop);
      }
    } else if (options.isForced) {
      // Facilitates zooming out
      tryMove(
        this.canvas.viewportTransform[4],
        this.canvas.viewportTransform[5]
      );
    }
  };

  onMouseUpCanvas = () => {
    this.mouseDownFlag = false;

    switch (this.props.scribing.selectedTool) {
      case scribingTools.DRAW: {
        this.saveScribbles();
        break;
      }
      case scribingTools.LINE: {
        if (this.line.height + this.line.width < 10) {
          this.canvas.remove(this.line);
          this.canvas.renderAll();
        } else {
          this.saveScribbles();
        }
        break;
      }
      case scribingTools.SHAPE: {
        if (this.props.scribing.selectedShape === scribingShapes.RECT) {
          if (this.rect.height + this.rect.width < 10) {
            this.canvas.remove(this.rect);
            this.canvas.renderAll();
          } else {
            this.saveScribbles();
          }
        } else if (
          this.props.scribing.selectedShape === scribingShapes.ELLIPSE
        ) {
          if (this.ellipse.height + this.ellipse.width < 10) {
            this.canvas.remove(this.ellipse);
            this.canvas.renderAll();
          } else {
            this.saveScribbles();
          }
        }
        break;
      }
      default:
    }
  };

  onMouseOver = (options) => {
    if (options.target && options.target.type === 'i-text') {
      this.isOverText = true;
    }
  };

  onMouseOut = () => {
    this.isOverText = false;
  };

  // Limit moving of objects to within the canvas
  onObjectMovingCanvas = (options) => {
    const obj = options.target;
    // if object is too big ignore
    if (
      obj.currentHeight > obj.canvas.height ||
      obj.currentWidth > obj.canvas.width
    ) {
      return;
    }
    obj.setCoords();
    // top-left  corner
    if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
      obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
      obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
    }
    // bot-right corner
    if (
      obj.getBoundingRect().top + obj.getBoundingRect().height >
        obj.canvas.height ||
      obj.getBoundingRect().left + obj.getBoundingRect().width >
        obj.canvas.width
    ) {
      obj.top = Math.min(
        obj.top,
        obj.canvas.height -
          obj.getBoundingRect().height +
          obj.top -
          obj.getBoundingRect().top
      );
      obj.left = Math.min(
        obj.left,
        obj.canvas.width -
          obj.getBoundingRect().width +
          obj.left -
          obj.getBoundingRect().left
      );
    }
  };

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

  initializeScribblesAndBackground = () => {
    const { scribbles } = this.props.scribing.answer;
    const { layers } = this.props.scribing;
    const userId = this.props.scribing.answer.user_id;

    this.isScribblesLoaded = false;
    let userScribble = [];

    layers.forEach((layer) => this.canvas.add(layer.scribbleGroup));

    if (scribbles) {
      scribbles.forEach((scribble) => {
        const fabricObjs = this.getFabricObjectsFromJson(scribble.content);

        // Create layer for each user's scribble
        // Scribbles in layers have selection disabled
        if (scribble.creator_id !== userId) {
          // eslint-disable-next-line no-undef
          const scribbleGroup = new fabric.Group(fabricObjs);
          scribbleGroup.selectable = false;

          const showLayer = (isShown) => {
            // eslint-disable-next-line no-param-reassign
            scribbleGroup._objects.forEach((obj) => obj.setVisible(isShown));
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
      userScribble.forEach((obj) => {
        // Don't allow scaling of text object
        if (obj.type === 'i-text') {
          obj.setControlsVisibility({
            bl: false,
            br: false,
            mb: false,
            ml: false,
            mr: false,
            mt: false,
            tl: false,
            tr: false,
          });
        }
        this.canvas.add(obj);
      });
    }
    this.canvas.setBackground();
    this.canvas.renderAll();
    this.isScribblesLoaded = true;
    this.saveScribbles(); // Add initial state as index 0 is states history
  };

  initializeCanvas(answerId, imageUrl) {
    this.image = new Image(); // eslint-disable-line no-undef
    this.image.src = imageUrl;

    this.image.onload = () => {
      // Get the calculated width of canvas, 800 is min width for scribing toolbar
      const element = document.getElementById(`canvas-${answerId}`);
      const maxWidth = Math.max(element.getBoundingClientRect().width, 800);

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
        backgroundColor: 'white',
      });

      this.props.setCanvasProperties(
        this.props.answerId,
        this.width,
        this.height,
        maxWidth
      );

      const fabricImage = new fabric.Image(this.image, {
        opacity: 1,
        scaleX: this.scale,
        scaleY: this.scale,
      });
      this.canvas.setBackground = () =>
        this.canvas.setBackgroundImage(
          fabricImage,
          this.canvas.renderAll.bind(this.canvas)
        );

      const canvasElem = document.getElementById(
        `canvas-container-${answerId}`
      );
      canvasElem.tabIndex = 1000;
      // Minimise reflows
      canvasElem.setAttribute(
        'style',
        `background: lightgrey;
        max-width: ${maxWidth}px;
        margin: 0px;
        outline: none;`
      );
      canvasElem.addEventListener('keydown', this.onKeyDown, false);
      const canvasContainerElem =
        canvasElem.getElementsByClassName('canvas-container')[0];
      canvasContainerElem.style.margin = '0 auto';

      this.initializeScribblesAndBackground();

      this.canvas.on('mouse:down', this.onMouseDownCanvas);
      this.canvas.on('mouse:move', this.onMouseMoveCanvas);
      this.canvas.on('mouse:up', this.onMouseUpCanvas);
      this.canvas.on('mouse:over', this.onMouseOver);
      this.canvas.on('mouse:out', this.onMouseOut);
      this.canvas.on('object:moving', this.onObjectMovingCanvas);
      this.canvas.on('object:modified', this.saveScribbles);
      this.canvas.on('object:removed', this.saveScribbles);
      this.canvas.on('selection:created', this.onObjectSelected);
      this.canvas.on('selection:updated', this.onObjectSelected);
      this.canvas.on('selection:cleared', this.onSelectionCleared);
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
  undo = () => {
    if (this.props.scribing.currentStateIndex > 0) {
      this.setCurrentCanvasState(this.props.scribing.currentStateIndex - 1);
    }
  };

  redo = () => {
    if (
      this.props.scribing.canvasStates.length - 1 >
        this.props.scribing.currentStateIndex &&
      this.props.scribing.canvasStates.length > 1
    ) {
      this.setCurrentCanvasState(this.props.scribing.currentStateIndex + 1);
    }
  };

  /*
   * @param {string} json: JSON string with 'objects' key containing array of scribbles
   * @return {array} array of Fabric objects
   */
  getFabricObjectsFromJson = (json) => {
    const objects = JSON.parse(json).objects;
    const userScribbles = [];

    // Parse JSON to Fabric.js objects
    for (let i = 0; i < objects.length; i++) {
      if (objects[i].type !== 'group') {
        const klass = fabric.util.getKlass(objects[i].type);
        klass.fromObject(objects[i], (obj) => {
          this.denormaliseScribble(obj);
          userScribbles.push(obj);
        });
      }
    }
    return userScribbles;
  };

  setCurrentCanvasState = (stateIndex) => {
    const userScribbles = this.getFabricObjectsFromJson(
      this.props.scribing.canvasStates[stateIndex]
    );

    this.canvas.clear();
    this.canvas.setBackground();
    this.props.scribing.layers.forEach((layer) =>
      this.canvas.add(layer.scribbleGroup));
    userScribbles.forEach((scribble) => this.canvas.add(scribble));
    this.canvas.renderAll();
    this.isScribblesLoaded = true;

    this.props.setCurrentStateIndex(this.props.answerId, stateIndex);
  };

  saveScribbles = () =>
    new Promise((resolve) => {
      if (this.isScribblesLoaded) {
        const answerId = this.props.answerId;
        const answerActableId = this.props.scribing.answer.answer_id;
        const json = this.getScribbleJSON();
        this.props.updateScribingAnswerInLocal(answerId, json);
        this.props.updateScribingAnswer(answerId, answerActableId, json);

        let states = this.props.scribing.canvasStates;
        if (
          this.props.scribing.currentStateIndex <
          this.props.scribing.canvasStates.length - 1
        ) {
          const addedStateIndex = this.props.scribing.currentStateIndex + 1;
          states[addedStateIndex] = json;
          states = states.splice(0, addedStateIndex + 1);
          this.props.setCanvasStates(this.props.answerId, states);
        } else {
          states.push(json);
          this.props.setCanvasStates(this.props.answerId, states);
        }
        this.props.setCurrentStateIndex(this.props.answerId, states.length - 1);
      }
      resolve();
    });

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
    this.props.scribing.layers.forEach((layer) =>
      layer.showLayer(layer.isDisplayed));
    return `{"objects": ${json}}`;
  }

  onTextChanged = (options) => {
    if (options.target.text.trim() === '') {
      this.canvas.remove(options.target);
    }
    this.textCreated = false;
    this.saveScribbles();
    this.props.setToolSelected(this.props.answerId, scribingTools.SELECT);
    this.props.setCanvasCursor(this.props.answerId, 'default');
  };

  onObjectSelected = (options) => {
    if (options.target) {
      this.props.setActiveObject(this.props.answerId, options.target);
    }
  };

  onSelectionCleared = () => {
    this.props.setActiveObject(this.props.answerId, undefined);
  };

  onKeyDown = (event) => {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();
    const activeObjects = this.canvas.getActiveObjects();

    switch (event.keyCode) {
      case 8: // Backspace key
      case 46: {
        // Delete key
        this.canvas.discardActiveObject();
        activeObjects.forEach((object) => this.canvas.remove(object));
        break;
      }
      case 67: {
        // Ctrl+C
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();

          this.copiedObjects = [];
          activeObjects.forEach((obj) => this.copiedObjects.push(obj));
          this.copyLeft = activeObject.left;
          this.copyTop = activeObject.top;
        }
        break;
      }
      case 86: {
        // Ctrl+V
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();

          this.canvas.discardActiveObject();

          const newObjects = [];
          let newObj = {};

          // Don't wrap single object in group,
          // in case it's i-text and we want it to be editable at first tap
          if (this.copiedObjects.length === 1) {
            const obj = this.copiedObjects[0];
            if (obj.type === 'i-text') {
              newObj = this.cloneText(obj);
            } else {
              obj.clone((c) => {
                newObj = c;
              });
            }

            this.setCopiedCanvasObjectPosition(newObj);
            this.canvas.add(newObj);
            this.canvas.setActiveObject(newObj);
            this.canvas.renderAll();
          } else {
            // Cloning a group of objects
            this.copiedObjects.forEach((obj) => {
              if (obj.type === 'i-text') {
                newObj = this.cloneText(obj);
              } else {
                obj.clone((c) => {
                  newObj = c;
                });
              }
              newObj.setCoords();
              this.canvas.add(newObj);
              newObjects.push(newObj);
            });
            const selection = new fabric.ActiveSelection(newObjects, {
              canvas: this.canvas,
            });

            this.setCopiedCanvasObjectPosition(selection);
            this.canvas.setActiveObject(selection);
            this.canvas.renderAll();
          }
        }
        break;
      }
      case 90: {
        // Ctrl-Z
        if (event.ctrlKey || event.metaKey) {
          if (event.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
        }
        break;
      }
      default:
    }
  };

  // Utility Helpers
  cloneText = (obj) => {
    const newObj = new fabric.IText(obj.text, {
      left: obj.left,
      top: obj.top,
      fontFamily: obj.fontFamily,
      fontSize: obj.fontSize,
      fill: obj.fill,
      padding: 5,
    });
    newObj.setControlsVisibility({
      bl: false,
      br: false,
      mb: false,
      ml: false,
      mr: false,
      mt: false,
      tl: false,
      tr: false,
    });
    return newObj;
  };

  setCopiedCanvasObjectPosition(obj) {
    // Shift copied object to the left if there's space
    this.copyLeft =
      this.copyLeft + obj.width > this.canvas.width
        ? this.copyLeft
        : this.copyLeft + 10;
    obj.left = this.copyLeft; // eslint-disable-line no-param-reassign
    // Shift copied object down if there's space
    this.copyTop =
      this.copyTop + obj.height > this.canvas.height
        ? this.copyTop
        : this.copyTop + 10;
    obj.top = this.copyTop; // eslint-disable-line no-param-reassign

    obj.setCoords();
  }

  getMousePoint = (event) => ({
    x: event.clientX,
    y: event.clientY,
  });

  // Generates the left, top, width and height of the drag
  generateMouseDragProperties = (point1, point2) => ({
    left: point1.x < point2.x ? point1.x : point2.x,
    top: point1.y < point2.y ? point1.y : point2.y,
    width: Math.abs(point1.x - point2.x),
    height: Math.abs(point1.y - point2.y),
  });

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
    return answerId ? (
      <div style={styles.canvas_div} id={`canvas-container-${answerId}`}>
        {!isCanvasLoaded ? <LoadingIndicator /> : null}
        <canvas style={styles.canvas} id={`canvas-${answerId}`} />
      </div>
    ) : null;
  }
}

ScribingCanvas.propTypes = propTypes;
