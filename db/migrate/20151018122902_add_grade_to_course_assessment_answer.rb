# frozen_string_literal: true
class AddGradeToCourseAssessmentAnswer < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_answers, :grade, :integer
  end
end
