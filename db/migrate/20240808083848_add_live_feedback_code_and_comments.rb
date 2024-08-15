class AddLiveFeedbackCodeAndComments < ActiveRecord::Migration[7.0]
  def change
    create_table :course_assessment_live_feedbacks do |t|
      t.references :assessment, null: false, index: true, foreign_key: { to_table: :course_assessments }
      t.references :question, null: false, index: true, foreign_key: { to_table: :course_assessment_questions }
      t.references :creator, null: false, index: true, foreign_key: { to_table: :users }
      t.datetime :created_at, null: false
      t.string :feedback_id
    end

    create_table :course_assessment_live_feedback_code do |t|
      t.references :feedback, null: false, index: true, foreign_key: { to_table: :course_assessment_live_feedbacks }
      t.string :filename, null: false
      t.text :content, null: false
    end

    create_table :course_assessment_live_feedback_comments do |t|
      t.references :code, null: false, index: true, foreign_key: { to_table: :course_assessment_live_feedback_code }
      t.integer :line_number, null: false
      t.text :comment, null: false
    end
  end
end