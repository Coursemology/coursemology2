# frozen_string_literal: true
class AddDuplicationTraceable < ActiveRecord::Migration[6.0]
  def change
    create_table :duplication_traceables do |t|
      t.actable index: { unique: true, name: :index_duplication_traceables_actable }
      t.integer :source_id

      # For some reason, t.userstamps does not work
      t.references :creator, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__duplication_traceables_creator_id' }
      t.references :updater, null: false, foreign_key: { to_table: :users },
                             index: { name: 'fk__duplication_traceables_updater_id' }
      t.timestamps null: false
    end

    create_table :duplication_traceable_courses do |t|
      t.references :course, null: false, foreign_key: true,
                            index: { name: 'fk__duplication_traceable_courses_course_id' }
    end

    create_table :duplication_traceable_assessments do |t|
      t.references :assessment, null: false, foreign_key: { to_table: :course_assessments },
                                index: { name: 'fk__duplication_traceable_assessments_assessment_id' }
    end
  end
end
