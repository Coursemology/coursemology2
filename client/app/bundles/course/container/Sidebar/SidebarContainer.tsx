import {
  forwardRef,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';

import useMedia from 'lib/hooks/useMedia';

import PinSidebarButton from './PinSidebarButton';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

const GUTTER_WIDTH_PX = 20 as const;

interface FloatingContainerProps extends ContainerProps {
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
}

const FloatingContainer = (props: FloatingContainerProps): JSX.Element => (
  <div
    className={`absolute z-50 h-full p-2 transition-position ${
      props.className ?? ''
    }`}
    onMouseEnter={props.onMouseEnter}
    onMouseLeave={props.onMouseLeave}
  >
    {props.children}
  </div>
);

const AppearOnLeftGutter = (props: ContainerProps): JSX.Element => {
  const [guttered, setGuttered] = useState(true);
  const [inside, setInside] = useState(false);

  useLayoutEffect(() => {
    const body = document.body;

    const watchAndShowSidebar = (e: MouseEvent): void => {
      setGuttered(e.clientX <= GUTTER_WIDTH_PX);
    };

    body.addEventListener('mousemove', watchAndShowSidebar);
    body.addEventListener('mouseleave', watchAndShowSidebar);

    return () => {
      body.removeEventListener('mousemove', watchAndShowSidebar);
      body.removeEventListener('mouseleave', watchAndShowSidebar);
    };
  }, []);

  const appear = guttered || inside;

  return (
    <>
      <FloatingContainer
        className={`top-0 ${appear ? 'left-0' : '-left-full'}`}
        onMouseEnter={(): void => setInside(true)}
        onMouseLeave={(): void => setInside(false)}
      >
        <aside
          className={`rounded-xl border border-solid border-neutral-200 shadow-xl ${
            props.className ?? ''
          }`}
        >
          {props.children}
        </aside>
      </FloatingContainer>

      <div className="flex h-full items-center justify-center px-1 pr-1.5 border-only-r-neutral-100">
        <div
          className={`${
            appear ? 'sidebar-handle-exit' : 'sidebar-handle-enter'
          } h-1/4 max-h-[15rem] w-2 rounded-full bg-neutral-400`}
        />
      </div>
    </>
  );
};

interface ControlledContainerProps extends ContainerProps {
  open?: boolean;
}

const Hoverable = (props: ControlledContainerProps): JSX.Element => {
  const Component = props.open ? 'aside' : AppearOnLeftGutter;

  return <Component className={props.className}>{props.children}</Component>;
};

const Collapsible = (props: ControlledContainerProps): JSX.Element => {
  const smallScreen = useMedia.MinWidth('md');

  if (smallScreen)
    return (
      <FloatingContainer
        className={`max-sm:w-screen max-sm:p-0 ${
          props.open ? 'left-0' : '-left-full'
        }`}
      >
        <aside
          className={`rounded-xl border border-solid border-neutral-200 shadow-xl max-sm:max-w-none max-sm:rounded-none max-sm:border-none ${
            props.className ?? ''
          }`}
        >
          {props.children}
        </aside>
      </FloatingContainer>
    );

  return (
    <aside className={`${props.open ? '' : 'hidden'} ${props.className}`}>
      {props.children}
    </aside>
  );
};

interface SidebarContainerRef {
  show: () => void;
}

interface SidebarContainerProps extends ContainerProps {
  onChangeVisibility?: (visible: boolean) => void;
}

const SidebarContainer = forwardRef<SidebarContainerRef, SidebarContainerProps>(
  (props, ref): JSX.Element => {
    const smallScreen = useMedia.MinWidth('md');
    const mobile = useMedia.PointerCoarse();

    const [pinned, setPinned] = useState<boolean>();
    const [lastState, setLastState] = useState(pinned);

    useEffect(() => {
      props.onChangeVisibility?.(pinned ?? true);
    }, [pinned]);

    useImperativeHandle(ref, () => ({
      show: () =>
        mobile
          ? setPinned((value) => !value)
          : document.body.dispatchEvent(new MouseEvent('mousemove')),
    }));

    useLayoutEffect(() => {
      if (smallScreen) {
        setPinned(false);
        setLastState(pinned ?? true);
      } else {
        setPinned(lastState ?? true);
      }
    }, [smallScreen]);

    const location = useLocation();

    // Minimises the sidebar when a navigation is made. On small screen
    // mobile devices, the sidebar covers majority of the screen.
    useEffect(() => {
      if (!(mobile && smallScreen)) return;

      setPinned(false);
    }, [location.pathname, location.search]);

    const Container = mobile ? Collapsible : Hoverable;

    return (
      <Container
        className={`z-50 h-full shrink-0 ${props.className ?? ''}`}
        open={pinned}
      >
        {props.children}

        {(mobile || !smallScreen) && (
          <section className="border-only-t-neutral-200">
            <PinSidebarButton
              onClick={(): void => setPinned((value) => !value)}
              open={pinned}
            />
          </section>
        )}
      </Container>
    );
  },
);

SidebarContainer.displayName = 'SidebarContainer';

export default SidebarContainer;
