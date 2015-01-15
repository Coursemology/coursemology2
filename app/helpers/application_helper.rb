# :nodoc:
module ApplicationHelper
  include ApplicationThemingHelper

  # Checks if the current page has a sidebar.
  #
  # @return [Bool] True if there is a sidebar for the current page.
  def has_sidebar?
    content_for?(:layout_sidebar)
  end

  # Sets the current page to have a sidebar.
  #
  # The view must still render the sidebar in its content area.
  def has_sidebar
    content_for(:layout_sidebar) do
      'true'
    end
  end

  # Defines the sidebar for the current page.
  #
  # @param classes [Array<String>] An array of classes to apply to the sidebar container.
  # @return String The buffer containing the markup for the sidebar.
  def sidebar(classes: ['col-xs-7', 'col-sm-3', 'col-md-2'])
    has_sidebar

    render layout: 'layouts/sidebar', locals: { sidebar_classes: classes } do
      yield
    end
  end
end
