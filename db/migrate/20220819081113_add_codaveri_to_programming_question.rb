class AddCodaveriToProgrammingQuestion < ActiveRecord::Migration[6.0]
  def change
    add_column :course_assessment_question_programming, :is_codaveri, :boolean, default: false
    add_column :course_assessment_question_programming, :codaveri_id, :text
    add_column :course_assessment_question_programming, :codaveri_status, :integer
    add_column :course_assessment_question_programming, :codaveri_message, :text
  end
end
