# frozen_string_literal: true
class AddIsModelConfigurationAuthorizedToCourses < ActiveRecord::Migration[8.1]
  # Whether course staff (managers and owners) may configure the AI rubric grading model. Off by default:
  # the settings stay instance/system admin only until an admin opens them up for a specific course.
  def change
    add_column :courses, :is_model_configuration_authorized, :boolean, default: false, null: false
  end
end
