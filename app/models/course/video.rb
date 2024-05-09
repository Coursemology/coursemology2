# frozen_string_literal: true
class Course::Video < ApplicationRecord
  after_save :init_statistic

  acts_as_conditional
  acts_as_lesson_plan_item has_todo: true

  include Course::ClosingReminderConcern
  include Course::Video::UrlConcern
  include Course::Video::WatchStatisticsConcern
  include DuplicationStateTrackingConcern

  before_update :destroy_children, if: :changing_used_url?
  validates :url, length: { maximum: 255 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :tab, presence: true

  belongs_to :tab, class_name: Course::Video::Tab.name, inverse_of: :videos
  has_many :submissions, class_name: Course::Video::Submission.name,
                         inverse_of: :video, dependent: :destroy
  has_many :topics, class_name: Course::Video::Topic.name,
                    dependent: :destroy, foreign_key: :video_id, inverse_of: :video
  has_many :discussion_topics, through: :topics, class_name: Course::Discussion::Topic.name
  has_many :posts, through: :discussion_topics, class_name: Course::Discussion::Post.name
  has_many :sessions, through: :submissions, class_name: Course::Video::Session.name
  has_many :events, through: :sessions, class_name: Course::Video::Event.name
  has_one :statistic, class_name: Course::Video::Statistic.name, dependent: :destroy,
                      foreign_key: :video_id, inverse_of: :video, autosave: true
  has_many :video_conditions, class_name: Course::Condition::Video.name,
                              inverse_of: :video, dependent: :destroy

  # @!attribute [r] student_submission_count
  #   Returns the total number of video submissions by students in this course.
  #   Only submissions by students have sessions and statistic.
  calculated :student_submission_count, (lambda do
    Course::Video::Submission::Statistic.
      select('count(*)').
      joins(:submission).
      where('course_video_submission_statistics.submission_id = course_video_submissions.id').
      where('course_video_submissions.video_id = course_videos.id')
  end)

  scope :from_course, ->(course) { where(course_id: course) }

  scope :from_tab, ->(tab) { where(tab_id: tab) }

  scope :with_student_submission_count, -> { all.calculated(:student_submission_count) }

  # TODO: Refactor this together with assessments.
  # @!method self.ordered_by_date_and_title
  #   Orders the videos by the starting date and title.
  scope :ordered_by_date_and_title, (lambda do
    joins(:lesson_plan_item).
      includes(:statistic).references(:all).
      merge(Course::LessonPlan::Item.ordered_by_date_and_title)
  end)

  # @!method with_submissions_by(creator)
  #   Includes the submissions by the provided user.
  #   @param [User] user The user to preload submissions for.
  scope :with_submissions_by, (lambda do |user|
    submissions = Course::Video::Submission.by_user(user).
      where(video: distinct(false).pluck(:id))

    all.to_a.tap do |result|
      preloader = ActiveRecord::Associations::Preloader::ManualPreloader.new
      preloader.preload(result, :submissions, submissions)
    end
  end)

  scope :unwatched_by, (lambda do |user|
    where.not(id: Course::Video::Submission.
      by_user(user).
      pluck(Arel.sql('DISTINCT video_id')))
  end)

  # Used by the with_actable_types scope in Course::LessonPlan::Item.
  # Edit this to remove items for display.
  scope :ids_showable_in_lesson_plan, (lambda do |_|
    # joining { lesson_plan_item }.selecting { lesson_plan_item.id }
    unscoped.joins(:lesson_plan_item).select(Course::LessonPlan::Item.arel_table[:id])
  end)

  scope :video_after, (lambda do |video|
    candidates = from_tab(video.tab_id).
                 joins(lesson_plan_item: :default_reference_time).
                 where('course_reference_times.start_at > :start_at OR '\
                       '(course_reference_times.start_at = :start_at AND '\
                       'course_lesson_plan_items.title > :title)',
                       start_at: video.start_at,
                       title: video.title)
    # Workaround to avoid joining to same table twice
    candidates = where(id: candidates.to_a)
    candidates.ordered_by_date_and_title.limit(1)
  end)

  def self.use_relative_model_naming?
    true
  end

  def next_video
    Course::Video.video_after(self).first
  end

  def to_partial_path
    'course/video/videos/video'
  end

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:destination_course]
    copy_attributes(other, duplicator)
    initialize_duplicate_tab(duplicator, other)
    initialize_duplicate_conditions(duplicator, other)
    set_duplication_flag
  end

  def include_in_consolidated_email?(event)
    email_enabled = course.email_enabled(:videos, event)
    email_enabled.regular || email_enabled.phantom
  end

  def children_exist?
    sessions.exists? || posts.exists?
  end

  def calculate_percent_watched
    submission_statistics = Course::Video::Submission::Statistic.where(submission: submissions)
    if submission_statistics.blank?
      0
    else
      (submission_statistics.map(&:percent_watched).sum / submission_statistics.size).round
    end
  end

  # @override ConditionalInstanceMethods#permitted_for!
  def permitted_for!(course_user)
  end

  # @override ConditionalInstanceMethods#precluded_for!
  def precluded_for!(course_user)
  end

  # @override ConditionalInstanceMethods#satisfiable?
  def satisfiable?
    published?
  end

  private

  def relevant_events_scope
    events
  end

  # Parents the video under its duplicated video tab, if it exists.
  #
  # @return [Course::Video::Tab] The duplicated video's tab
  def initialize_duplicate_tab(duplicator, other)
    self.tab = if duplicator.duplicated?(other.tab)
                 duplicator.duplicate(other.tab)
               else
                 duplicator.options[:destination_course].video_tabs.first
               end
  end

  # Set up conditions that depend on this video and conditions that this video depends on.
  def initialize_duplicate_conditions(duplicator, other)
    duplicate_conditions(duplicator, other)
    video_conditions << other.video_conditions.
                        select { |condition| duplicator.duplicated?(condition.conditional) }.
                        map { |condition| duplicator.duplicate(condition) }
  end

  def changing_used_url?
    url_changed? && persisted? && children_exist?
  end

  def destroy_children
    Course::Video.transaction do
      # Eager load all events and sessions and delete from bottom up to avoid N+1
      child_sessions = Course::Video::Session.where(submission: submissions)
      child_events = Course::Video::Event.where(session: child_sessions)

      statistic&.destroy!
      discussion_topics.map(&:destroy!)
      topics.map(&:destroy!)
      child_events.delete_all
      child_sessions.delete_all
      submissions.delete_all
      self.duration = 0
    end
  end

  def init_statistic
    create_statistic if statistic.nil?
  end
end
