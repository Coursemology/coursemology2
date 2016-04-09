module Course::Discussion::Topic::PostsConcern
  extend ActiveSupport::Concern
  include Course::Discussion::Post::OrderingConcern

  # Builds a new post in this topic.
  #
  # This defaults to set the new post to be a child of the latest post, ordered topologically.
  def build(attributes = {}, &block)
    attributes[:parent] ||= ordered_topologically.last unless attributes.key?(:parent_id)

    super
  end

  # Reloads the association.
  def reload
    remove_instance_variable(:@ordered_topologically) if defined?(@ordered_topologically)
    super
  end

  # Retrieves the topological ordering of the posts associated with this topic.
  #
  # Call +reload+ to reset the ordering.
  def ordered_topologically
    @ordered_topologically ||= super
  end
end
