# frozen_string_literal: true
class AddSchemaNullity < ActiveRecord::Migration[4.2]
  def change
    change_column_null :course_assessment_questions_tags, :question_id, false
    change_column_null :course_assessment_questions_tags, :tag_id, false

    change_column_null :course_condition_achievements, :achievement_id, false

    change_column_null :course_conditions, :course_id, false

    change_column_null :course_events, :event_type, false
  end
end
