# frozen_string_literal: true
class Course::Statistics::AssessmentsController < Course::Statistics::Controller
  include Course::UsersHelper

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

  def marks_per_question
    authorize!(:read_statistics, current_course)

    @assessment = Course::Assessment.where(id: assessment_params[:id]).
                  preload(course: :course_users).first
    @submissions = Course::Assessment::Submission.preload(:answers, creator: :course_users).
                   where(assessment_id: assessment_params[:id]).
                   calculated(:grade, :grader_ids)
    @course_users = current_course.course_users.students.order_alphabetically

    create_user_id_to_course_user_hash
    create_question_related_hash
    create_student_submissions_hash
  end

  private

  def assessment_params
    params.permit(:id)
  end

  def create_question_related_hash
    @question_order_hash = @assessment.question_assessments.to_h do |q|
      [q.question_id, q.weight]
    end
    @question_maximum_grade_hash = @assessment.questions.to_h do |q|
      [q.id, q.maximum_grade]
    end
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

  def create_user_id_to_course_user_hash
    @user_id_to_course_user_hash = @course_users.to_h do |course_user|
      [course_user.user_id, course_user]
    end
  end

  def create_student_submissions_hash
    # initialisation
    @student_submissions_hash = @course_users.to_h do |course_user|
      [course_user, nil]
    end

    # populate the student submissions hash
    @submissions.map do |submission|
      submitter_course_user = submission.creator.course_users.select { |u| u.course_id == @assessment.course_id }.first
      next unless submitter_course_user&.student?

      answers = submission.answers.
                select(&:current_answer).
                sort_by { |answer| @question_order_hash[answer.question_id] }

      @student_submissions_hash[submitter_course_user] = [submission, answers]
    end
  end
end
