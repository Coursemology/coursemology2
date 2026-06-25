# frozen_string_literal: true
# Squashes the original external-assessment migrations (20260615..20260623) into one:
#   - create course_external_assessments / course_external_assessment_grades
#   - create course_gradebook_external_contributions
#   - floor_at_zero / cap_at_maximum bounds
#   - grade columns at decimal(5,2) (Canvas/SoftMark record two decimal places)
class CreateCourseExternalAssessmentTables < ActiveRecord::Migration[7.2]
  def change
    create_table :course_external_assessments do |t|
      t.references :course, null: false,
                            foreign_key: { to_table: :courses,
                                           name: 'fk_course_external_assessments_course_id' },
                            index: { name: 'fk__course_external_assessments_course_id' }
      t.string :title, null: false
      t.decimal :maximum_grade, precision: 5, scale: 2, null: false
      t.boolean :floor_at_zero, null: false, default: true
      t.boolean :cap_at_maximum, null: false, default: true
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
      t.decimal :grade, precision: 5, scale: 2, null: true
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

    # cgec = course_gradebook_external_contributions (abbreviated index/FK names mirror the
    # cgac block; the full name would exceed Postgres' 63-char identifier limit).
    create_table :course_gradebook_external_contributions do |t|
      t.references :course, null: false, foreign_key: { to_table: :courses },
                            index: { name: 'fk__cgec_course_id' }
      t.references :external_assessment, null: false,
                                         foreign_key: { to_table: :course_external_assessments,
                                                        on_delete: :cascade },
                                         index: { unique: true, name: 'index_cgec_on_external_assessment_id' }
      t.decimal :weight, precision: 5, scale: 2, null: false, default: 0

      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__cgec_creator_id' }
      t.references :updater, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__cgec_updater_id' }
      t.timestamps null: false
    end
  end
end
