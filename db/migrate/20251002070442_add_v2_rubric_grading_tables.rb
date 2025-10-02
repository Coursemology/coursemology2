class AddV2RubricGradingTables < ActiveRecord::Migration[7.2]
  def change
    create_table :course_rubrics do |t|
      t.references :course, null: false,
                   index: {
                     name: :fk__course_rubrics
                   },
                   foreign_key: {
                     to_table: :courses
                   }
      t.datetime :created_at, null: false
    end

    create_table :course_rubric_categories do |t|
      t.references :rubric, null: false,
                   index: {
                     name: :fk__course_rubric_categories
                   },
                   foreign_key: {
                     to_table: :course_rubrics
                   }
      t.text :name, null: false
      t.boolean :is_bonus_category, null: false, default: 0
    end

    create_table :course_rubric_category_criterions do |t|
      t.references :category, null: false,
                   index: {
                     name: :fk__course_rubric_category_criterions
                   },
                   foreign_key: {
                     to_table: :course_rubric_categories
                   }
      t.integer :grade, null: false, default: 0
      t.text :explanation, null: false
    end

    create_table :course_assessment_question_rubrics do |t|
      t.references :question, null: false,
                   index: {
                     name: :fk__course_assessment_question_rubrics_questions
                   },
                   foreign_key: {
                     to_table: :course_assessment_questions
                   }
      t.references :rubric, null: false,
                   index: {
                     name: :fk__course_assessment_question_rubrics_rubrics
                   },
                   foreign_key: {
                     to_table: :course_rubrics
                   }
    end

    create_table :course_rubric_answer_evaluations do |t|
      t.references :answer, null: false,
                   index: {
                     name: :fk__course_rubric_answer_evaluations_answers
                   },
                   foreign_key: {
                     to_table: :course_assessment_answers
                   }
      t.references :rubric, null: false,
                   index: {
                     name: :fk__course_rubric_answer_evaluations_rubrics
                   },
                   foreign_key: {
                     to_table: :course_rubrics
                   }
      t.references :job, type: :uuid,
                         foreign_key: {
                           to_table: :jobs,
                           name: :fk_course_rubric_answer_evaluations_jobs,
                           on_delete: :nullify
                         },
                         index: {
                           name: :fk_course_rubric_answer_evaluations_jobs,
                           unique: true
                         }
    end
    
    create_table :course_rubric_answer_evaluation_category_criterion_selections do |t|
      t.references :answer_evaluation, null: false,
                   index: {
                     name: :fk__course_evaluation_criterion_evaluations
                   },
                   foreign_key: {
                     to_table: :course_rubric_answer_evaluations
                   }
      t.references :category, null: false,
                   index: {
                     name: :fk__course_evaluation_criterion_categories
                   },
                   foreign_key: {
                     to_table: :course_rubric_categories
                   }
      t.references :criterion, null: false,
                   index: {
                     name: :fk__course_evaluation_criterion_criterions
                   },
                   foreign_key: {
                     to_table: :course_rubric_category_criterions
                   }
    end
  end
end
