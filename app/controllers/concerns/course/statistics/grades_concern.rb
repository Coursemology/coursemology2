# frozen_string_literal: true
module Course::Statistics::GradesConcern
  include Course::Statistics::StatisticsConcern

  private

  def grade_statistics_hash
    grades_hash = @all_submissions_info.
                  to_a.
                  reject { |submission| submission['workflow_state'] == 'attempting' }.
                  map { |submission| [submission['assessment_id'], submission['grade'].to_f] }.
                  group_by { |assessment_id, _| assessment_id }.
                  transform_values { |pairs| pairs.map { |_, grade| grade } }

    average_and_stdev_each_assessment(grades_hash)
  end

  def max_grade_statistics_hash
    max_grades = Course::Assessment.find_by_sql(<<-SQL.squish
      SELECT
        assessment_id,
        SUM(maximum_grade) AS maximum_grade
      FROM (
        SELECT cqa.assessment_id, caq.maximum_grade
        FROM course_assessment_questions caq
        JOIN course_question_assessments cqa
        ON caq.id = cqa.question_id
        WHERE cqa.assessment_id IN (#{@assessments.pluck(:id).join(', ')})
      ) assessment_grade_table
      GROUP BY assessment_id
    SQL
                                               )

    max_grades.map { |mg| [mg.assessment_id, mg.maximum_grade] }.to_h
  end
end
