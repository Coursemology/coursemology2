# frozen_string_literal: true
class CreateAssessments < ActiveRecord::Migration[4.2]
  def change
    create_table :course_assessment_categories do |t|
      t.references :course, null: false
      t.string :title, null: false
      t.integer :weight, null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_assessment_tabs do |t|
      t.references :category, null: false,
                              foreign_key: { references: :course_assessment_categories }
      t.string :title, null: false
      t.integer :weight, null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_assessments do |t|
      t.references :tab, null: false,
                         foreign_key: { references: :course_assessment_tabs }

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_assessment_tag_groups do |t|
      t.string :title, null: false
      t.text :description, null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_assessment_tags do |t|
      t.references :tag_group, foreign_key: { references: :course_assessment_tag_groups }
      t.string :title, null: false
      t.text :description, null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_assessment_questions do |t|
      t.actable index: { unique: true, name: :index_course_assessment_questions_actable }
      t.references :assessment, null: false, foreign_key: { references: :course_assessments }
      t.text :description, null: false

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_assessment_questions_tags do |t|
      t.references :question, foreign_key: { references: :course_assessment_questions },
                              index: { name: :course_assessment_question_tags_question_index }
      t.references :tag, foreign_key: { references: :course_assessment_tags },
                         index: { name: :course_assessment_question_tags_tag_index }
    end

    create_table :course_assessment_submissions do |t|
      t.references :assessment, null: false, foreign_key: { references: :course_assessments }
      t.references :course_user, null: false, foreign_key: { references: :course_users }

      t.userstamps null: false, foreign_key: { references: :users }
      t.timestamps null: false
    end

    create_table :course_assessment_answers do |t|
      t.actable index: { unique: true, name: :index_course_assessment_answers_actable }
      t.references :submission, null: false,
                                foreign_key: { references: :course_assessment_submissions }
      t.references :question, null: false,
                              foreign_key: { references: :course_assessment_questions }
    end
  end
end
