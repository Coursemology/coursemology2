class CreateCourseSurveyTables < ActiveRecord::Migration[4.2]
  def change
    create_table :course_surveys do |t|
      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_survey_questions do |t|
      t.actable index: { unique: true, name: :index_course_survey_questions_actable }
      t.references :survey, null: false, foreign_key: { references: :course_surveys }
      t.text :description, null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_survey_question_text_responses do |t|
    end

    create_table :course_survey_responses do |t|
      t.references :survey, null: false, foreign_key: { references: :course_surveys }
      t.datetime :submitted_at

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_survey_answers do |t|
      t.actable index: { unique: true, name: :index_course_survey_answers_actable }
      t.references :question, null: false, foreign_key: { references: :course_survey_questions }
      t.references :response, null: false, foreign_key: { references: :course_survey_responses }

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_survey_answer_text_responses do |t|
      t.text :text_response
    end
  end
end
