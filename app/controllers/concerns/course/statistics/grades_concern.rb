# frozen_string_literal: true
module Course::Statistics::GradesConcern
  private

  def grade_statistics_hash
    grades_info = ActiveRecord::Base.connection.execute("
      SELECT ca.assessment_id AS id, AVG(ca.grade) AS avg, STDDEV(ca.grade) AS stdev
      FROM (
        SELECT cas.creator_id, cas.assessment_id, SUM(caa.grade) AS grade
        FROM course_assessment_submissions cas
        JOIN course_assessment_answers caa ON cas.id = caa.submission_id
        WHERE
          cas.creator_id IN (#{@all_students.map(&:user_id).join(', ')})
          AND cas.assessment_id IN (#{@assessments.pluck(:id).join(', ')})
          AND cas.workflow_state != 'attempting' AND caa.current_answer = TRUE
        GROUP BY cas.creator_id, cas.assessment_id
      ) ca
      GROUP BY ca.assessment_id
                                                       ")
    grades_info.to_h { |info| [info['id'], [info['avg'], info['stdev']]] }
  end

  def max_grade_statistics_hash
    max_grades = Course::Assessment.find_by_sql(<<-SQL.squish
      SELECT assessment_id, SUM(maximum_grade) AS maximum_grade
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

    max_grades.to_h { |mg| [mg.assessment_id, mg.maximum_grade] }
  end
end
