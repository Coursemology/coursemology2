class ChangeSurveyTables < ActiveRecord::Migration[4.2]
  def change
    drop_table :course_survey_answer_text_responses do |t|
      t.text :text_response
    end

    drop_table(:course_survey_question_text_responses) {}

    add_column :course_survey_questions, :required, :bool, null: false, default: false
    add_column :course_survey_questions, :question_type, :integer, null: false, default: 0
    add_column :course_survey_questions, :weight, :integer, null: false
    add_column :course_survey_questions, :max_options, :integer
    add_column :course_survey_questions, :min_options, :integer
    change_table :course_survey_questions do |t|
      t.remove_actable index: { unique: true, name: :index_course_survey_questions_actable }
    end

    add_column :course_survey_answers, :text_response, :text
    change_table :course_survey_answers do |t|
      t.remove_actable index: { unique: true, name: :index_course_survey_answers_actable }
    end

    create_table :course_survey_question_options do |t|
      t.references :question, null: false, foreign_key: { references: :course_survey_questions }
      t.text :option
      t.text :image
      t.integer :weight, null: false
    end

    create_table :course_survey_answer_options do |t|
      t.references :answer, null: false, foreign_key: { references: :course_survey_answers }
      t.references :question_option, null: false,
                                     foreign_key: { references: :course_survey_question_options }
    end

    create_table :course_survey_sections do |t|
      t.references :survey, null: false, foreign_key: { references: :course_surveys }
      t.string :title, null: false
      t.text :description
      t.integer :weight, null: false
    end
  end
end
