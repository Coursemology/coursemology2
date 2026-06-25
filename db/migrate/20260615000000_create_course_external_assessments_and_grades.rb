# frozen_string_literal: true
class CreateCourseExternalAssessmentsAndGrades < ActiveRecord::Migration[7.2]
  def change
    create_table :course_external_assessments do |t|
      t.references :course, null: false,
                            foreign_key: { to_table: :courses,
                                           name: 'fk_course_external_assessments_course_id' },
                            index: { name: 'fk__course_external_assessments_course_id' }
      t.string :title, null: false
      t.decimal :maximum_grade, precision: 4, scale: 1, null: false
      t.references :creator, null: false,
                             foreign_key: { to_table: :users,
                                            name: 'fk_course_external_assessments_creator_id' },
                             index: { name: 'fk__course_external_assessments_creator_id' }
      t.references :updater, null: false,
                             foreign_key: { to_table: :users,
                                            name: 'fk_course_external_assessments_updater_id' },
                             index: { name: 'fk__course_external_assessments_updater_id' }
      t.timestamps null: false
    end
    add_index :course_external_assessments, [:course_id, :title],
              unique: true, name: 'index_course_external_assessments_on_course_id_and_title'

    create_table :course_external_assessment_grades do |t|
      t.references :external_assessment, null: false,
                                         foreign_key: { to_table: :course_external_assessments,
                                                        name: 'fk_course_external_assessment_grades_' \
                                                              'external_assessment_id' },
                                         index: { name: 'fk__course_external_assessment_grades_external_assessment_id' }
      t.references :course_user, null: false,
                                 foreign_key: { to_table: :course_users,
                                                name: 'fk_course_external_assessment_grades_course_user_id' },
                                 index: { name: 'fk__course_external_assessment_grades_course_user_id' }
      t.decimal :grade, precision: 4, scale: 1, null: true
      t.string :imported_identifier, null: true
      t.references :creator, null: false,
                             foreign_key: { to_table: :users, name: 'fk_course_external_assessment_grades_creator_id' },
                             index: { name: 'fk__course_external_assessment_grades_creator_id' }
      t.references :updater, null: false,
                             foreign_key: { to_table: :users, name: 'fk_course_external_assessment_grades_updater_id' },
                             index: { name: 'fk__course_external_assessment_grades_updater_id' }
      t.timestamps null: false
    end
    add_index :course_external_assessment_grades, [:external_assessment_id, :course_user_id],
              unique: true, name: 'index_course_external_assessment_grades_on_ea_id_and_cu_id'
  end
end
