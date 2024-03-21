# frozen_string_literal: true
module Course::Statistics::CountsConcern
  include Course::Statistics::ReferenceTimesConcern

  private

  def num_attempted_students_hash
    attempted_submissions = @all_submissions_info.
                            to_a.
                            map { |submission| submission['assessment_id'] }

    attempted_submissions_count = attempted_submissions.each_with_object(Hash.new(0)) do |assessment_id, counts|
      counts[assessment_id] += 1
    end

    attempted_submissions_count.to_h { |assessment_id, count| [assessment_id, count] }
  end

  def num_submitted_students_hash
    submitted_submissions = @all_submissions_info.
                            to_a.
                            reject { |submission| submission['workflow_state'] == 'attempting' }.
                            map { |submission| submission['assessment_id'] }

    submitted_submissions_count = submitted_submissions.each_with_object(Hash.new(0)) do |assessment_id, counts|
      counts[assessment_id] += 1
    end

    submitted_submissions_count.to_h { |assessment_id, count| [assessment_id, count] }
  end

  def num_late_students_hash
    @personal_end_at_hash = personal_end_at_hash(@assessments.pluck(:id), current_course.id)
    @reference_times_hash = reference_times_hash(@assessments.pluck(:id), current_course.id)

    @submitted_times = @all_submissions_info.
                       to_a.
                       to_h { |s| [[s['creator_id'], s['assessment_id']], s['submitted_at']] }

    late_students_count_in_each_assessment
  end

  def late_students_count_in_each_assessment
    current_time = Time.now

    @assessments.each_with_object({}) do |assessment, counts|
      counts[assessment.id] = late_submissions_count_for_assessment(assessment, current_time)
    end
  end

  def late_submissions_count_for_assessment(assessment, current_time)
    @all_students.count do |student|
      end_at = @personal_end_at_hash[[assessment.id, student.id]] || @reference_times_hash[assessment.id]
      submitted_at = @submitted_times[[student.user_id, assessment.id]]

      end_at && (submitted_at.nil? ? end_at < current_time : submitted_at > end_at)
    end
  end
end
