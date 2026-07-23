# frozen_string_literal: true
class Course::Assessment::Submission < ApplicationRecord
  # Submission is a small course-coupled extension of the attempt base record. The base owns the
  # `course_assessment_submissions` table (which is this model's Rails-default table name); point
  # Submission at its own extension table instead.
  self.table_name = 'course_assessment_submission_details'
  # This table has no creator_id/updater_id; identity is delegated to `attempt` and this row is
  # never stamped (record_userstamp is disabled below). ApplicationUserstampConcern's `inherited`
  # hook nonetheless added *required* creator/updater belongs_to, because this model's default table
  # name resolves to `course_assessment_submissions` — which does have those columns — before the
  # line above repoints us to the column-less extension. Drop those associations and their presence
  # validations; the delegated readers below resolve creator/updater through the attempt.
  %i[creator updater].each do |name|
    _validate_callbacks.dup.each do |callback|
      filter = callback.filter
      next unless filter.respond_to?(:attributes) && filter.attributes.include?(name)

      skip_callback(:validate, callback.kind, filter)
    end
    _reflections.delete(name.to_s)
    reflections.delete(name.to_s)
  end
  include Generic::CollectionConcern
  include Course::Assessment::Submission::TodoConcern
  include Course::Assessment::Submission::NotificationConcern
  include Course::Assessment::Submission::CikgoTaskCompletionConcern
  include Course::LessonPlan::PersonalizationConcern

  acts_as_experience_points_record

  # Stamping belongs entirely to Attempt (the base). Without this, `activerecord-userstamp`'s
  # globally-registered `before_validation :set_creator_attribute` still fires here: `acts_as`'s
  # `ReflectionsWithActsAs#_reflections` merges in the acting-as `experience_points_record`'s own
  # `:creator` reflection wherever Submission has none of its own, so `reflect_on_association(:creator)`
  # returns non-nil and the callback calls `creator` on self — resolving to the DELEGATED reader (not
  # a real column) and raising `ActiveSupport::DelegationError` whenever `attempt` is nil (e.g. a bare
  # `Course::Assessment::Submission.new`). This table was never stamped, so disabling it loses nothing.
  self.record_userstamp = false

  belongs_to :attempt, class_name: 'Course::Assessment::Attempt', inverse_of: :submission,
                       autosave: true
  # `publisher_id` is a real column on this extension table. `after_publish_hook`/`after_unsubmit_hook`
  # below both assign `self.publisher =`, which needs this association to exist.
  belongs_to :publisher, class_name: 'User', inverse_of: nil, optional: true

  # Attempt-level surface exposed on Submission through delegation, so existing `submission.<x>` call
  # sites keep working after the split. Notes on the less-obvious members:
  #
  # - `create_new_answers` (from AnswersConcern, mixed into Attempt) and
  #   `saved_change_to_workflow_state?`/`workflow_state_before_last_save` must be delegated: `workflow_state`
  #   is not a column on this extension table, so Rails generates no dirty-tracking methods here, yet
  #   the `after_save` callbacks from TodoConcern/CikgoTaskCompletionConcern/NotificationConcern (still
  #   included on Submission) and the controller's `signals` guard read them. Delegation reads the
  #   right value: by the time `finalise!`/`publish!`/etc. call `save!` on Submission, the attempt's
  #   dirty state from the `attempt.<event>!` call just above it is still fresh.
  # - `creator=`/`updater=` writers, not just readers: without them `submission.creator = x` falls
  #   through `acts_as`'s `method_missing` and writes `experience_points_record.creator` (the wrong row).
  # - `allow_nil: true`: a Submission with no `attempt` only exists transiently (a bare `.new`). The
  #   `belongs_to :attempt` above already enforces attempt presence; the delegate need not also raise
  #   `ActiveSupport::DelegationError` for that transient case.
  delegate :assessment,
           :workflow_state, :workflow_state=,
           :submitted_at, :submitted_at=,
           :published_at, :published_at=,
           :creator, :creator=, :creator_id, :updater, :updater=, :updater_id,
           :attempting?, :submitted?, :graded?, :published?, :unsubmitting?,
           :saved_change_to_workflow_state?, :workflow_state_before_last_save,
           :answers, :answers=, :submission_questions, :questions, :assigned_questions,
           :current_answers, :current_programming_answers, :answer_history,
           :evaluated_or_graded_answers, :user_get_help_message_counts, :create_new_answers,
           :mark!, :unmark!,
           :auto_grade!, :auto_feedback!,
           :submission_view_blocked?,
           :graded_at, :log_count, :grader_ids,
           :logs,
           to: :attempt, allow_nil: true

  # Mirror Attempt's calculated attributes so `@assessment.submissions.calculated(:grade, …)` (used by
  # the gradebook/download/statistics services) works on the extension relation. Attempt correlates
  # each subquery on its own `id`; here we correlate on this extension table's `attempt_id`, which
  # equals that base id. The delegated instance readers above still return these values per-record;
  # registering the calculated attributes restores the batch-load form the services rely on.
  calculated :graded_at, (lambda do
    Course::Assessment::Answer.unscope(:order).
      where('course_assessment_answers.submission_id = course_assessment_submission_details.attempt_id').
      select('max(course_assessment_answers.graded_at)')
  end)

  calculated :log_count, (lambda do
    Course::Assessment::Submission::Log.select("count('*')").
      where('course_assessment_submission_logs.submission_id = course_assessment_submission_details.attempt_id')
  end)

  calculated :grade, (lambda do
    Course::Assessment::Answer.unscope(:order).
      where('course_assessment_answers.submission_id = course_assessment_submission_details.attempt_id
             AND course_assessment_answers.current_answer = true').
      select('sum(course_assessment_answers.grade)')
  end)

  calculated :grader_ids, (lambda do
    Course::Assessment::Answer.unscope(:order).
      where('course_assessment_answers.submission_id = course_assessment_submission_details.attempt_id
             AND course_assessment_answers.current_answer = true').
      select('ARRAY_REMOVE(ARRAY_AGG(DISTINCT(course_assessment_answers.grader_id)), NULL)')
  end)

  Course::Assessment::Answer.after_save do |answer|
    Course::Assessment::Submission.on_dependent_status_change(answer)
  end

  # On the old single table, `last_graded_time` had a DB column default (a frozen historical
  # timestamp — the well-known Rails `add_column ... default: Time.now` gotcha). The extension table
  # does not carry that default, so populate it in Ruby on creation to keep the `presence: true`
  # validation below satisfiable.
  before_validation :ensure_last_graded_time

  validate :validate_consistent_user, on: :create
  validate :validate_awarded_attributes, if: :published?
  validates :last_graded_time, presence: true

  # `belongs_to :attempt, autosave: true` (above) makes Rails validate the associated Attempt as part
  # of validating Submission and, when invalid, copy its messages onto `errors[:attempt]` (prefixed
  # "Attempt ..."). The attempt's uniqueness error is added to `:base`; re-home the cascaded copy back
  # under `:base` (unprefixed) so the controller's `errors.full_messages.to_sentence` rescue renders
  # it to the student exactly as before. Presentation only — the save is rejected either way.
  validate :repoint_attempt_errors_to_base, on: :create

  # @!method self.by_user(user)
  #   Finds all the submissions by the given user.
  #
  # Subquery, not `joins(:attempt).merge(...)`: `@assessment.submissions` is a `has_many :through`
  # that already joins the base table to reach `submission`. An additional explicit `joins(:attempt)`
  # would join the base table a second time under another alias; a later `.pluck(:creator_id)` (a
  # column on the base but not on Submission's own table) then becomes `PG::AmbiguousColumn`. The
  # subquery form adds no second join, so it is safe whether called directly or through
  # `@assessment.submissions`.
  scope :by_user, ->(user) { where(attempt_id: Course::Assessment::Attempt.by_user(user).select(:id)) }

  # @!method self.by_users(user)
  scope :by_users, (lambda do |user_ids|
    where(attempt_id: Course::Assessment::Attempt.by_users(user_ids).select(:id))
  end)

  # @!method self.from_category(category)
  scope :from_category, (lambda do |category|
    joins(:attempt).merge(Course::Assessment::Attempt.from_category(category))
  end)

  scope :from_course, (lambda do |course|
    joins(attempt: { assessment: { tab: :category } }).
      where('course_assessment_categories.course_id = ?', course.id)
  end)

  scope :from_group, (lambda do |group_id|
    joins(experience_points_record: { course_user: :groups }).
      where('course_groups.id IN (?)', group_id)
  end)

  # @!method self.ordered_by_date
  #   Orders the submissions by date of creation (newest first). Uses Submission's own `created_at`
  #   rather than the attempt's: today every submission row is created in the same request as its
  #   attempt, so the two are indistinguishable. Revisit if a submission can ever be created later
  #   than its attempt.
  scope :ordered_by_date, ->(direction = :desc) { order(created_at: direction) }

  # @!method self.ordered_by_submitted_date
  scope :ordered_by_submitted_date, (lambda do
    joins(:attempt).merge(Course::Assessment::Attempt.ordered_by_submitted_date)
  end)

  # @!method self.confirmed
  scope :confirmed, -> { joins(:attempt).merge(Course::Assessment::Attempt.confirmed) }

  scope :pending_for_grading, -> { joins(:attempt).merge(Course::Assessment::Attempt.pending_for_grading) }

  # `with_<state>_state` scopes are generated by the `workflow-activerecord` gem on whichever class
  # calls `workflow do ... end` — that is Attempt, not Submission. Re-expose them here (as joins) for
  # the call sites that use `submissions.with_<state>_state`; they cannot be covered by the instance
  # `delegate` list above because they are class-level scopes.
  scope :with_attempting_state, -> { joins(:attempt).merge(Course::Assessment::Attempt.with_attempting_state) }
  scope :with_submitted_state, -> { joins(:attempt).merge(Course::Assessment::Attempt.with_submitted_state) }
  scope :with_graded_state, -> { joins(:attempt).merge(Course::Assessment::Attempt.with_graded_state) }
  scope :with_published_state, -> { joins(:attempt).merge(Course::Assessment::Attempt.with_published_state) }

  SUBMISSIONS_PER_PAGE = 25
  # Filter submissions by category_id, assessment_id, group_id and/or user_id (creator)
  scope :filter_by_params, (lambda do |filter_params|
    result = all
    if filter_params[:category_id].present?
      result = result.from_category(Course::Assessment::Category.find(filter_params[:category_id]))
    end
    if filter_params[:assessment_id].present?
      result = result.joins(:attempt).
               where(course_assessment_submissions: { assessment_id: filter_params[:assessment_id] })
    end
    result = result.from_group(filter_params[:group_id]) if filter_params[:group_id].present?
    result = result.by_user(filter_params[:user_id]) if filter_params[:user_id].present?
    result
  end)

  # Return the points awarded for the submission.
  # If submission is 'graded', return the draft value, otherwise, the return the points awarded.
  def current_points_awarded
    published? ? points_awarded : draft_points_awarded
  end

  # Not delegated like the members above, because `.grade_summary` (below) is a raw `find_by_sql` on
  # this class that SELECTs an ad-hoc `assessment_id` column onto its result rows. Those rows have no
  # `attempt_id` and so cannot read `attempt`; prefer the raw-SQL-loaded attribute when present,
  # otherwise delegate to the attempt.
  def assessment_id
    has_attribute?(:assessment_id) ? read_attribute(:assessment_id) : attempt&.assessment_id
  end

  # Same reasoning as `assessment_id` above: `.grade_summary`'s raw SQL also SELECTs
  # `SUM(caa.grade) AS grade`, conflicting with the delegated `calculated :grade` on Attempt.
  def grade
    has_attribute?(:grade) ? read_attribute(:grade) : attempt&.grade
  end

  def self.on_dependent_status_change(answer)
    return unless answer.saved_changes.key?(:grade)

    # `answer.submission` resolves to an Attempt (the association name is `:submission`, its
    # `class_name` is Attempt). `last_graded_time` is a course-coupled column that lives only on the
    # real Submission, reached via the attempt's `has_one :submission`.
    answer.submission.submission&.last_graded_time = Time.now
  end

  # Returns an array of submission rows for the given students and assessments.
  # Each row has: student_id (creator_id), assessment_id, grade (float).
  # Only graded/published submissions are included.
  def self.grade_summary(student_ids:, assessment_ids:)
    return [] if student_ids.empty? || assessment_ids.empty?

    find_by_sql(
      sanitize_sql_array([<<-SQL.squish, student_ids, assessment_ids])
        SELECT cas.creator_id AS student_id, cas.assessment_id,
               cas.id AS submission_id, SUM(caa.grade) AS grade
        FROM course_assessment_submissions cas
        INNER JOIN course_assessment_submission_details cad ON cad.attempt_id = cas.id
        JOIN course_assessment_answers caa ON caa.submission_id = cas.id
        WHERE cas.creator_id IN (?)
          AND cas.assessment_id IN (?)
          AND cas.workflow_state IN ('graded', 'published')
          AND caa.current_answer = TRUE
        GROUP BY cas.creator_id, cas.assessment_id, cas.id
      SQL
    )
  end

  def finalise!(*args)
    ActiveRecord::Base.transaction do
      attempt.finalise!(*args)
      save!
    end
  end

  def publish!(*args)
    ActiveRecord::Base.transaction do
      attempt.publish!(*args)
      save!
    end
  end

  def unsubmit!(*args)
    ActiveRecord::Base.transaction do
      attempt.unsubmit!(*args)
      save!
    end
  end

  def resubmit_programming!(*args)
    ActiveRecord::Base.transaction do
      attempt.resubmit_programming!(*args)
      save!
    end
  end

  # Placed after the method definitions above because `alias_method` resolves its target when
  # evaluated: `finalise!`/`publish!`/`unsubmit!` are plain methods defined on this class (not
  # delegated, unlike `mark!`/`unmark!`), so aliasing them earlier raises `NameError` at class load.
  alias_method :finalise=, :finalise!
  alias_method :mark=, :mark!
  alias_method :unmark=, :unmark!
  alias_method :publish=, :publish!
  alias_method :unsubmit=, :unsubmit!

  # --- Hook bodies invoked by Attempt's WorkflowEventConcern for the EXP-specific / course-coupled
  # work of each workflow event. Public (not protected) because they are called with an explicit
  # receiver (`submission&.after_x_hook`) from a different object (the Attempt instance), which
  # `protected` would forbid since Attempt and Submission are unrelated by inheritance.

  def after_finalise_hook
    assign_zero_experience_points
    update_personalized_timeline_for_user(course_user)
  end

  # `send_email` is threaded from `Attempt#publish`'s `send_email` argument. Also folds in the
  # former `assign_experience_points` before_validation's only real effect
  # (`points_awarded ||= draft_points_awarded`), whose guard was only ever true on a publish event.
  def after_publish_hook(send_email)
    self.points_awarded ||= draft_points_awarded
    self.draft_points_awarded = nil
    self.publisher = User.stamper || User.system
    self.awarder = User.stamper || User.system
    self.awarded_at = Time.zone.now
    publish_delayed_posts
    send_email_after_publishing(send_email)
  end

  def after_unsubmit_hook
    self.points_awarded = nil
    self.draft_points_awarded = nil
    self.awarded_at = nil
    self.awarder = nil
    self.publisher = nil
  end

  # `assign_zero_experience_points` runs on both `finalise` and `resubmit_programming`.
  # `resubmit_programming` clears points (reusing `after_unsubmit_hook`) and re-finalises current
  # answers first, so it gets its own hook rather than overloading `after_finalise_hook`.
  def after_resubmit_programming_hook
    assign_zero_experience_points
  end

  private

  # finalise event (from attempting) - Assign 0 points as there are no questions.
  def assign_zero_experience_points
    return unless assessment.questions.empty?

    self.points_awarded = 0
    self.awarded_at = Time.zone.now
    self.awarder = User.stamper || User.system
  end

  def send_email_after_publishing(send_email)
    return unless send_email && persisted? && !assessment.autograded? &&
                  submission_graded_email_enabled? &&
                  submission_graded_email_subscribed?

    execute_after_commit { Course::Mailer.submission_graded_email(self).deliver_later }
  end

  def submission_graded_email_enabled?
    is_enabled_as_phantom = course_user.phantom? && email_enabled.phantom
    is_enabled_as_regular = !course_user.phantom? && email_enabled.regular
    is_enabled_as_phantom || is_enabled_as_regular
  end

  def submission_graded_email_subscribed?
    !course_user.email_unsubscriptions.where(course_settings_email_id: email_enabled.id).exists?
  end

  def email_enabled
    assessment.course.email_enabled(:assessments, :grades_released, assessment.tab.category.id)
  end

  def publish_delayed_posts
    return if assessment.autograded?

    # Publish delayed comments for each question of a submission
    submission_question_topics = submission_questions.flat_map(&:discussion_topic)
    update_delayed_topics_and_posts(submission_question_topics)

    # Publish delayed annotations for each programming question of a submission
    programming_answers = answers.where('actable_type = ?', Course::Assessment::Answer::Programming.name)
    annotation_topics = programming_answers.flat_map(&:specific).
                        flat_map(&:files).flat_map(&:annotations).map(&:discussion_topic)
    update_delayed_topics_and_posts(annotation_topics)
  end

  # Update read mark for topic and delayed for posts
  def update_delayed_topics_and_posts(topics)
    topics.each do |topic|
      delayed_posts = topic.posts.only_delayed_posts
      next if delayed_posts.empty?

      topic.read_marks.where('reader_id = ?', creator.id)&.destroy_all # Remove 'mark as read' (if any)
      delayed_posts.update_all(workflow_state: 'published')
    end
  end

  # Validate that the submission creator is the same user as the course_user in the associated
  # experience_points_record.
  def validate_consistent_user
    return if course_user && course_user.user == creator

    errors.add(:experience_points_record, :inconsistent_user)
  end

  # Validate that the awarder and awarded_at is present for published submissions
  def validate_awarded_attributes
    return if awarded_at && awarder

    errors.add(:experience_points_record, :absent_award_attributes)
  end

  def ensure_last_graded_time
    self.last_graded_time ||= Time.zone.now
  end

  def repoint_attempt_errors_to_base
    # Rails' autosave-association-validation key for a nested `:base` error is the dotted
    # `:'attempt.base'` (association name + attribute), not a bare `:attempt`.
    key = :'attempt.base'
    return if errors[key].blank?

    messages = errors[key]
    errors.delete(key)
    messages.each { |message| errors.add(:base, message) }
  end
end
