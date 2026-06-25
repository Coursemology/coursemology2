# frozen_string_literal: true
# External grades are imported from Canvas and SoftMark, both of which record marks
# to two decimal places. The columns were decimal(4,1), which silently rounds an
# imported 87.25 to 87.3 on store. Widen to decimal(5,2) — same 3 integer digits
# (max 999.99), one extra decimal. Externals only; native grades stay decimal(4,1).
class ChangeExternalAssessmentGradePrecisionToTwoDecimals < ActiveRecord::Migration[7.2]
  def up
    change_column :course_external_assessment_grades, :grade,
                  :decimal, precision: 5, scale: 2, null: true
    change_column :course_external_assessments, :maximum_grade,
                  :decimal, precision: 5, scale: 2, null: false
  end

  def down
    change_column :course_external_assessment_grades, :grade,
                  :decimal, precision: 4, scale: 1, null: true
    change_column :course_external_assessments, :maximum_grade,
                  :decimal, precision: 4, scale: 1, null: false
  end
end
