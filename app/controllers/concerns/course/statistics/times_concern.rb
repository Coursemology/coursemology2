# frozen_string_literal: true
module Course::Statistics::TimesConcern
  private

  def duration_statistics_hash
    return {} if @assessments.empty? || @all_students.empty?

    durations_info = ActiveRecord::Base.connection.execute("
      SELECT ca.assessment_id AS id, AVG(ca.duration) AS avg, STDDEV(ca.duration) AS stdev
      FROM (
        SELECT cas.creator_id, cas.assessment_id,
          EXTRACT(EPOCH FROM cas.submitted_at) - EXTRACT(EPOCH FROM cas.created_at) AS duration
        FROM course_assessment_submissions cas
        INNER JOIN course_assessment_submission_details cad ON cad.attempt_id = cas.id
        WHERE
          cas.creator_id IN (#{@all_students.map(&:user_id).join(', ')})
          AND cas.assessment_id IN (#{@assessments.pluck(:id).join(', ')})
          AND cas.workflow_state != 'attempting'
      ) ca
      GROUP BY ca.assessment_id
                                                          ")

    durations_info.to_h { |info| [info['id'], [info['avg'], info['stdev']]] }
  end
end
