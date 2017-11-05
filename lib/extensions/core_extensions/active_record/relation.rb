# frozen_string_literal: true
module Extensions::CoreExtensions::ActiveRecord::Relation
  # Fix for count queries involving calculated attributes
  # To remove if Rails ever fixes this, see rails/rails#15138 and rails/rails#24809
  # https://github.com/aha-app/calculated_attributes#known-issues
  def select_for_count
    :all
  end
end
