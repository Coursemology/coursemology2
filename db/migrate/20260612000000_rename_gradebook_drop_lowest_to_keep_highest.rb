# frozen_string_literal: true
class RenameGradebookDropLowestToKeepHighest < ActiveRecord::Migration[7.2]
  def change
    rename_column :course_assessment_tabs, :gradebook_drop_lowest, :gradebook_keep_highest
  end
end
