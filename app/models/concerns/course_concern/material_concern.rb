# frozen_string_literal: true
module CourseConcern::MaterialConcern
  extend ActiveSupport::Concern
  include CourseConcern::Material::Folder::OrderingConcern

  # Reloads the association.
  def reload
    remove_instance_variable(:@ordered_topologically) if defined?(@ordered_topologically)
    super
  end

  # Retrieves the topological ordering of the folders associated with this course.
  #
  # Call +reload+ to reset the ordering.
  def ordered_topologically
    @ordered_topologically ||= super
  end
end
