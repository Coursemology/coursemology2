import {
  forwardRef,
  MutableRefObject,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  ActiveSelection,
  Canvas,
  classRegistry,
  Constructor,
  Ellipse,
  FabricImage,
  FabricObject,
  Group,
  IText,
  Line,
  PencilBrush,
  Point,
  Rect,
  TPointerEvent,
  TPointerEventInfo,
  XY,
} from 'fabric';
import { ScribingAnswerScribble } from 'types/course/assessment/submission/answer/scribing';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import { updateScribingAnswer } from '../../actions/answers/scribing';
import { ScribingToolWithLineStyle } from '../../constants';
import { scribingActions, ScribingAnswerState } from '../../reducers/scribing';

const styles = {
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
  canvas: {
    width: '100%',
    border: '1px solid black',
  },
  toolbar: {
    marginBottom: '1em',
    marginRight: '1em',
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

export interface ScribingCanvasProps {
  answerId: number;
}

export interface ScribingCanvasRef {
  getActiveObject(): FabricObject | undefined;
  getCanvasWidth(): number;
  getLayers(): ScribingLayer[];
  setLayerDisplay(creatorId: number, isDisplayed: boolean): void;
  /** Subscribe to canvas selection changes. Returns an unsubscribe function. */
  onSelectionChange(callback: () => void): () => void;
}

export interface ScribingLayer extends ScribingAnswerScribble {
  isDisplayed: boolean;
  scribbleGroup: Group;
  creator_id: number;
  creator_name?: string;
}

interface FabricObjectJson {
  type: string;
}

// Helpers

const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

/**
 * Scales/unscales the given scribbles by a standard number.
 * Legacy method needed to support migrated v1 scribing questions.
 */
const normaliseScribble = (
  canvas: Canvas,
  scribble: FabricObject,
  isDenormalise: boolean = false,
): void => {
  const STANDARD = 1000;
  let factor;

  if (isDenormalise) {
    factor = canvas.getWidth() / STANDARD;
  } else {
    factor = STANDARD / canvas.getWidth();
  }

  scribble.set({
    scaleX: scribble.scaleX * factor,
    scaleY: scribble.scaleY * factor,
    left: scribble.left * factor,
    top: scribble.top * factor,
  });
};

const denormaliseScribble = (canvas: Canvas, scribble: FabricObject): void => {
  return normaliseScribble(canvas, scribble, true);
};

const getFabricObjectsFromJson = async (
  canvas: Canvas,
  json: string,
): Promise<FabricObject[] | undefined> => {
  if (!json) return undefined;

  const objects = JSON.parse(json).objects as FabricObjectJson[];

  // Parse JSON to Fabric.js objects
  return (
    await Promise.all(
      objects.map(async (objectJson) => {
        if (objectJson.type !== 'group') {
          const klass = classRegistry.getClass<
            Constructor<FabricObject> & {
              fromObject: (object: FabricObjectJson) => Promise<FabricObject>;
            }
          >(objectJson.type);
          const obj = await klass.fromObject(objectJson);
          denormaliseScribble(canvas, obj);
          return obj;
        }
        return undefined;
      }),
    )
  ).filter((obj): obj is FabricObject => Boolean(obj));
};

const ScribingCanvas = forwardRef<ScribingCanvasRef, ScribingCanvasProps>(
  ({ answerId }, ref) => {
    const canvasRef: MutableRefObject<Canvas | undefined> = useRef();
    const htmlCanvasRef = useRef(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const line = useRef<Line | undefined>(undefined);
    const rect = useRef<Rect | undefined>(undefined);
    const ellipse = useRef<Ellipse | undefined>(undefined);
    const viewportLeft = useRef(0);
    const viewportTop = useRef(0);
    const textCreated = useRef(false);
    const copiedObjects = useRef<FabricObject[]>([]);
    const copyLeft = useRef(0);
    const copyTop = useRef(0);
    const isScribblesLoaded = useRef(false);
    const isSavingScribbles = useRef(false);
    const layers = useRef<ScribingLayer[]>([]);
    const mouseCanvasDragStartPoint = useRef<XY | undefined>(undefined);
    const mouseDownFlag = useRef(false);
    const mouseStartPoint = useRef<XY>({ x: 0, y: 0 });
    const isOverActiveObject = useRef(false);
    const isOverText = useRef(false);
    const cursor = useRef('pointer');
    const selectionListeners = useRef<Set<() => void>>(new Set());
    const pendingDispose = useRef<Promise<boolean> | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      getActiveObject: (): FabricObject | undefined => {
        return canvasRef.current?.getActiveObject();
      },
      getCanvasWidth: (): number => canvasRef.current?.width ?? 0,
      getLayers: (): ScribingLayer[] => {
        return layers.current;
      },
      setLayerDisplay: (creatorId: number, isDisplayed: boolean): void => {
        if (canvasRef.current) {
          layers.current = layers.current.map((layer) => {
            if (layer.creator_id === creatorId) {
              layer.scribbleGroup.set({ visible: isDisplayed });
              return { ...layer, isDisplayed };
            }
            return layer;
          });
          canvasRef.current.renderAll();
        }
      },
      onSelectionChange: (callback: () => void): (() => void) => {
        selectionListeners.current.add(callback);
        return () => {
          selectionListeners.current.delete(callback);
        };
      },
    }));

    const scribingRef = useRef<ScribingAnswerState | undefined>(undefined);
    const scribingState = useAppSelector(
      (state) => state.assessments.submission.scribing,
    );
    scribingRef.current = scribingState[answerId];

    const dispatch = useAppDispatch();

    /**
     * Higher-order function that guards a canvas callback against missing canvas
     * or scribing state. If either ref is absent at invocation time, the returned
     * function is a no-op; otherwise it forwards (canvas, scribing, ...args) to fn.
     *
     * TReturn defaults to void so useEffect(withCanvas(syncFn), deps) works directly.
     */
    const withCanvas =
      <TArgs extends unknown[], TReturn = void>(
        fn: (
          canvas: Canvas,
          scribing: ScribingAnswerState,
          ...args: TArgs
        ) => TReturn,
      ) =>
      (...args: TArgs): TReturn | undefined => {
        const canvas = canvasRef.current;
        const scribing = scribingRef.current;
        if (!canvas || !scribing) return undefined;
        return fn(canvas, scribing, ...args);
      };

    const scribblesAsJson = (
      canvas: Canvas,
      scribing: ScribingAnswerState,
    ): string => {
      // Remove non-user scribings in canvas
      layers.current.forEach((layer) => {
        if (layer.creator_id !== scribing.answer.user_id) {
          layer.scribbleGroup.set({ visible: false });
        }
      });
      canvas.renderAll();

      // Only save rescaled user scribings
      const objects = canvas.getObjects();
      objects.forEach((obj) => {
        normaliseScribble(canvas, obj);
      });
      const json = JSON.stringify(objects);

      // Scale back user scribings
      objects.forEach((obj) => {
        denormaliseScribble(canvas, obj);
      });

      // Add back non-user scribings according canvas state
      layers.current.forEach((layer) => {
        layer.scribbleGroup.set({ visible: layer.isDisplayed });
      });
      canvas.renderAll();
      return `{"objects": ${json}}`;
    };

    /**
     * Draws the given `scribbles` on the canvas
     * @param scribbles Scribbles as a fabric object
     * @param scribbleCallback (optional) Function to be called for each
     * `fabric.canvas.add` on scribble
     */
    const rehydrateCanvas = (
      canvas: Canvas,
      scribbles: FabricObject[],
      scribbleCallback?: (scribble: FabricObject) => void,
    ): void => {
      isScribblesLoaded.current = false;

      const backgroundImage = canvas.backgroundImage;
      canvas.clear();
      canvas.backgroundImage = backgroundImage;

      layers.current.forEach((layer) => canvas.add(layer.scribbleGroup));

      scribbles.forEach((scribble) => {
        scribbleCallback?.(scribble);
        canvas.add(scribble);
      });

      canvas.renderAll();

      isScribblesLoaded.current = true;
    };

    const updateAnswer = async (
      answerActableId: number,
      state: string,
    ): Promise<void> => {
      dispatch(
        scribingActions.updateScribingAnswerInLocal({
          answerId,
          scribble: state,
        }),
      );
      await dispatch(updateScribingAnswer(answerId, answerActableId, state));
    };

    const setCanvasStateAndUpdateAnswer = async (
      canvas: Canvas,
      scribing: ScribingAnswerState,
      stateIndex: number,
    ): Promise<void> => {
      const state = scribing.canvasStates[stateIndex];
      const scribbles = await getFabricObjectsFromJson(canvas, state);
      if (!scribbles)
        throw new Error(`trying to set canvas state to ${scribbles}`);

      rehydrateCanvas(canvas, scribbles);
      dispatch(
        scribingActions.setCurrentStateIndex({
          answerId,
          currentStateIndex: stateIndex,
        }),
      );

      await updateAnswer(scribing.answer.answer_id, state);
    };

    const getCanvasPoint = (
      canvas: Canvas,
      event: TPointerEvent,
    ): XY | undefined => {
      if (!event) return undefined;
      const pointer = canvas.getScenePoint(event);
      return {
        x: pointer.x,
        y: pointer.y,
      };
    };

    const getMousePoint = (event: TPointerEvent): XY => {
      if (event instanceof TouchEvent) {
        return {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
      return {
        x: event.clientX,
        y: event.clientY,
      };
    };

    // Generates the left, top, width and height of the drag

    const generateMouseDragProperties = (
      point1: XY | undefined,
      point2: XY,
      maxWidth: number,
      maxHeight: number,
    ): {
      left: number;
      top: number;
      width: number;
      height: number;
    } => {
      point2 = {
        x: clamp(point2.x, 0, maxWidth),
        y: clamp(point2.y, 0, maxHeight),
      };
      return {
        left:
          typeof point1?.x === 'number' ? (point1.x + point2.x) / 2 : point2.x,
        top:
          typeof point1?.y === 'number' ? (point1.y + point2.y) / 2 : point2.y,
        width: Math.abs((point1?.x ?? point2.x) - point2.x),
        height: Math.abs((point1?.y ?? point2.y) - point2.y),
      };
    };

    const disableObjectSelection = (canvas: Canvas): void => {
      canvas.selection = false;
      canvas.forEachObject((object) => {
        object.selectable = false;
        object.hoverCursor = cursor.current;
      });
    };

    const enableObjectSelection = (canvas: Canvas): void => {
      const layerGroups = new Set(layers.current.map((l) => l.scribbleGroup));
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        if (layerGroups.has(obj as Group)) return;
        obj.selectable = true;
        if (obj instanceof IText) {
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
      });
      canvas.renderAll();
    };

    const cloneText = (obj: IText): IText => {
      const newObj = new IText(obj.text, {
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

    const setCopiedCanvasObjectPosition = (
      canvas: Canvas,
      obj: FabricObject,
    ): void => {
      // Shift copied object to the left if there's space
      copyLeft.current =
        copyLeft.current + obj.width > canvas.width
          ? copyLeft.current
          : copyLeft.current + 10;
      obj.left = copyLeft.current;
      // Shift copied object down if there's space
      copyTop.current =
        copyTop.current + obj.height > canvas.height
          ? copyTop.current
          : copyTop.current + 10;
      obj.top = copyTop.current;

      obj.setCoords();
    };

    const deleteActiveObjects = (canvas: Canvas): void => {
      const activeObjects = canvas.getActiveObjects();
      canvas.discardActiveObject();

      const lastObjectIndex = Math.max(activeObjects.length - 1, 0);
      isScribblesLoaded.current = false;
      activeObjects.forEach((object, index) => {
        if (index === lastObjectIndex) isScribblesLoaded.current = true;
        canvas.remove(object);
      });

      isScribblesLoaded.current = true;
    };

    const saveScribbles = (): void => {
      if (!isScribblesLoaded.current || isSavingScribbles.current) return;
      withCanvas((canvas, scribing) => {
        isSavingScribbles.current = true;

        // See https://github.com/Coursemology/coursemology2/pull/4957 to learn
        // discarding and resetting active objects matters
        const activeObjects = canvas.getActiveObjects();
        canvas.discardActiveObject();

        const state = scribblesAsJson(canvas, scribing);

        const answerActableId = scribing.answer.answer_id;
        updateAnswer(answerActableId, state);
        dispatch(
          scribingActions.updateCanvasState({ answerId, canvasState: state }),
        );

        if (activeObjects.length > 1)
          canvas.setActiveObject(
            new ActiveSelection(activeObjects, { canvas }),
          );

        isSavingScribbles.current = false;
      })();
    };

    const undo = (canvas: Canvas, scribing: ScribingAnswerState): void => {
      const currentStateIndex = scribing.currentStateIndex;
      if (currentStateIndex <= 0) return;

      setCanvasStateAndUpdateAnswer(canvas, scribing, currentStateIndex - 1);
    };

    const redo = (canvas: Canvas, scribing: ScribingAnswerState): void => {
      const lastStateIndex = scribing.canvasStates.length - 1;
      const currentStateIndex = scribing.currentStateIndex;

      const hasNextStates = currentStateIndex < lastStateIndex;
      const hasStates = scribing.canvasStates.length > 1;

      if (!hasNextStates || !hasStates) return;

      setCanvasStateAndUpdateAnswer(canvas, scribing, currentStateIndex + 1);
    };

    // Canvas Event Handlers

    const onKeyDown = withCanvas(
      async (canvas, scribing, event: KeyboardEvent): Promise<void> => {
        const activeObject = canvas.getActiveObject();
        const activeObjects = canvas.getActiveObjects();

        switch (event.key) {
          case 'Backspace': // Backspace key
          case 'Delete': {
            // Delete key
            deleteActiveObjects(canvas);
            break;
          }
          case 'c': {
            // Ctrl+C
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();

              copiedObjects.current = [];
              activeObjects.forEach((obj) => copiedObjects.current.push(obj));
              copyLeft.current = activeObject?.left ?? 0;
              copyTop.current = activeObject?.top ?? 0;
            }
            break;
          }
          case 'v': {
            // Ctrl+V
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();

              canvas.discardActiveObject();

              let newObj: FabricObject;

              // Don't wrap single object in group,
              // in case it's i-text and we want it to be editable at first tap
              if (copiedObjects.current.length === 1) {
                const obj = copiedObjects.current[0];
                if (obj instanceof IText) {
                  newObj = cloneText(obj);
                } else {
                  newObj = await obj.clone();
                }

                setCopiedCanvasObjectPosition(canvas, newObj);
                canvas.add(newObj);
                canvas.setActiveObject(newObj);
                canvas.renderAll();
              } else {
                // Cloning a group of objects
                const newObjects = await Promise.all(
                  copiedObjects.current.map(async (obj) => {
                    if (obj instanceof IText) {
                      newObj = cloneText(obj);
                    } else {
                      newObj = await obj.clone();
                    }
                    newObj.setCoords();
                    canvas.add(newObj);
                    return newObj;
                  }),
                );
                const selection = new ActiveSelection(newObjects, {
                  canvas,
                });

                setCopiedCanvasObjectPosition(canvas, selection);
                canvas.setActiveObject(selection);
                canvas.renderAll();
              }
            }
            break;
          }
          case 'z': {
            // Ctrl-Z
            if (event.ctrlKey || event.metaKey) {
              if (event.shiftKey) {
                redo(canvas, scribing);
              } else {
                undo(canvas, scribing);
              }
            }
            break;
          }
          case 'a': {
            // Ctrl+A
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();

              const selection = new ActiveSelection(
                canvas
                  .getObjects()
                  .filter(
                    (obj) =>
                      !(obj instanceof Group) && obj.selectable && obj.visible,
                  ),
                { canvas },
              );
              canvas.setActiveObject(selection);
              canvas.renderAll();
            }
            break;
          }
          default:
        }
      },
    );

    const onMouseDownCanvas = withCanvas(
      (canvas, scribing, options: TPointerEventInfo): void => {
        mouseCanvasDragStartPoint.current = getCanvasPoint(canvas, options.e);

        // To facilitate moving
        mouseDownFlag.current = true;
        viewportLeft.current = canvas.viewportTransform[4];
        viewportTop.current = canvas.viewportTransform[5];
        mouseStartPoint.current = getMousePoint(options.e);
        isOverActiveObject.current =
          Boolean(options.target) &&
          options.target === canvas.getActiveObject();

        const getStrokeDashArray = (
          toolType: ScribingToolWithLineStyle,
        ): number[] => {
          switch (scribing.lineStyles[toolType]) {
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

        if (mouseCanvasDragStartPoint.current) {
          if (scribing.selectedTool === 'SELECT') {
            canvas.selectionBorderColor = 'gray';
            canvas.selectionDashArray = [1, 3];
          } else {
            canvas.selectionBorderColor = 'transparent';
            canvas.selectionDashArray = [];
          }

          if (scribing.selectedTool === 'LINE' && !isOverActiveObject.current) {
            // Make previous line unselectable if it exists
            if (line.current) {
              line.current.selectable = false;
            }

            const strokeDashArray = getStrokeDashArray('LINE');
            const newLine = new Line(
              [
                mouseCanvasDragStartPoint.current.x,
                mouseCanvasDragStartPoint.current.y,
                mouseCanvasDragStartPoint.current.x,
                mouseCanvasDragStartPoint.current.y,
              ],
              {
                stroke: `${scribing.colors.LINE}`,
                strokeWidth: scribing.thickness.LINE,
                strokeDashArray,
                selectable: true,
              },
            );
            line.current = newLine;
            canvas.add(newLine);
            canvas.setActiveObject(newLine);
            canvas.renderAll();
          } else if (
            scribing.selectedTool === 'SHAPE' &&
            !isOverActiveObject.current
          ) {
            const strokeDashArray = getStrokeDashArray('SHAPE_BORDER');
            switch (scribing.selectedShape) {
              case 'RECT': {
                // Make previous rect unselectable if it exists
                if (rect.current) {
                  rect.current.selectable = false;
                }

                const newRect = new Rect({
                  left: mouseCanvasDragStartPoint.current.x,
                  top: mouseCanvasDragStartPoint.current.y,
                  stroke: `${scribing.colors.SHAPE_BORDER}`,
                  strokeWidth: scribing.thickness.SHAPE_BORDER,
                  strokeDashArray,
                  fill: `${scribing.colors.SHAPE_FILL}`,
                  width: 1,
                  height: 1,
                  selectable: true,
                });
                rect.current = newRect;
                canvas.add(newRect);
                canvas.setActiveObject(newRect);
                canvas.renderAll();
                break;
              }
              case 'ELLIPSE': {
                // Make previous ellipse unselectable if it exists
                if (ellipse.current) {
                  ellipse.current.selectable = false;
                }

                const newEllipse = new Ellipse({
                  left: mouseCanvasDragStartPoint.current.x,
                  top: mouseCanvasDragStartPoint.current.y,
                  stroke: `${scribing.colors.SHAPE_BORDER}`,
                  strokeWidth: scribing.thickness.SHAPE_BORDER,
                  strokeDashArray,
                  fill: `${scribing.colors.SHAPE_FILL}`,
                  rx: 1,
                  ry: 1,
                  selectable: true,
                });
                ellipse.current = newEllipse;
                canvas.add(newEllipse);
                canvas.setActiveObject(newEllipse);
                canvas.renderAll();
                break;
              }
              default: {
                break;
              }
            }
          }

          if (scribing.selectedTool !== 'TYPE' && textCreated.current) {
            // Since Fabric v6, text:editing:exited fires before this mouse:down event handler
            // so the normal case is handled there
            // this covers edge cases where that event fails to fire, or when selectedTool already changed
            textCreated.current = false;

            // Only allow one i-text to be created per selection of TEXT mode
            // Second click in non-text area will exit to SELECT mode
          } else if (
            !isOverText.current &&
            scribing.selectedTool === 'TYPE' &&
            !textCreated.current
          ) {
            const text = new IText('', {
              fontFamily: scribing.fontFamily,
              fontSize: scribing.fontSize,
              fill: scribing.colors.TYPE,
              left: mouseCanvasDragStartPoint.current.x,
              top: mouseCanvasDragStartPoint.current.y,
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
            canvas.add(text);
            canvas.setActiveObject(text);
            text.enterEditing();
            canvas.renderAll();
            textCreated.current = true;
          }
        }
      },
    );

    const onMouseMoveCanvas = withCanvas(
      (
        canvas,
        scribing,
        options: TPointerEventInfo & { isForced?: boolean },
      ): void => {
        const dragPointer = getCanvasPoint(canvas, options.e);

        // Do moving action
        const tryMove = (left: number, top: number): void => {
          // limit moving
          const finalLeft = clamp(
            left,
            (canvas.getZoom() * scribing.canvasWidth - canvas.getWidth()) * -1,
            0,
          );
          const finalTop = clamp(
            top,
            (canvas.getZoom() * scribing.canvasHeight - canvas.getHeight()) *
              -1,
            0,
          );

          // apply calculated move transforms
          canvas.setViewportTransform([
            canvas.viewportTransform[0],
            canvas.viewportTransform[1],
            canvas.viewportTransform[2],
            canvas.viewportTransform[3],
            finalLeft,
            finalTop,
          ]);
          canvas.renderAll();
        };

        if (mouseDownFlag.current) {
          if (
            dragPointer &&
            scribing.selectedTool === 'LINE' &&
            !isOverActiveObject.current
          ) {
            line.current?.set({
              x2: clamp(dragPointer.x, 0, canvas.getWidth()),
              y2: clamp(dragPointer.y, 0, canvas.getHeight()),
            });
            canvas.renderAll();
          } else if (
            dragPointer &&
            scribing.selectedTool === 'SHAPE' &&
            !isOverActiveObject.current
          ) {
            switch (scribing.selectedShape) {
              case 'RECT': {
                const dragProps = generateMouseDragProperties(
                  mouseCanvasDragStartPoint.current,
                  dragPointer,
                  canvas.getWidth(),
                  canvas.getHeight(),
                );
                rect.current?.set({
                  left: dragProps.left,
                  top: dragProps.top,
                  width: dragProps.width,
                  height: dragProps.height,
                });
                canvas.renderAll();
                break;
              }
              case 'ELLIPSE': {
                const dragProps = generateMouseDragProperties(
                  mouseCanvasDragStartPoint.current,
                  dragPointer,
                  canvas.getWidth(),
                  canvas.getHeight(),
                );
                ellipse.current?.set({
                  left: dragProps.left,
                  top: dragProps.top,
                  rx: dragProps.width / 2,
                  ry: dragProps.height / 2,
                });
                canvas.renderAll();
                break;
              }
              default: {
                break;
              }
            }
          } else if (scribing.selectedTool === 'MOVE') {
            const mouseCurrentPoint = getMousePoint(options.e);
            const deltaLeft = mouseCurrentPoint.x - mouseStartPoint.current.x;
            const deltaTop = mouseCurrentPoint.y - mouseStartPoint.current.y;
            const newLeft = viewportLeft.current + deltaLeft;
            const newTop = viewportTop.current + deltaTop;
            tryMove(newLeft, newTop);
          }
        } else if (options.isForced) {
          // Facilitates zooming out
          tryMove(canvas.viewportTransform[4], canvas.viewportTransform[5]);
        }
      },
    );

    const onMouseOut = (): void => {
      isOverText.current = false;
    };

    const onMouseOver = (options: TPointerEventInfo): void => {
      if (options.target && options.target instanceof IText) {
        isOverText.current = true;
      }
    };

    const onMouseUpCanvas = withCanvas((canvas, scribing): void => {
      mouseDownFlag.current = false;

      switch (scribing.selectedTool) {
        case 'DRAW': {
          saveScribbles();
          break;
        }
        case 'LINE': {
          if (line.current && line.current.height + line.current.width < 10) {
            canvas.remove(line.current);
            canvas.renderAll();
          } else {
            saveScribbles();
          }
          break;
        }
        case 'SHAPE': {
          if (scribing.selectedShape === 'RECT') {
            if (rect.current && rect.current.height + rect.current.width < 10) {
              canvas.remove(rect.current);
              canvas.renderAll();
            } else {
              saveScribbles();
            }
          } else if (scribing.selectedShape === 'ELLIPSE') {
            if (
              ellipse.current &&
              ellipse.current.height + ellipse.current.width < 10
            ) {
              canvas.remove(ellipse.current);
              canvas.renderAll();
            } else {
              saveScribbles();
            }
          }
          break;
        }
        default:
      }
    });

    const onObjectMovingCanvas = withCanvas(
      (canvas, _scribing, { target }: { target: FabricObject }): void => {
        const object = target;
        const width = object.getBoundingRect().width;
        const height = object.getBoundingRect().height;
        if (width > canvas.width || height > canvas.height) return;

        // Limit movement of objects to only within canvas
        const centerPoint = object.getCenterPoint();
        const offsetX = object.left - centerPoint.x;
        const offsetY = object.top - centerPoint.y;
        object.top = clamp(
          object.top,
          height / 2 + offsetY,
          canvas.height - height / 2 + offsetY,
        );
        object.left = clamp(
          object.left,
          width / 2 + offsetX,
          canvas.width - width / 2 + offsetX,
        );

        object.setCoords();
      },
    );

    const onTextChanged = withCanvas(
      (canvas, scribing, options: { target: IText }): void => {
        if (options.target.text.trim() === '') {
          canvas.remove(options.target);
        }
        textCreated.current = false;
        saveScribbles();
        // Eagerly update the ref so the mouse:down handler sees the correct selectedTool immediately.
        scribingRef.current = { ...scribing, selectedTool: 'SELECT' };
        dispatch(
          scribingActions.setToolSelected({ answerId, selectedTool: 'SELECT' }),
        );
        dispatch(
          scribingActions.setCanvasCursor({ answerId, cursor: 'default' }),
        );
      },
    );

    const initializeScribblesAndBackground = async (
      canvas: Canvas,
      scribing: ScribingAnswerState,
    ): Promise<void> => {
      const {
        answer: { scribbles, user_id: userId },
      } = scribing;

      isScribblesLoaded.current = false;
      let userScribble: FabricObject[] = [];

      if (scribbles) {
        layers.current = (
          await Promise.all(
            scribbles.map(async (scribble) => {
              const fabricObjs = await getFabricObjectsFromJson(
                canvas,
                scribble.content,
              );

              // Create layer for each user's scribble
              // Scribbles in layers have selection disabled
              if (scribble.creator_id !== userId) {
                if (!fabricObjs) return undefined;

                const scribbleGroup = new Group(fabricObjs);
                scribbleGroup.selectable = false;

                // Populate layers list
                const newScribble: ScribingLayer = {
                  ...scribble,
                  isDisplayed: true,
                  scribbleGroup,
                  creator_id: scribble.creator_id,
                  creator_name: scribble.creator_name,
                };
                canvas.add(scribbleGroup);
                return newScribble;
              }
              // Add other user's layers first to avoid blocking of user's layer
              userScribble = fabricObjs ?? [];
              return undefined;
            }),
          )
        ).filter((layer): layer is ScribingLayer => Boolean(layer));

        // Layer for current user's scribble
        // Enables scribble selection
        userScribble.forEach((obj) => {
          // Don't allow scaling of text object
          if (obj instanceof IText) {
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
          canvas.add(obj);
        });
      }
      canvas.renderAll();
      isScribblesLoaded.current = true;
      saveScribbles(); // Add initial state as index 0 is states history
    };

    useEffect(() => {
      const scribing = scribingRef.current;
      if (!scribing) return (): void => {};

      // Old component's initializeCanvas
      const image = new Image();
      image.src = scribing.answer.image_url;

      image.onload = async (): Promise<void> => {
        // Get the calculated width of canvas, 800 is min width for scribing toolbar
        const maxWidth = 800;

        const width = Math.min(image.width, maxWidth);
        const scale = Math.min(width / image.width, 1);
        const height = scale * image.height;

        if (canvasRef.current) {
          pendingDispose.current =
            pendingDispose.current ?? canvasRef.current.dispose();
        }
        if (pendingDispose.current) {
          await pendingDispose.current;
        }

        const canvas = new Canvas(`canvas-${answerId}`, {
          width,
          height,
          preserveObjectStacking: true,
          renderOnAddRemove: false,
          objectCaching: false,
          statefullCache: false,
          noScaleCache: true,
          needsItsOwnCache: false,
          selectionColor: 'transparent',
          backgroundColor: 'white',
        });
        canvasRef.current = canvas;

        dispatch(
          scribingActions.setCanvasProperties({
            answerId,
            canvasWidth: width,
            canvasHeight: height,
            canvasMaxWidth: maxWidth,
          }),
        );

        const fabricImage = new FabricImage(image, {
          opacity: 1,
          scaleX: scale,
          scaleY: scale,
          left: width / 2,
          top: height / 2,
        });
        canvas.backgroundImage = fabricImage;

        await initializeScribblesAndBackground(canvas, scribing);

        const notifySelectionListeners = (): void => {
          selectionListeners.current.forEach((cb) => cb());
        };

        canvas.on('mouse:down', onMouseDownCanvas);
        canvas.on('mouse:move', onMouseMoveCanvas);
        canvas.on('mouse:up', onMouseUpCanvas);
        canvas.on('mouse:over', onMouseOver);
        canvas.on('mouse:out', onMouseOut);
        canvas.on('object:moving', onObjectMovingCanvas);
        canvas.on('object:modified', saveScribbles);
        canvas.on('object:removed', saveScribbles);
        canvas.on('text:editing:exited', onTextChanged);
        canvas.on('selection:created', notifySelectionListeners);
        canvas.on('selection:updated', notifySelectionListeners);
        canvas.on('selection:cleared', notifySelectionListeners);

        const container = containerRef.current;
        // Fabric wraps the <canvas> in a div — that's the first child
        if (container && Boolean(container.firstElementChild)) {
          // equivalent of scaleCanvas from the old component
          // Set initial zoom to fit canvas to container, rounded to 1 decimal place

          const initialZoom =
            Math.floor((container.getBoundingClientRect().width * 10) / width) /
            10;

          canvas.setDimensions(
            {
              width: width * initialZoom,
              height: height * initialZoom,
            },
            { cssOnly: true },
          );
          dispatch(
            scribingActions.setCanvasZoom({
              answerId,
              canvasZoom: initialZoom,
            }),
          );
        }
        dispatch(
          scribingActions.setCanvasLoaded({
            answerId,
            loaded: Boolean(canvas),
          }),
        );
      };

      return (): void => {
        pendingDispose.current = canvasRef.current?.dispose();
      };
    }, [answerId, scribingRef.current?.answer.image_url, dispatch]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return undefined;

      container.tabIndex = 1000;
      container.addEventListener('keydown', onKeyDown, false);

      return (): void => {
        container.removeEventListener('keydown', onKeyDown, false);
      };
    }, [answerId]);

    // Old component's shouldComponentUpdate logic
    useEffect(
      withCanvas((canvas, scribing) => {
        canvas.isDrawingMode = scribing.isDrawingMode;
        if (!canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush = new PencilBrush(canvas);
        }
        canvas.freeDrawingBrush.color = scribing.colors.DRAW;
        canvas.freeDrawingBrush.width = scribing.thickness.DRAW;
      }),
      [
        scribingState[answerId]?.isDrawingMode,
        scribingState[answerId]?.colors,
        scribingState[answerId]?.thickness,
      ],
    );

    useEffect(
      withCanvas((canvas, scribing) => {
        canvas.defaultCursor = scribing.cursor;
        cursor.current = scribing.cursor;
      }),
      [scribingState[answerId]?.cursor],
    );

    useEffect(
      withCanvas((canvas, scribing) => {
        const container = containerRef.current;
        let zoomRatio = scribing.canvasZoom;
        if (container && Boolean(container.firstElementChild)) {
          const scaleRatio = Math.min(
            scribing.canvasZoom,
            container.getBoundingClientRect().width / scribing.canvasWidth,
          );

          canvas.setDimensions(
            {
              width: scribing.canvasWidth * scaleRatio,
              height: scribing.canvasHeight * scaleRatio,
            },
            { cssOnly: true },
          );

          zoomRatio = scribing.canvasZoom / scaleRatio;
        }
        canvas.zoomToPoint(new Point(0, 0), zoomRatio);
        canvas.fire('mouse:move', {
          isForced: true,
        } as unknown as TPointerEventInfo);
      }),
      [scribingState[answerId]?.canvasZoom],
    );

    useEffect(
      withCanvas((canvas, scribing) => {
        if (!scribing.isEnableObjectSelection) return;
        // Objects are selectable in Type tool, dont have to enableObjectSelection again
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject instanceof IText) {
          activeObject.exitEditing();
        } else {
          enableObjectSelection(canvas);
        }
        dispatch(scribingActions.resetEnableObjectSelection({ answerId }));
      }),
      [scribingState[answerId]?.isEnableObjectSelection],
    );

    useEffect(
      withCanvas((canvas, scribing) => {
        if (!scribing.isChangeTool) return;
        // Discard prior active object/group when using other tools
        const isNonDrawingTool =
          scribing.selectedTool !== 'TYPE' &&
          scribing.selectedTool !== 'DRAW' &&
          scribing.selectedTool !== 'LINE' &&
          scribing.selectedTool !== 'SHAPE';
        if (isNonDrawingTool) {
          canvas.discardActiveObject();
        }
        canvas.renderAll();
        dispatch(scribingActions.resetChangeTool({ answerId }));
      }),
      [scribingState[answerId]?.isChangeTool],
    );

    useEffect(
      withCanvas((_canvas, scribing) => {
        if (!scribing.isDisableObjectSelection) return;
        disableObjectSelection(_canvas);
        dispatch(scribingActions.resetDisableObjectSelection({ answerId }));
      }),
      [scribingState[answerId]?.isDisableObjectSelection],
    );

    useEffect(
      withCanvas((canvas, scribing) => {
        if (!scribing.isCanvasDirty) return;
        canvas.renderAll();
        dispatch(scribingActions.resetCanvasDirty({ answerId }));
      }),
      [scribingState[answerId]?.isCanvasDirty],
    );

    useEffect(
      withCanvas((_canvas, scribing) => {
        if (!scribing.isCanvasSave) return;
        saveScribbles();
        dispatch(scribingActions.resetCanvasSave({ answerId }));
      }),
      [scribingState[answerId]?.isCanvasSave],
    );

    useEffect(
      withCanvas((canvas, scribing) => {
        if (!scribing.isUndo) return;
        undo(canvas, scribing);
        dispatch(scribingActions.resetUndo({ answerId }));
      }),
      [scribingState[answerId]?.isUndo],
    );

    useEffect(
      withCanvas((canvas, scribing) => {
        if (!scribing.isRedo) return;
        redo(canvas, scribing);
        dispatch(scribingActions.resetRedo({ answerId }));
      }),
      [scribingState[answerId]?.isRedo],
    );

    useEffect(
      withCanvas((canvas, scribing) => {
        if (!scribing.isDelete) return;
        deleteActiveObjects(canvas);
        dispatch(scribingActions.resetCanvasDelete({ answerId }));
      }),
      [scribingState[answerId]?.isDelete],
    );

    if (!scribingState[answerId] || !scribingRef.current) {
      return null;
    }

    return (
      <div
        ref={containerRef}
        className="flex justify-center-safe bg-neutral-300 m-0 w-full outline-none items-center"
        style={{ minWidth: 800 }}
      >
        {!scribingState[answerId]?.isCanvasLoaded ? <LoadingIndicator /> : null}
        <canvas
          ref={htmlCanvasRef}
          data-testid={`canvas-${answerId}`}
          id={`canvas-${answerId}`}
          style={styles.canvas}
        />
      </div>
    );
  },
);

ScribingCanvas.displayName = 'ScribingCanvas';

export default ScribingCanvas;
