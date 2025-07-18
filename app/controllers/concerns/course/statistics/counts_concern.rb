# frozen_string_literal: true
module Course::Statistics::CountsConcern
  include Course::Statistics::ReferenceTimesConcern

  private

  def num_attempted_students_hash
    attempted_submissions_count = ActiveRecord::Base.connection.execute("
      SELECT cas.assessment_id AS id, COUNT(DISTINCT cas.creator_id) AS count
      FROM course_assessment_submissions cas
      JOIN course_assessment_answers caa
      ON cas.id = caa.submission_id
      WHERE
        cas.creator_id IN (#{@all_students.map(&:user_id).join(', ')})
        AND cas.assessment_id IN (#{@assessments.pluck(:id).join(', ')})
        AND caa.current_answer = TRUE
      GROUP BY cas.assessment_id
                                                                       ")

    attempted_submissions_count.to_h { |assessment| [assessment['id'], assessment['count']] }
  end

  def num_submitted_students_hash
    submitted_submissions_count = ActiveRecord::Base.connection.execute("
      SELECT cas.assessment_id AS id, COUNT(DISTINCT cas.creator_id) AS count
      FROM course_assessment_submissions cas
      JOIN course_assessment_answers caa
      ON cas.id = caa.submission_id
      WHERE
        cas.creator_id IN (#{@all_students.map(&:user_id).join(', ')})
        AND cas.assessment_id IN (#{@assessments.pluck(:id).join(', ')})
        AND cas.workflow_state != 'attempting'
        AND caa.current_answer = TRUE
      GROUP BY cas.assessment_id
                                                                       ")

    submitted_submissions_count.to_h { |assessment| [assessment['id'], assessment['count']] }
  end

  def num_late_students_hash
    @personal_end_at_hash = personal_end_at_hash(@assessments.pluck(:id), current_course.id)
    @reference_times_hash = reference_times_hash(@assessments.pluck(:id), current_course.id)
    all_submissions = ActiveRecord::Base.connection.execute("
      SELECT cu.id AS course_user_id, cas.assessment_id, MAX(cas.submitted_at) as submitted_at
      FROM course_assessment_submissions cas
      JOIN course_users cu
      ON cu.user_id = cas.creator_id
      WHERE
        cas.creator_id IN (#{@all_students.map(&:user_id).join(', ')})
        AND cas.assessment_id IN (#{@assessments.pluck(:id).join(', ')})
        AND cu.course_id = #{current_course.id}
      GROUP BY cu.id, cas.assessment_id
                                                           ")

    not_late_submission_hash(@assessments, not_late_count(all_submissions))
  end

  def latest_submission_time_hash
    latest_submissions = ActiveRecord::Base.connection.execute("
      SELECT cas.assessment_id AS id, MAX(cas.submitted_at) AS latest_submitted_at
      FROM course_assessment_submissions cas
      WHERE
        cas.creator_id IN (#{@all_students.map(&:user_id).join(', ')})
        AND cas.assessment_id IN (#{@assessments.pluck(:id).join(', ')})
        AND cas.workflow_state != 'attempting'
        AND cas.submitted_at IS NOT NULL
      GROUP BY cas.assessment_id
                                                        ")

    latest_submissions.to_h { |submission| [submission['id'], submission['latest_submitted_at']] }
  end

  def not_late_hash(submissions)
    current_time = Time.now

    submissions.map do |s|
      personal_end_at = @personal_end_at_hash[[s['assessment_id'], s['course_user_id']]]
      reference_end_at = @reference_times_hash[s['assessment_id']]
      end_at = personal_end_at || reference_end_at

      if end_at
        is_not_late = s['submitted_at'].nil? ? end_at >= current_time : s['submitted_at'] <= end_at
        [[s['assessment_id'], s['course_user_id']], is_not_late]
      else
        [[s['assessment_id'], s['course_user_id']], true]
      end
    end.compact.to_h
  end

  def not_late_count(submissions)
    not_late_hash(submissions).each_with_object(Hash.new(0)) do |value, counts|
      (assessment_id,), is_not_late = value
      counts[assessment_id] += 1 if is_not_late
    end
  end

  def not_late_submission_hash(assessments, not_late_count)
    assessments.each_with_object({}) do |assessment, counts|
      num_late_student = not_late_count[assessment.id] ? @all_students.length - not_late_count[assessment.id] : 0
      counts[assessment.id] = @reference_times_hash[assessment.id] ? num_late_student : 0
    end
  end
end
