/**
 * Returns the given announcements with its descendents sorted appropriately
 * Announcements are sorted by Sticky followed by which they are sorted by
 * Date both in Descending order
 *
 * @param {Object} announcements
 * @return {Object} The updated announcements
 */
export const sortAnnouncementsBySticky = announcements => announcements.sort((a, b) => {
  const asticky = a.sticky === true ? 1 : 0;
  const bsticky = b.sticky === true ? 1 : 0;
  const stickyOrder = bsticky - asticky;
  const dateOrder = new Date(b.start_at) - new Date(a.start_at);
  return stickyOrder === 0 ? dateOrder : stickyOrder;
});

export default 'sortAnnouncementsBySticky';
