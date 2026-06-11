# frozen_string_literal: true
class AddGradebookExcludedToCourseAssessments < ActiveRecord::Migration[7.2]
  def change
    add_column :course_assessments, :gradebook_excluded, :boolean, null: false, default: false
  end
end
