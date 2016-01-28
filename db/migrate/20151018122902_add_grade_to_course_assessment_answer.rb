# frozen_string_literal: true
class AddGradeToCourseAssessmentAnswer < ActiveRecord::Migration
  def change
    add_column :course_assessment_answers, :grade, :integer
  end
end
