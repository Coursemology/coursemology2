# frozen_string_literal: true
module Extensions::CoreExtensions::ActiveRecord::Relation
  # Fix for count queries involving calculated attributes
  # To remove after upgrading to Rails 5
  # https://github.com/aha-app/calculated_attributes#known-issues
  def select_for_count
    :all
  end
end
