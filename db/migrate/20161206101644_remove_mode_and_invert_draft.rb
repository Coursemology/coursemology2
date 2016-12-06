class RemoveModeAndInvertDraft < ActiveRecord::Migration
  def change
    remove_column :course_assessments, :mode, :integer
  end
end
