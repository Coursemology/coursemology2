# frozen_string_literal: true
class Course::Statistics::AssessmentsController < Course::Statistics::Controller
  def assessment
    @assessment = Course::Assessment.where(id: assessment_params[:id]).
                  calculated(:maximum_grade).
                  preload(lesson_plan_item: [:reference_times, personal_times: :course_user],
                          course: :course_users).first
    authorize!(:read_ancestor, @assessment)
    submissions = Course::Assessment::Submission.preload(creator: :course_users).
                  where(assessment_id: assessment_params[:id]).
                  calculated(:grade)
    @submission_records = compute_submission_records(submissions)
    @all_students = @assessment.course.course_users.students
  end

  def ancestors
    @assessment = Course::Assessment.preload(:duplication_traceable).find(assessment_params[:id])
    @assessments = [@assessment]
    while @assessment.duplication_traceable.present? && @assessment.duplication_traceable.source_id.present?
      @assessment = @assessment.duplication_traceable.source
      break unless can?(:read_ancestor, @assessment)

      @assessments << @assessment
    end
  end

  private

  def assessment_params
    params.permit(:id)
  end

  def compute_submission_records(submissions)
    submissions.map do |submission|
      submitter_course_user = submission.creator.course_users.select { |u| u.course_id == @assessment.course_id }.first
      next unless submitter_course_user&.student?

      end_at = @assessment.lesson_plan_item.time_for(submitter_course_user).end_at
      grade = submission.grade
      [submitter_course_user, submission.workflow_state, submission.submitted_at, end_at, grade]
    end.compact
  end
end
