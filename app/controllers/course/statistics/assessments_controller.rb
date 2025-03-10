# frozen_string_literal: true
class Course::Statistics::AssessmentsController < Course::Statistics::Controller
  include Course::UsersHelper
  include Course::Statistics::SubmissionsConcern
  include Course::Statistics::UsersConcern
  include Course::Statistics::LiveFeedbackConcern

  def main_statistics
    @assessment = Course::Assessment.where(id: assessment_params[:id]).
                  calculated(:maximum_grade, :question_count).
                  includes(programming_questions: [:language]).
                  preload(course: :course_users).first
    submissions = Course::Assessment::Submission.where(assessment_id: assessment_params[:id]).
                  calculated(:grade, :grader_ids).
                  preload(creator: :course_users)
    @course_users_hash = preload_course_users_hash(@assessment.course)

    load_course_user_students_info
    load_ordered_questions
    fetch_all_ancestor_assessments
    create_question_related_hash

    @assessment_autograded = @question_hash.any? { |_, (_, _, auto_gradable)| auto_gradable }
    @student_submissions_hash = fetch_hash_for_main_assessment(submissions, @all_students)
  end

  def ancestor_statistics
    @assessment = Course::Assessment.where(id: assessment_params[:id]).
                  calculated(:maximum_grade).
                  preload(lesson_plan_item: [:reference_times, personal_times: :course_user],
                          course: :course_users).first
    authorize!(:read_ancestor, @assessment)
    submissions = Course::Assessment::Submission.preload(creator: :course_users).
                  where(assessment_id: assessment_params[:id]).
                  calculated(:grade)

    @all_students = @assessment.course.course_users.students
    @student_submissions_hash = fetch_hash_for_ancestor_assessment(submissions, @all_students).compact
  end

  def live_feedback_statistics
    @assessment = Course::Assessment.where(id: assessment_params[:id]).
                  calculated(:question_count).
                  preload(:questions, course: :course_users).first
    @submissions = Course::Assessment::Submission.where(assessment_id: assessment_params[:id]).
                   preload(creator: :course_users)

    create_submission_question_hash(@assessment.questions)

    @course_users_hash = preload_course_users_hash(@assessment.course)

    load_course_user_students_info
    load_ordered_questions

    create_student_live_feedback_hash
  end

  def live_feedback_history
    user = current_course.course_users.find_by(id: params[:course_user_id]).user
    @submissions = Course::Assessment::Submission.where(assessment_id: assessment_params[:id], creator: user)
    @question = Course::Assessment::Question.find(params[:question_id])

    create_submission_question_hash([@question])

    @messages = Course::Assessment::LiveFeedback::Message.
                joins(:thread).
                where(live_feedback_threads: { submission_question_id: @submission_question_hash.keys }).
                includes(message_files: :file).
                order(:created_at)
  end

  private

  def load_ordered_questions
    @ordered_questions = create_question_order_hash.keys.sort_by { |question_id| @question_order_hash[question_id] }
  end

  def assessment_params
    params.permit(:id)
  end

  def load_course_user_students_info
    @all_students = current_course.course_users.students.includes(user: :emails)
    @group_names_hash = group_names_hash
  end

  def fetch_all_ancestor_assessments
    current_assessment = Course::Assessment.preload(:duplication_traceable).find(assessment_params[:id])
    @ancestors = [current_assessment]
    while current_assessment.duplication_traceable.present? &&
          current_assessment.duplication_traceable.source_id.present?
      current_assessment = current_assessment.duplication_traceable.source
      break unless can?(:read_ancestor, current_assessment)

      @ancestors.unshift(current_assessment)
    end
  end

  def create_question_related_hash
    create_question_order_hash
    @question_hash = @assessment.questions.to_h do |q|
      [q.id, [q.maximum_grade, q.question_type, q.auto_gradable?]]
    end
  end

  def create_student_live_feedback_hash
    live_feedback_chats = Course::Assessment::LiveFeedback::Thread.
                          where(submission_question_id: @submission_question_hash.keys).
                          preload(:messages)

    @student_live_feedback_hash = fetch_hash_for_live_feedback_assessment(@submissions,
                                                                          live_feedback_chats)
  end

  def create_question_order_hash
    @question_order_hash = @assessment.question_assessments.to_h do |q|
      [q.question_id, q.weight]
    end
  end

  def create_submission_question_hash(questions)
    @submission_question_hash = Course::Assessment::SubmissionQuestion.
                                where(submission_id: @submissions,
                                      question_id: questions).to_h do |sq|
      [sq.id, sq]
    end
  end
end
