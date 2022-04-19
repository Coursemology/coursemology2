
# frozen_string_literal: true
class AddCourseLearningRateRecords < ActiveRecord::Migration[6.0]
  def change
    create_table :course_learning_rate_records do |t|
      t.references :course_user, null: false, foreign_key: { to_table: :course_users },
                                 index: { name: 'fk__course_learning_rate_records_course_user_id' }
      t.float :learning_rate, null: false
      t.float :effective_min, null: false
      t.float :effective_max, null: false
      t.timestamps null: false
    end
  end
end
