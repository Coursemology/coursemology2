class AddDeletedAtToCourseLearningRateRecords < ActiveRecord::Migration[7.2]
  def change
    add_column :course_learning_rate_records, :deleted_at, :datetime
    add_index :course_learning_rate_records, :deleted_at
  end
end
