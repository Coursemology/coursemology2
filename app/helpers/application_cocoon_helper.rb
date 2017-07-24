# frozen_string_literal: true
module ApplicationCocoonHelper
  # Shows a link that will allow to dynamically add a new associated object. This is a wrapper of
  # #link_to_add_association
  #
  # @overload link_to_add_association(name, form, options, association, html_options = nil)
  #   Shows a link that will allow to dynamically add a new associated object.
  #
  #   @param [String] name The text to show in the link.
  #   @param [ActionView::Helpers::FormBuilder] form The form builder.
  #   @param [Symbol] association The associated objects, this should be the name of the has_many
  #     relation.
  #   @param [Hash] html_options The html options to be passed to {#link_to}.
  #   @option html_options [String] :find_using The jQuery traversal method to allow node selection
  #     relative to the link. Example values: +this+, +closest+, +next+, +children+, etc.
  #     Default: absolute selection.
  #   @option html_options [String] :selector The jQuery selector to be used with +:find_using+ to
  #     determine where to insert the new node. Default: the parent node.
  #   @option html_options [String] :find_selector The alias of +:selector+, you should use this
  #     when +:find_using+ is not specified. Default: parent node.
  #   @option html_options [String] :insert_using ('before') The jQuery method that inserts the
  #     new data. Example values: +before+, +after+, +append+, +prepend+, etc.
  #   @return [String]
  #   @example Adding items after the link
  #     link_to_add_association(t('.add_option'), f, :options, find_selector: 'this',
  #                                                            insert_using: 'after')
  # @overload link_to_add_association(form, options, association, html_options = nil, &block)
  #   Shows a link that will allow to dynamically add a new associated object. The display of the
  #   link can be changed in the block.
  #
  #   @param [String] name The text to show in the link.
  #   @param [ActionView::Helpers::FormBuilder] form The form builder.
  #   @param [Symbol] association The associated objects, this should be the name of the has_many
  #     relation.
  #   @param [Hash] html_options The html options to be passed to {#link_to}.
  #   @option html_options [String] :find_using The jQuery traversal method to allow node selection
  #     relative to the link. Example values: +this+, +closest+, +next+, +children+, etc.
  #     Default: absolute selection.
  #   @option html_options [String] :selector The jQuery selector to be used with +:find_using+ to
  #     determine where to insert the new node. Default: the parent node.
  #   @option html_options [String] :find_selector The alias of +:selector+, you should use this
  #     when +:find_using+ is not specified.
  #   @option html_options [String] :insert_using ('before') The jQuery method that inserts the
  #     new data. Example values: +before+, +after+, +append+, +prepend+, etc.
  #   @param [Proc] block The block to use for displaying the link.
  #   @return [String]
  def link_to_add_association(name, form, association = nil, html_options = nil, &block)
    name, form, association, html_options = nil, name, form, association if block_given?
    html_options = html_options&.dup || {}
    replace_cocoon_keys(html_options)
    super(*[name, form, association, html_options].compact, &block)
  end

  private

  def replace_cocoon_keys(html_options)
    find_using = html_options.delete(:find_using)
    selector = html_options.delete(:selector) || html_options.delete(:find_selector)
    insert_using = html_options.delete(:insert_using)

    html_options['data-association-insertion-traversal'] = find_using.to_s if find_using
    html_options['data-association-insertion-node'] = selector.to_s if selector
    html_options['data-association-insertion-method'] = insert_using.to_s if insert_using
  end
end
