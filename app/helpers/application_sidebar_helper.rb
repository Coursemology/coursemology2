# frozen_string_literal: true
# Helpers for displaying sidebars in pages.
module ApplicationSidebarHelper
  # Checks if the current page has a sidebar.
  #
  # @return [Boolean] True if there is a sidebar for the current page.
  def sidebar?
    content_for?(:layout_sidebar)
  end

  # Sets the current page to have a sidebar.
  #
  # The view must still render the sidebar in its content area.
  def sidebar!
    content_for(:layout_sidebar) do
      'true'
    end
  end

  # Defines the sidebar for the current page.
  #
  # @param [Array<String>] classes An array of classes to apply to the sidebar container.
  # @return [String] The buffer containing the markup for the sidebar.
  def sidebar(classes: ['col-lg-2', 'col-md-3', 'col-sm-4'], &block)
    sidebar!

    render layout: 'layouts/sidebar', locals: { sidebar_classes: classes }, &block
  end

  # Display the given sidebar items.
  #
  # @param [Array] items An array of sidebar items to be displayed.
  # @param [Array<String>] classes An array of classes to apply to the sidebar items container.
  # @return [String] The HTML string which will display the sidebar items.
  def sidebar_items(items, classes: ['nav', 'nav-pills', 'nav-stacked'])
    sidebar!

    links = items.map { |item| link_to_sidebar_item(item) }
    content_tag(:ul, class: classes) do
      links.map { |link| concat(content_tag(:li, link)) }
    end
  end

  # Generates the link to the given sidebar item.
  #
  # @param item The sidebar item.
  # @return [String] The HTML string which will display the link.
  def link_to_sidebar_item(item)
    link_to(item[:path]) do
      concat(
        content_tag(:span, class: ['nav-icons']) do
          fa_icon item[:icon]
        end
      )
      concat(item[:title])
      concat(
        content_tag(:span, class: ['unread']) do
          badge(item[:unread]) if item[:unread] && item[:unread] > 0
        end
      )
    end
  end
end
