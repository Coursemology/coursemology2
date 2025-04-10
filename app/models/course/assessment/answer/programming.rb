# frozen_string_literal: true
class Course::Assessment::Answer::Programming < ApplicationRecord
  include Course::Assessment::Question::CodaveriQuestionConcern
  # The table name for this model is singular.
  self.table_name = table_name.singularize

  acts_as :answer, class_name: 'Course::Assessment::Answer'

  has_many :files, class_name: 'Course::Assessment::Answer::ProgrammingFile',
                   foreign_key: :answer_id, dependent: :destroy, inverse_of: :answer

  # @!attribute [r] job
  #   This might be null if the job has been cleared.
  belongs_to :codaveri_feedback_job, class_name: 'TrackableJob::Job', inverse_of: nil, optional: true

  accepts_nested_attributes_for :files, allow_destroy: true

  validate :validate_total_file_size

  def to_partial_path
    'course/assessment/answer/programming/programming'
  end

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.class.transaction do
      files.clear
      question.specific.copy_template_files_to(self)
      raise ActiveRecord::Rollback unless save
    end
    acting_as
  end

  MAX_ATTEMPTING_TIMES = 1000
  # Returns the attempting times left for current answer.
  # The max attempting times will be returned if question don't have the limit.
  #
  # @return [Integer]
  def attempting_times_left
    return MAX_ATTEMPTING_TIMES unless question.actable.attempt_limit

    times = question.actable.attempt_limit - submission.evaluated_or_graded_answers(question).size
    times = 0 if times < 0
    times
  end

  # Programming answers should be graded in a job.
  def grade_inline?
    false
  end

  def download(dir)
    files.each do |src_file|
      dst_path = File.join(dir, src_file.filename)
      File.open(dst_path, 'w') do |dst_file|
        dst_file.write(src_file.content)
      end
    end
  end

  def csv_download
    files.first.content
  end

  def assign_params(params)
    acting_as.assign_params(params)

    params[:files_attributes]&.each do |file_attributes|
      file = files.find { |f| f.id == file_attributes[:id].to_i }
      file.content = file_attributes[:content] if file.present?
    end
  end

  def create_and_update_files(params)
    params[:files_attributes]&.each do |file_attributes|
      file = files.find { |f| f.id == file_attributes[:id].to_i }
      if file.present?
        file.content = file_attributes[:content]
      else
        files.build(filename: file_attributes[:filename], content: file_attributes[:content])
      end
    end
    save
  end

  def delete_file(file_id)
    file = files.find { |f| f.id == file_id }
    file.mark_for_destruction if file.present?
    save(validate: false)
  end

  def generate_feedback
    codaveri_feedback_job&.status == 'submitted' ? codaveri_feedback_job : retrieve_codaveri_code_feedback&.job
  end

  def generate_live_feedback(thread_id, message)
    question = self.question.actable

    should_retrieve_feedback = submission.attempting? &&
                               current_answer? &&
                               question.live_feedback_enabled
    return unless should_retrieve_feedback

    safe_create_or_update_codaveri_question(question)

    request_live_feedback_response(thread_id, message)
  end

  def create_live_feedback_chat
    question = self.question.actable

    should_retrieve_feedback = submission.attempting? &&
                               current_answer? &&
                               question.live_feedback_enabled
    return unless should_retrieve_feedback

    safe_create_or_update_codaveri_question(question)

    request_create_live_feedback_chat(question)
  end

  def retrieve_codaveri_code_feedback
    question = self.question.actable
    assessment = submission.assessment

    should_retrieve_feedback = question.is_codaveri && !submission.attempting? && current_answer?
    return unless should_retrieve_feedback

    safe_create_or_update_codaveri_question(question)

    feedback_job = Course::Assessment::Answer::ProgrammingCodaveriFeedbackJob.perform_later(
      assessment, question, self
    )
    update_column(:codaveri_feedback_job_id, feedback_job.job_id)
    feedback_job
  end

  def compare_answer(other_answer)
    return false unless other_answer.is_a?(Course::Assessment::Answer::Programming)

    same_file_length = files.length == other_answer.files.length
    answer_filename_content = files.pluck(:filename, :content).map { |elem| elem.join('_') }
    other_answer_filename_content = other_answer.files.pluck(:filename, :content).map { |elem| elem.join('_') }

    same_file = Set.new(answer_filename_content) == Set.new(other_answer_filename_content)
    same_file_length && same_file
  end

  MAX_TOTAL_FILE_SIZE = 2.megabytes
  private

  def validate_total_file_size
    total_size = files.reject(&:marked_for_destruction?).sum { |file| file.content.bytesize }
    return if total_size <= MAX_TOTAL_FILE_SIZE

    # Round up to 2 decimal places, so student will see "2.01 MB" if size is slightly over
    display_total_size = (total_size.to_f / 1.megabyte).ceil(2)
    errors.add(:files, :exceed_size_limit, total_size_mb: display_total_size)
  end

  def request_create_live_feedback_chat(question)
    thread_service = Course::Assessment::Answer::LiveFeedback::ThreadService.new(submission.creator,
                                                                                 submission.assessment.course,
                                                                                 question)
    status, body = thread_service.run_create_live_feedback_chat
    raise CodaveriError, { status: status, body: body } if status != 200

    [status, body]
  end

  def request_live_feedback_response(thread_id, message)
    feedback_service = Course::Assessment::Answer::LiveFeedback::FeedbackService.new(message, self)
    status, body = feedback_service.request_codaveri_feedback(thread_id)

    raise CodaveriError, { status: status, body: body } if status != 201 && status != 410

    construct_live_feedback_response(status, body)

    [status, @response]
  end

  def construct_live_feedback_response(status, body)
    @response = if status == 201
                  { feedbackUrl: ENV.fetch('CODAVERI_URL'),
                    threadId: body['thread']['id'],
                    threadStatus: body['thread']['status'],
                    tokenId: body['token']['id'],
                    answerFiles: files }
                else
                  { threadId: body['thread']['id'],
                    threadStatus: body['thread']['status'] }
                end

    @transaction_id = body['transaction']['id']
    extend_response_with_live_feedback_id if status == 201
  end

  def extend_response_with_live_feedback_id
    live_feedback = Course::Assessment::LiveFeedback.create_with_codes(
      submission.assessment_id,
      answer.question_id,
      submission.creator,
      @transaction_id,
      files
    )

    @response = @response.merge({ liveFeedbackId: live_feedback.id })
  end
end
