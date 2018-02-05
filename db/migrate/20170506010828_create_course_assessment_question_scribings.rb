# frozen_string_literal: true
class CreateCourseAssessmentQuestionScribings < ActiveRecord::Migration[4.2]
  def change # rubocop:disable Metrics/MethodLength
    create_table :course_assessment_question_scribings do |t|
    end

    create_table :course_assessment_answer_scribings do |t|
    end

    create_table :course_assessment_answer_scribing_scribbles do |t|
      t.text :content, limit: 16_777_215
      t.references :answer,
                   index: {
                     name: :fk__course_assessment_answer_scribing_scribbles_scribing_answer
                   },
                   foreign_key: {
                     references: :course_assessment_answer_scribings
                   }
      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    remove_column :course_assessment_answer_scribing_scribbles, :updater_id, :integer
  end
end
