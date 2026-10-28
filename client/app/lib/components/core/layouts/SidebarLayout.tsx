import { ComponentRef, ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import ShowSidebarButton from 'lib/components/navigation/sidebar/ShowSidebarButton';
import SidebarContainer from 'lib/components/navigation/sidebar/SidebarContainer';

import Footer from './Footer';

interface SidebarLayoutProps {
  /** The sidebar's contents. Without them, the layout has no sidebar. */
  sidebar?: ReactNode;
  /**
   * Renders the bar above the page. `showSidebarButton` brings back a minimised sidebar; it is null while the sidebar
   * is shown, and always without one.
   */
  topBar: (showSidebarButton: ReactNode) => ReactNode;
  children: ReactNode;
}

/**
 * A full-height row: an optional sidebar beside a column holding the top bar, the page and the footer. The column is
 * what scrolls, not the window, so the sidebar never moves, and it returns to the top on navigation.
 */
const SidebarLayout = (props: SidebarLayoutProps): JSX.Element => {
  const { sidebar, topBar, children } = props;

  const location = useLocation();

  const sidebarRef = useRef<ComponentRef<typeof SidebarContainer>>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ behavior: 'smooth', top: 0 });
  }, [location.pathname]);

  return (
    <main className="flex h-full min-h-0 w-full">
      {sidebar && (
        <SidebarContainer
          ref={sidebarRef}
          className="flex w-full max-w-[20rem] flex-col bg-neutral-100 border-only-r-neutral-200"
          onChangeVisibility={setSidebarOpen}
        >
          {sidebar}
        </SidebarContainer>
      )}

      <div
        ref={scrollRef}
        className="flex min-h-full w-full flex-col overflow-auto"
      >
        {/* `shrink-0`: once the page outgrows this column, flex would otherwise squeeze the bar down to its tallest
            child, moving its contents up. */}
        <div className="shrink-0">
          {topBar(
            sidebar && !sidebarOpen ? (
              <ShowSidebarButton
                onClick={(): void => sidebarRef.current?.show()}
              />
            ) : null,
          )}
        </div>

        {/* Beside a sidebar, the top bar is 4.5rem to sit level with the sidebar's brand row, but pages start 4rem
            down: they overlap the bar's last 0.5rem, which only holds its vertical padding. Without a sidebar, pages
            (including full-screen ones sized as `100vh - 4.5rem`) start below the whole bar. */}
        <div className={`flex-grow ${sidebar ? '-mt-2' : ''}`}>{children}</div>

        <Footer />
      </div>
    </main>
  );
};

export default SidebarLayout;
