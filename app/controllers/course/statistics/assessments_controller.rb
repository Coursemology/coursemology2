# frozen_string_literal: true
class Course::Statistics::AssessmentsController < Course::Statistics::Controller
  include Course::UsersHelper
  include Course::Statistics::SubmissionsConcern

  before_action :load_course_user_students, except: [:ancestors]

  def assessment
    @assessment = Course::Assessment.where(id: assessment_params[:id]).
                  calculated(:maximum_grade).
                  preload(lesson_plan_item: [:reference_times, personal_times: :course_user],
                          course: :course_users).first
    authorize!(:read_ancestor, @assessment)
    submissions = Course::Assessment::Submission.preload(creator: :course_users).
                  where(assessment_id: assessment_params[:id]).
                  calculated(:grade)

    # we do not need the nil value for this hash, since we aim only
    # to display the statistics charts
    @student_submissions_hash = student_submission_end_time_hash(submissions, @all_students).compact
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

  def marks_per_question
    @assessment = Course::Assessment.where(id: assessment_params[:id]).
                  preload(course: :course_users).first
    submissions = Course::Assessment::Submission.preload(:answers, creator: :course_users).
                  where(assessment_id: assessment_params[:id]).
                  calculated(:grade, :grader_ids)
    @course_users_hash = preload_course_users_hash(current_course)

    create_question_related_hash
    @student_submissions_hash = student_submission_marks_hash(submissions, @all_students)
  end

  private

  def assessment_params
    params.permit(:id)
  end

  def load_course_user_students
    @all_students = current_course.course_users.students
  end

  def create_question_related_hash
    @question_order_hash = @assessment.question_assessments.to_h do |q|
      [q.question_id, q.weight]
    end
    @question_maximum_grade_hash = @assessment.questions.to_h do |q|
      [q.id, q.maximum_grade]
    end
  end
end
