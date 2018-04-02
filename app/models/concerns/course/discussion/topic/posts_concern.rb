# frozen_string_literal: true
module Course::Discussion::Topic::PostsConcern
  extend ActiveSupport::Concern
  include Course::Discussion::Post::OrderingConcern

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
