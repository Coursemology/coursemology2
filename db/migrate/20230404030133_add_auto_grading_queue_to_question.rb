class AddAutoGradingQueueToQuestion < ActiveRecord::Migration[6.0]
  def change
    add_column :course_assessment_questions, :is_low_priority, :boolean, default: false
  end
end
