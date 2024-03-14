# frozen_string_literal: true
module Course::Statistics::CountsConcern
  include Course::Statistics::ReferenceTimesConcern

  private

  def num_attempting_students_hash
    attempting_submissions = @submissions.to_a
                                         .select { |submission| submission["workflow_state"] == "attempting" }
                                         .map { |submission| submission["assessment_id"] }

    attempting_submissions.each_with_object(Hash.new(0)) do |assessment_id, counts|
      counts[assessment_id] += 1
    end.to_h { |assessment_id, count| [assessment_id, count] }
  end

  def num_submitted_students_hash
    submitted_submissions = @submissions.to_a
                                        .reject { |submission| submission["workflow_state"] == "attempting" }
                                        .map { |submission| submission["assessment_id"] }

    submitted_submissions.each_with_object(Hash.new(0)) do |assessment_id, counts|
      counts[assessment_id] += 1
    end.to_h { |assessment_id, count| [assessment_id, count] }
  end

  def num_late_students_hash
    @personal_end_at_hash = personal_end_at_hash(@assessments.pluck(:id), current_course.id)
    @reference_times_hash = reference_times_hash(@assessments.pluck(:id), current_course.id)

    current_time = Time.now
    submitted_times = @submissions.to_a
                                  .to_h { |s| [[s["creator_id"], s["assessment_id"]], s["submitted_at"]] }

    late_submission_counts = @assessments.each_with_object({}) do |assessment, counts|
      late_submissions = 0
    
      @all_students.each do |student|
        personal_end_at = @personal_end_at_hash[[assessment.id, student.id]]
        reference_end_at = @reference_times_hash[assessment.id]
        end_at = personal_end_at || reference_end_at

        submitted_at = submitted_times[[student.user_id, assessment.id]]

        if submitted_at && end_at && submitted_at > end_at
          late_submissions += 1
        elsif submitted_at.nil? && end_at && end_at < current_time
          late_submissions += 1
        end
      end
    
      counts[assessment.id] = late_submissions
    end

    late_submission_counts
  end
end