# frozen_string_literal: true
class Course::Assessment::Submission < ApplicationRecord
  include Generic::CollectionConcern
  include Course::Assessment::Submission::TodoConcern
  include Course::Assessment::Submission::NotificationConcern
  include Course::Assessment::Submission::CikgoTaskCompletionConcern
  include Course::LessonPlan::PersonalizationConcern

  acts_as_experience_points_record

  # Submission's own (small) table has no `creator_id`/`updater_id` columns any more — that
  # stamping now belongs entirely to Attempt, via its own independent userstamp setup. Without this,
  # `activerecord-userstamp`'s globally-registered `before_validation :set_creator_attribute` (added
  # to every `ApplicationRecord` subclass, not just ones with real userstamp columns) still fires
  # here: `acts_as`'s `ReflectionsWithActsAs#_reflections` merges in the acting-as
  # `experience_points_record`'s OWN `:creator` reflection as a fallback wherever Submission has no
  # reflection of its own (Submission genuinely doesn't, post-split), so
  # `reflect_on_association(:creator)` returns non-nil and the callback proceeds to call `creator`
  # on self — resolving to the DELEGATED reader (Step 2c), not the EXP record's own column, and
  # raising `ActiveSupport::DelegationError` whenever `attempt` is nil (e.g. a bare
  # `Course::Assessment::Submission.new`). Reproduced by shoulda-matchers' `belong_to(:attempt)`
  # matcher, which builds exactly that. Turning stamping off here is not a loss: nothing on this
  # table was ever stamped by it.
  self.record_userstamp = false

  belongs_to :attempt, class_name: 'Course::Assessment::Attempt', inverse_of: :submission,
                       autosave: true
  # `publisher_id` is a real column on Submission's own (small) table (Task 1's extension table) —
  # carried over unchanged from the pre-split model. Omitted from the design spike's own draft of
  # this file, but `after_publish_hook`/`after_unsubmit_hook` below both assign `self.publisher =`,
  # which needs this association to exist (mechanical fix — reproduced with a bare
  # `NoMethodError: undefined method 'publisher=' for an instance of Course::Assessment::Submission`
  # otherwise; not a design change).
  belongs_to :publisher, class_name: 'User', inverse_of: nil, optional: true

  # Attempt-level surface, kept working through delegation (design spec §3.1). Grouped by why each
  # member is here — every one has a real external call site (grepped, not guessed; see the
  # "Corrections" section above for the ~14 members the design spike's own list omitted: creator/
  # creator_id/updater/updater_id, grade/graded_at/log_count/grader_ids, and the four `=` writers).
  #
  # `create_new_answers` (from Course::Assessment::Submission::AnswersConcern, mixed into Attempt)
  # is likewise a real, mechanical omission from the design spike's own delegate list — it has 5
  # real call sites (`submission.create_new_answers`/`@submission.create_new_answers` in
  # force_submitting_job.rb, materials_controller.rb, submissions_controller.rb,
  # update_service.rb, and the koditsu concern) and would otherwise raise `NoMethodError` on every
  # one of them.
  # `saved_change_to_workflow_state?`/`workflow_state_before_last_save` are likewise real,
  # mechanical omissions: `TodoConcern`'s, `CikgoTaskCompletionConcern`'s, and
  # `NotificationConcern`'s own `after_save` callbacks (all three still included on Submission,
  # Step 2c) read one or the other, and `submissions_controller.rb`'s `signals` guard reads
  # `@submission.saved_change_to_workflow_state?` too. `workflow_state` is not a real column on
  # Submission's own (small) table any more, so Rails does not auto-generate either dirty-tracking
  # method here — without delegating them, every one of those raises `NoMethodError` the first time
  # a `Submission#save!` fires (reproduced via `create(:submission, :attempting, ...)`/
  # `create(:submission, :submitted, ...)`, which raise from `TodoConcern`'s and
  # `NotificationConcern`'s `after_save` respectively). Delegating still reads the right thing: by
  # the time `finalise!`/`publish!`/etc. call `save!` on the Submission itself, `attempt`'s own
  # dirty state from the `attempt.finalise!`/etc. call immediately above it is still fresh (attempt
  # has not been saved again since).
  # `allow_nil: true`: a `Submission` with no `attempt` only ever exists transiently (a bare `.new`,
  # e.g. shoulda-matchers' `belong_to(:attempt)` matcher building one to verify the association is
  # required — reproduced by that exact matcher raising `ActiveSupport::DelegationError` without
  # this). The `belongs_to :attempt` above already independently enforces "every real Submission has
  # an attempt" via its own (required-by-default) presence validation; delegate reads/writes don't
  # need to ALSO raise a hard error for the same absent-attempt case — returning/no-op'ing nil here
  # is strictly more graceful, and no production call site ever holds a persisted, valid Submission
  # with a nil `attempt` regardless of this setting.
  # `creator=`/`updater=` (writers, not just the readers the design spike's own list named):
  # without them, `submission.creator = x`/`submission.updater = x` fall through to `acts_as`'s own
  # `method_missing` and silently write `experience_points_record.creator`/`.updater` instead (a
  # REAL column there too, so no error — just the wrong row). Reproduced by
  # `spec/models/course/assessment/submission_spec.rb`'s `#send_submit_notification` example, which
  # calls `submission1.updater = user1` directly and then reads `creator == updater` (both
  # delegated readers, i.e. `attempt.creator`/`attempt.updater`) — without the writer delegated too,
  # `attempt.updater` never actually changes and the equality check silently fails.
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

  Course::Assessment::Answer.after_save do |answer|
    Course::Assessment::Submission.on_dependent_status_change(answer)
  end

  # `last_graded_time` used to be satisfied for every new row by a DB column default
  # (`db/migrate/20211024140630_..., default: Time.now`, baked into `course_assessment_attempts` as
  # a frozen historical timestamp literal — a well-known Rails `add_column ... default: Time.now`
  # gotcha, not a deliberately "always this exact date" business rule). Task 1's extension table
  # (`course_assessment_submissions`) deliberately does NOT carry that stale default forward (see
  # its migration and the backfill spec's explicit `last_graded_time: nil` case) — so `presence:
  # true` below would otherwise fail on every newly-built Submission. Replicate the same
  # "always populated on creation" guarantee at the Ruby level instead of adding a migration (Task
  # 2 has none). Mechanical fix — reproduced via `FactoryBot.build(:submission, ...).valid?` →
  # `last_graded_time can't be blank`; not a validation-intent change.
  before_validation :ensure_last_graded_time

  validate :validate_consistent_user, on: :create
  validate :validate_awarded_attributes, if: :published?
  validates :last_graded_time, presence: true

  # `belongs_to :attempt, autosave: true` (above) makes Rails validate the associated Attempt as
  # part of validating Submission, and — when it's invalid — copy its messages onto
  # `errors[:attempt]` (`full_messages` prefixes them with "Attempt ", e.g. "Attempt Looks like you
  # have already created a submission..."). Pre-split, `validate_unique_submission` lived directly
  # on this same row and added straight to `errors[:base]` (unprefixed) — exactly what
  # `submissions_controller.rb#create`'s `errors.full_messages.to_sentence` rescue path renders to
  # the student. Re-home the cascaded messages under `:base` so that UX is unchanged; this only
  # affects presentation — the underlying save is rejected either way. (Genuine bug the split
  # exposed: reproduced by `spec/models/course/assessment/submission_spec.rb`'s "a submission for
  # the user and assessment already exists" example, which asserts on `errors.messages[:base]`.)
  validate :repoint_attempt_errors_to_base, on: :create

  # @!method self.by_user(user)
  #   Finds all the submissions by the given user.
  #
  # Subquery, not `joins(:attempt).merge(...)`: `@assessment.submissions` is itself a `has_many
  # :through` (Step 2e) that ALREADY joins `course_assessment_attempts` implicitly to get from
  # `assessment` to `submission`. Adding another explicit `joins(:attempt)` on top (the shape every
  # other scope below still uses) gives Postgres TWO separate joins to the same table under two
  # different aliases — harmless for a plain `.where`/`.count`, but `.pluck(:creator_id)` (a column
  # that exists on `course_assessment_attempts` but nowhere on Submission's own table, so Rails
  # can't qualify it the way it does `:id`) becomes `PG::AmbiguousColumn`, because both joined
  # copies of the table expose it. Reproduced by
  # `submissions_controller.rb#user_ids_without_submission`'s `existing_submissions.pluck(:creator_id)`
  # (called via `@assessment.submissions.by_users(...)`, exercised by
  # `spec/controllers/.../submissions_controller_spec.rb`'s `force_submit_all` examples). The
  # subquery form never adds a second join at all, so it's safe called either way (directly on
  # `Course::Assessment::Submission` or through `@assessment.submissions`).
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
  #   Orders the submissions by date of creation (newest first). Left as a plain, undelegated scope
  #   on Submission's own `created_at` rather than wrapped through `:attempt` — every Submission row
  #   is created in the same request as its Attempt in Phase 1b (no code path creates one without
  #   the other; previews don't exist yet), so ordering by either column is behaviourally
  #   indistinguishable today. Flagged (per the design spike §3.1c) as worth a second look once
  #   Phase 2 introduces attempts whose submission is created later than the attempt itself.
  scope :ordered_by_date, ->(direction = :desc) { order(created_at: direction) }

  # @!method self.ordered_by_submitted_date
  scope :ordered_by_submitted_date, (lambda do
    joins(:attempt).merge(Course::Assessment::Attempt.ordered_by_submitted_date)
  end)

  # @!method self.confirmed
  scope :confirmed, -> { joins(:attempt).merge(Course::Assessment::Attempt.confirmed) }

  scope :pending_for_grading, -> { joins(:attempt).merge(Course::Assessment::Attempt.pending_for_grading) }

  # `with_<state>_state`/`without_<state>_state` are auto-generated, per workflow state, by the
  # `workflow-activerecord` gem's own `Scopes` module — for whichever class actually calls
  # `workflow do ... end` (Step 2a: that's `Attempt` now, not `Submission`). Wrapped here the same
  # way as `confirmed`/`pending_for_grading` above, for the four real call sites this task's own
  # diff touches or the acceptance gate exercises (`submissions_controller.rb`,
  # `force_submitting_job.rb`, `course/condition/assessment.rb`,
  # `skills_mastery_preload_service.rb`, `spec/helpers/course/assessment/submissions_helper_spec.rb`)
  # — a real, mechanical omission from the design spike's own list, not covered by the generic
  # delegate list because these are class-level scopes, not instance methods.
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
               where(course_assessment_attempts: { assessment_id: filter_params[:assessment_id] })
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

  # `assessment_id` is deliberately NOT in the plain `delegate` list above: `.grade_summary`
  # (below) is a raw-SQL `find_by_sql` on this class that itself SELECTs a column literally named
  # `assessment_id` (`cas.assessment_id`, unrelated to the small table's own columns — `find_by_sql`
  # rows carry whatever the query returns as ad hoc, non-schema attributes). A plain `delegate`
  # would shadow that with `attempt.assessment_id`, which raises `ActiveModel::MissingAttributeError`
  # on these rows (they never SELECT `attempt_id`, so `attempt` itself can't be read). Prefer the
  # raw-SQL-loaded attribute when present (i.e. this is a `grade_summary` pseudo-row); otherwise
  # delegate normally, exactly like every other member of the list above. Genuine bug the split
  # exposed — reproduced by `spec/models/course/assessment/submission_spec.rb`'s
  # `.grade_summary` examples reading `results.first.assessment_id`.
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

    # `answer.submission` resolves to an Attempt post-Phase-1b FK repoint (the association name
    # stays `:submission`, only `class_name:` changed). `last_graded_time` is a course-coupled
    # column that only exists on the real Submission, reached via the Attempt's `has_one
    # :submission`. (Correction found while reading the real code — not covered by the design
    # spike, which only discussed the two `can_read_grade?`-adjacent call sites.)
    answer.submission.submission&.last_graded_time = Time.now
  end

  # Returns an array of submission rows for the given students and assessments.
  # Each row has: student_id (creator_id), assessment_id, grade (float).
  # Only graded/published submissions are included.
  #
  # Unchanged from Phase 1a: already reads `course_assessment_attempts` directly (a raw-SQL class
  # method, not touching Submission's own table), so it needs no changes for this split.
  def self.grade_summary(student_ids:, assessment_ids:)
    return [] if student_ids.empty? || assessment_ids.empty?

    find_by_sql(
      sanitize_sql_array([<<-SQL.squish, student_ids, assessment_ids])
        SELECT cas.creator_id AS student_id, cas.assessment_id,
               cas.id AS submission_id, SUM(caa.grade) AS grade
        FROM course_assessment_attempts cas
        JOIN course_assessment_answers caa ON caa.attempt_id = cas.id
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

  # Placed after the method definitions above (rather than alongside the `delegate` call, as in the
  # design spike's own draft): `alias_method` resolves its target at the point it is *evaluated*, and
  # `finalise!`/`publish!`/`unsubmit!` are plain methods defined on this class further down in the
  # same body (not delegated, unlike `mark!`/`unmark!` — see the two-table transaction wrapping
  # above), so aliasing them any earlier raises `NameError: undefined method` at class-load time.
  # (Mechanical fix; no change to which methods get aliased or what they do.)
  alias_method :finalise=, :finalise!
  alias_method :mark=, :mark!
  alias_method :unmark=, :unmark!
  alias_method :publish=, :publish!
  alias_method :unsubmit=, :unsubmit!

  # --- Hook bodies called by Course::Assessment::Attempt's WorkflowEventConcern, at the point the
  # old, single-table WorkflowEventConcern used to inline this EXP-specific / course-coupled work.
  # Public (not private/protected) because they are invoked with an explicit receiver
  # (`submission&.after_x_hook`) from a *different* object (the Attempt instance) — `protected`
  # would not permit that call, since Attempt and Submission are not related by inheritance.

  def after_finalise_hook
    assign_zero_experience_points
    update_personalized_timeline_for_user(course_user)
  end

  # `send_email` is threaded from `Attempt#publish`'s own `send_email` argument (design spike §3.2's
  # flagged decision: the argument has nowhere else to travel once the EXP-side email logic moves
  # into a hook call). Also folds in the old `assign_experience_points` before_validation's only
  # real effect (`points_awarded ||= draft_points_awarded` on a graded/submitted → published
  # transition) — that guard's condition is only ever true during a `publish` event, so it is
  # behaviourally identical to running it here.
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

  # Residual judgment call (flagged, per the design spike §5/§3.2): `assign_zero_experience_points`
  # is called from both `finalise` and `resubmit_programming` in the old code, but only `finalise`
  # has an obvious single hook seam (`after_finalise_hook`). `resubmit_programming`'s call happens
  # after its own point-clearing (which reuses `after_unsubmit_hook`) and after re-finalising
  # current answers, so it gets its own third hook rather than overloading either existing one.
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
    # Rails' autosave-association-validation error key for a nested `:base` error is the dotted
    # `:'attempt.base'` (association name + attribute), not a bare `:attempt` (confirmed by reading
    # `sub.errors.to_hash` directly — not guessed).
    key = :'attempt.base'
    return if errors[key].blank?

    messages = errors[key]
    errors.delete(key)
    messages.each { |message| errors.add(:base, message) }
  end
end
