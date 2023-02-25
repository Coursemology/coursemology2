class RenameAndChangeAssessmentIdIntoLessonPlanItemsId < ActiveRecord::Migration[6.0]
  def up
    add_column :duplication_traceable_assessments, :lesson_plan_item_id, :integer

    # assign proper lesson plan items id to each of the assessment id
    exec_query(<<-SQL)
      UPDATE duplication_traceable_assessments AS dta
      SET lesson_plan_item_id = clpi.lesson_plan_item_id
      FROM (
        SELECT dta1.id as id, clpi1.id as lesson_plan_item_id FROM (
          (
            SELECT id, assessment_id 
            FROM duplication_traceable_assessments
          ) AS dta1
          JOIN course_lesson_plan_items AS clpi1
          ON dta1.assessment_id = clpi1.actable_id
        ) 
      ) AS clpi
      WHERE dta.id = clpi.id 
    SQL

    # remove the column assessment_id since it's no longer needed at this point
    remove_column :duplication_traceable_assessments, :assessment_id
    rename_table :duplication_traceable_assessments, :duplication_traceable_lesson_plan_items

    add_foreign_key :duplication_traceable_lesson_plan_items, :course_lesson_plan_items, column: :lesson_plan_item_id, primary_key: :id
  end

  def down
    add_column :duplication_traceable_lesson_plan_items, :assessment_id, :integer

    # assign back the assessment id to each of the rows
    exec_query(<<-SQL)
      UPDATE duplication_traceable_lesson_plan_items AS dtl
      SET assessment_id = clpi.assessment_id
      FROM (
        SELECT dtl1.id as id, clpi1.actable_id AS assessment_id FROM (
          (
            SELECT id, lesson_plan_item_id
            FROM duplication_traceable_lesson_plan_items
          ) as dtl1
          JOIN course_lesson_plan_items AS clpi1
          ON dtl1.lesson_plan_item_id = clpi1.id
        )
      ) AS clpi
      WHERE dtl.id = clpi.id
    SQL
    remove_column :duplication_traceable_lesson_plan_items, :lesson_plan_item_id
    rename_table :duplication_traceable_lesson_plan_items, :duplication_traceable_assessments

    add_foreign_key :duplication_traceable_assessments, :course_assessments, column: :assessment_id, primary_key: :id
  end
end
