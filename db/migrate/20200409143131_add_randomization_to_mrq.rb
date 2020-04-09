class AddRandomizationToMrq < ActiveRecord::Migration[5.2]
  def change
    add_column :course_assessment_answer_multiple_responses, :random_seed, :numeric, default: nil
    add_column :course_assessment_question_multiple_responses, :randomize_options, :boolean, default: false
    add_column :course_assessment_question_multiple_response_options, :ignore_randomization, :boolean, default: false
  end
end
