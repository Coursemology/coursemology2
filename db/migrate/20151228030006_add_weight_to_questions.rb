class AddWeightToQuestions < ActiveRecord::Migration
  def change
    change_table :course_assessment_questions do |t|
      t.integer :weight, null: false, default: 0
    end
  end
end
