# frozen_string_literal: true

# A throwaway marketplace preview attempt. Unlike Course::Assessment::Submission it is not an
# experience points record: no EXP record, course user, container course, or per-session copy.
# rubocop:disable Metrics/ClassLength
class Course::Assessment::PreviewAttempt < ApplicationRecord
  include Workflow
  include Course::Assessment::Submission::AnswersConcern
  include Course::Assessment::Submission::WorkflowEventConcern

  self.table_name = 'course_assessment_preview_attempts'

  belongs_to :assessment, class_name: 'Course::Assessment', inverse_of: false
  belongs_to :creator, class_name: 'User', inverse_of: false
  belongs_to :updater, class_name: 'User', inverse_of: false

  has_many :answers, class_name: 'Course::Assessment::Answer',
                     as: :attemptable, foreign_key: 'submission_id',
                     dependent: :destroy, inverse_of: :attemptable do
    include Course::Assessment::Submission::AnswersConcern
  end
  has_many :submission_questions, class_name: 'Course::Assessment::SubmissionQuestion',
                                  as: :attemptable, foreign_key: 'submission_id',
                                  dependent: :destroy, inverse_of: :attemptable

  validates :workflow_state, length: { maximum: 255 }, presence: true,
                             exclusion: { in: ['nil'] }
  validate :validate_workflow_state_not_missing
  before_validation :select_question_bundles, on: :create

  workflow do
    after_transition do
      save!
    end

    state :attempting do
      event :finalise, transitions_to: :published, if: proc { |attempt| attempt.assessment.questions.empty? }
      event :finalise, transitions_to: :submitted
    end
    state :submitted do
      event :unsubmit, transitions_to: :attempting
      event :mark, transitions_to: :graded
      event :publish, transitions_to: :published
    end
    state :graded do
      event :unmark, transitions_to: :submitted
      event :publish, transitions_to: :published
    end
    state :published do
      event :unsubmit, transitions_to: :attempting
    end
  end

  # Param-style event setters: UpdateService drives state changes via
  # `@submission.update(finalise: true)` etc., which requires `finalise=`-style writers.
  # Submission defines these as alias_methods on the model (submission.rb:189-193), NOT in
  # WorkflowEventConcern — so PreviewAttempt must declare its own set.
  alias_method :finalise=, :finalise!
  alias_method :mark=, :mark!
  alias_method :unmark=, :unmark!
  alias_method :publish=, :publish!
  alias_method :unsubmit=, :unsubmit!

  def questions
    return assessment.questions if assessment.randomization.nil?

    Course::Assessment::Question.
      joins(question_bundles: :question_group).
      where(course_assessment_question_bundles: { id: selected_question_bundle_ids }).
      merge(Course::Assessment::QuestionGroup.order(:weight)).
      merge(Course::Assessment::QuestionBundleQuestion.order(:weight)).
      extending(Course::Assessment::QuestionsConcern)
  end

  def current_answers
    answers.select(&:current_answer)
  end

  def current_programming_answers
    current_answers.select { |answer| answer.actable_type == Course::Assessment::Answer::Programming.name }
  end

  def unsubmitting?
    @unsubmitting
  end

  def course_user
    nil
  end

  # Duck-types `Submission#experience_points_record` (from `acts_as_experience_points_record`):
  # the generic `Course::Assessment::Answer` CanCan rules hash-match on
  # `submission: { experience_points_record: { course_user: { user_id: ... } } }`
  # (assessment_ability.rb:26) regardless of the polymorphic attemptable's actual type — without
  # this stub, evaluating that condition against a PreviewAttempt raises NoMethodError instead of
  # simply not matching.
  def experience_points_record
    nil
  end

  def current_points_awarded
    nil
  end

  # Total grade for the grader-rehearsal view (Submission's calculated `grade` lives in its
  # EXP-coupled query layer; a live sum over current answers is enough for one throwaway attempt).
  def grade
    current_answers.filter_map(&:grade).sum
  end

  attr_accessor :last_graded_time

  def workflow_state=(value)
    @missing_workflow_state = value.nil? || value == 'nil'
    super
  end

  def finalise(_ = nil)
    self.submitted_at = Time.zone.now
    answers.reload
    finalise_current_answers
    answers.reload
  end

  def mark(_ = nil)
    publish_answers
  end

  def unmark(_ = nil)
    answers.each { |answer| answer.unmark! if answer.graded? }
  end

  def publish(_ = nil, _send_email = true) # rubocop:disable Style/OptionalBooleanParameter
    publish_answers
    self.published_at = Time.zone.now
  end

  def unsubmit(_ = nil)
    @unsubmitting = true
    recreate_current_answers
    answers.reload
    self.submitted_at = nil
    self.published_at = nil
  end

  # Discards every answer and returns the attempt to a fresh attempting state, as if newly
  # created. Backs the marketplace preview "Reset attempt" action: a throwaway attempt has no EXP
  # record or history to preserve, so a clean wipe (not an unsubmit, which resumes the current
  # answers) is the whole intent.
  def reset_attempt!
    transaction do
      answers.destroy_all
      self.submitted_at = nil
      self.published_at = nil
      self.workflow_state = 'attempting'
      save!
      answers.reload
      create_new_answers
      answers.reload
    end
  end

  private

  def select_question_bundles
    return unless assessment&.randomization && selected_question_bundle_ids.empty?

    self.selected_question_bundle_ids = assessment.question_groups.includes(:question_bundles).filter_map do |group|
      group.question_bundles.sample&.id
    end
  end

  def validate_workflow_state_not_missing
    errors.add(:workflow_state, :blank) if @missing_workflow_state
  end

  def assign_experience_points; end

  def assign_zero_experience_points; end

  def send_email_after_publishing(_send_email); end

  def publish_delayed_posts; end

  def should_publish_task_completion?
    false
  end
end
# rubocop:enable Metrics/ClassLength
