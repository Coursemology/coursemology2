# frozen_string_literal: true
class Course::Statistics::AssessmentsController < Course::Statistics::Controller # rubocop:disable Metrics/ClassLength
  include Course::UsersHelper
  include Course::Statistics::SubmissionsConcern
  include Course::Statistics::UsersConcern

  def main_statistics
    @assessment = Course::Assessment.unscoped.
                  includes(programming_questions: [:language]).
                  calculated(:maximum_grade, :question_count).
                  find(assessment_params[:id])
    submissions = Course::Assessment::Submission.unscoped.
                  where(assessment_id: assessment_params[:id]).
                  calculated(:grade, :grader_ids)
    @course_users_hash = preload_course_users_hash(current_course)

    load_course_user_students_info
    load_ordered_questions
    fetch_all_ancestor_assessments
    create_question_related_hash

    @assessment_autograded = @question_hash.any? { |_, (_, _, auto_gradable)| auto_gradable }
    @student_submissions_hash = fetch_hash_for_main_assessment(submissions, @all_students)
  end

  def ancestor_statistics
    @assessment = Course::Assessment.
                  preload(lesson_plan_item: [:reference_times, personal_times: :course_user]).
                  calculated(:maximum_grade).
                  find(assessment_params[:id])
    authorize!(:read_ancestor, @assessment)
    submissions = Course::Assessment::Submission.unscoped.
                  preload(creator: :course_users).
                  where(assessment_id: assessment_params[:id]).
                  calculated(:grade)
    @course_users_hash = preload_course_users_hash(current_course)

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
    while current_assessment.duplication_traceable&.source_id.present?
      # TODO: To skip over deleted/non-readable ancestors in duplication chain instead of breaking
      # ActiveRecord::RecordNotFound will occur if source course deleted
      begin
        current_assessment = current_assessment.duplication_traceable.source
      rescue ActiveRecord::RecordNotFound
        break
      end
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
    answer_hash = fetch_current_answer_hash
    message_hash = fetch_live_feedback_message_hash
    prompt_hash = calculate_prompt_hash(message_hash)
    submission_hash = @submissions.index_by(&:creator_id)

    @student_live_feedback_hash = @all_students.to_h do |student|
      submission = submission_hash[student.user_id]
      live_feedback_data = build_live_feedback_data(submission, answer_hash, message_hash, prompt_hash)

      [student, [submission, live_feedback_data]]
    end
  end

  def fetch_current_answer_hash
    Course::Assessment::Answer.where(
      submission_id: @submissions.pluck(:id),
      current_answer: true
    ).to_h { |answer| [[answer.submission_id, answer.question_id], answer&.grade&.to_f || 0] }
  end

  def fetch_live_feedback_message_hash
    Course::Assessment::LiveFeedback::Message.
      joins(:thread).
      where(live_feedback_threads: {
        submission_question_id: @submission_question_id_hash.values,
        submission_creator_id: @all_students.pluck(:user_id)
      }).
      where.not(creator_id: User::SYSTEM_USER_ID).
      select('live_feedback_threads.submission_creator_id',
             'live_feedback_threads.submission_question_id',
             'live_feedback_messages.created_at',
             'live_feedback_messages.content').
      order(:created_at).
      group_by do |message|
        [message.submission_creator_id, message.submission_question_id]
      end
  end

  def build_live_feedback_data(submission, answer_hash, message_hash, prompt_hash)
    @ordered_questions.map do |question_id|
      submission_question_id = @submission_question_id_hash[[submission&.id, question_id]]
      key = [submission&.creator_id, submission_question_id]

      prompt_data = prompt_hash[key] || { messages_sent: 0, word_count: 0 }
      messages = message_hash[key] || []
      answer = answer_hash[[submission&.id, question_id]]

      {
        grade: answer,
        grade_diff: calculate_grade_diff(submission, question_id, messages),
        word_count: prompt_data[:word_count],
        messages_sent: prompt_data[:messages_sent]
      }
    end
  end

  def calculate_prompt_hash(message_hash)
    message_hash.transform_values do |messages|
      {
        messages_sent: messages.size,
        word_count: messages.sum { |m| m.content.split(/\s+/).size }
      }
    end
  end

  def calculate_grade_diff(submission, question_id, messages)
    return 0 unless submission && messages.any?

    first_message_time = messages.first.created_at
    last_message_time = messages.last.created_at

    answer_before = fetch_answer_before(submission, question_id, first_message_time)
    answer_after = fetch_answer_after(submission, question_id, last_message_time)

    return 0 unless answer_after && answer_before

    (answer_after.grade.to_f - answer_before.grade.to_f).round(2)
  end

  def fetch_answer_before(submission, question_id, timestamp)
    Course::Assessment::Answer.
      where(submission_id: submission.id, question_id: question_id).
      where('created_at < ?', timestamp).
      order(:created_at).
      last
  end

  def fetch_answer_after(submission, question_id, timestamp)
    Course::Assessment::Answer.
      where(submission_id: submission.id, question_id: question_id).
      where('created_at > ?', timestamp).
      order(:created_at).
      first
  end

  def fetch_messages_for_question(submission_question_id)
    Course::Assessment::LiveFeedback::Message.
      joins(:thread).
      where(live_feedback_threads: { submission_question_id: submission_question_id }).
      order(:created_at)
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
end
