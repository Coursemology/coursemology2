# frozen_string_literal: true

class CreateCourseAssessmentPreviewAttempts < ActiveRecord::Migration[7.2]
  def change
    # id: :serial (int4) deliberately — preview ids are stored in the reused seam column
    # `course_assessment_answers.submission_id`, which is int4 (serial-era table). Match the type
    # rather than mixing a bigint PK into an int4 column; the deferred contract-rename PR can widen both.
    create_table :course_assessment_preview_attempts, id: :serial do |t|
      t.references :assessment,
                   null: false,
                   foreign_key: { to_table: :course_assessments }

      t.string :workflow_state, null: false
      t.datetime :submitted_at
      t.datetime :published_at

      t.references :creator,
                   null: false,
                   foreign_key: { to_table: :users }

      t.references :updater,
                   null: false,
                   foreign_key: { to_table: :users }

      t.bigint :selected_question_bundle_ids,
               array: true,
               null: false,
               default: []

      t.timestamps
    end
  end
end
