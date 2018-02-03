class AddWeightToCourseAssessmentQuestionMultipleResponseOptions < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_question_multiple_response_options, :weight, :integer
    populate_default_weights
    change_column_null :course_assessment_question_multiple_response_options, :weight, false
  end

  def populate_default_weights
    Course::Assessment::Question::MultipleResponse.includes(:options).find_each do |question|
      options = question.options.sort_by(&:id)
      first_id = options.first.id
      options.each do |option|
        # Start numbering the weights from 1
        option.update_column(:weight, option.id - first_id + 1)
      end
    end
  end
end
