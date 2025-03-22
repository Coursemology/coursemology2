# frozen_string_literal: true
class Course::Statistics::AssessmentsController < Course::Statistics::Controller # rubocop:disable Metrics/ClassLength
  include Course::UsersHelper
  include Course::Statistics::SubmissionsConcern
  include Course::Statistics::UsersConcern

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
    @assessment = Course::Assessment.unscoped.includes(:questions).
                  find(assessment_params[:id])
    @submissions = Course::Assessment::Submission.unscoped.
                   select(:id, :creator_id, :workflow_state).
                   where(assessment_id: assessment_params[:id])

    create_submission_question_id_hash(@assessment.questions)

    load_course_user_students_info
    load_ordered_questions

    create_student_live_feedback_hash
  end

  def live_feedback_history
    user_id = CourseUser.joins(:user).where(id: params[:course_user_id]).pluck('users.id').first
    @submissions = Course::Assessment::Submission.where(assessment_id: assessment_params[:id], creator_id: user_id)
    @question = Course::Assessment::Question.find(params[:question_id])

    create_submission_question_id_hash([@question])

    @messages = Course::Assessment::LiveFeedback::Message.
                joins(:thread).
                where(live_feedback_threads: { submission_question_id: @submission_question_id_hash.values }).
                includes(message_options: :option, message_files: :file).
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
    count_hash = Course::Assessment::LiveFeedback::Message.joins(:thread).
                 select('live_feedback_threads.submission_creator_id',
                        'live_feedback_threads.submission_question_id').
                 where.not(creator_id: User::SYSTEM_USER_ID).
                 where(live_feedback_threads: {
                   submission_question_id: @submission_question_id_hash.values,
                   submission_creator_id: @all_students.pluck(:user_id)
                 }).
                 group('live_feedback_threads.submission_creator_id',
                       'live_feedback_threads.submission_question_id').count
    submission_hash = @submissions.to_h { |submission| [submission.creator_id, submission] }
    @student_live_feedback_hash = @all_students.to_h do |student|
      submission = submission_hash[student.user_id]
      live_feedback_count = get_live_feedback_count(count_hash, submission)
      [student, [submission, live_feedback_count]]
    end
  end

  def create_question_order_hash
    @question_order_hash = @assessment.question_assessments.to_h do |q|
      [q.question_id, q.weight]
    end
  end

  def create_submission_question_id_hash(questions)
    @submission_question_id_hash = Course::Assessment::SubmissionQuestion.unscoped.
                                   select(:id, :submission_id, :question_id).
                                   where(submission_id: @submissions.pluck(:id),
                                         question_id: questions.pluck(:id)).to_h do |sq|
      [[sq.submission_id, sq.question_id], sq.id]
    end
  end

  def get_live_feedback_count(count_hash, submission)
    @ordered_questions.map do |question_id|
      submission_question_id = @submission_question_id_hash[[submission&.id, question_id]]
      count_hash[[submission&.creator_id, submission_question_id]] || 0
    end
  end
end
