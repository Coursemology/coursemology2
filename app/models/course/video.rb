# frozen_string_literal: true
class Course::Video < ApplicationRecord
  acts_as_lesson_plan_item has_todo: true

  include Course::ClosingReminderConcern
  include Course::Video::UrlConcern

  before_validation :set_duration, if: :new_record?

  belongs_to :tab, class_name: Course::Video::Tab.name, inverse_of: :videos
  has_many :submissions, class_name: Course::Video::Submission.name,
                         inverse_of: :video, dependent: :destroy
  has_many :topics, class_name: Course::Video::Topic.name,
                    dependent: :destroy, foreign_key: :video_id, inverse_of: :video

  validate :url_unchanged
  validate :duration_unchanged

  scope :from_course, ->(course) { where(course_id: course) }

  scope :from_tab, ->(tab) { where(tab_id: tab) }

  # TODO: Refactor this together with assessments.
  # @!method self.ordered_by_date_and_title
  #   Orders the videos by the starting date and title.
  scope :ordered_by_date_and_title, (lambda do
    select('course_videos.*, course_lesson_plan_items.start_at, course_lesson_plan_items.title').
      joins(:lesson_plan_item).
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
      pluck('DISTINCT video_id'))
  end)

  # Used by the with_actable_types scope in Course::LessonPlan::Item.
  # Edit this to remove items for display.
  scope :ids_showable_in_lesson_plan, (lambda do |_|
    joining { lesson_plan_item }.selecting { lesson_plan_item.id }
  end)

  scope :video_after, (lambda do |video|
    from_tab(video.tab_id).
      joins(:lesson_plan_item).
      where('course_lesson_plan_items.start_at > :start_at OR '\
            '(course_lesson_plan_items.start_at = :start_at AND '\
            'course_lesson_plan_items.title > :title)',
            start_at: video.start_at,
            title: video.title).
      ordered_by_date_and_title.
      limit(1)
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
    copy_attributes(other, duplicator)
    self.course = duplicator.options[:target_course]
    initialize_duplicate_tab(duplicator, other)
  end

  def include_in_consolidated_email?(event)
    Course::Settings::VideosComponent.email_enabled?(course, "video_#{event}".to_sym)
  end

  private

  # Parents the video under its duplicated video tab, if it exists.
  #
  # @return [Course::Video::Tab] The duplicated video's tab
  def initialize_duplicate_tab(duplicator, other)
    self.tab = if duplicator.duplicated?(other.tab)
                 duplicator.duplicate(other.tab)
               else
                 duplicator.options[:target_course].video_tabs.first
               end
  end

  def set_duration
    return if duration

    youtube_id = youtube_video_id_from_link(url)
    self.duration = Yt::Video.new(id: youtube_id).duration
  end

  def url_unchanged
    errors.add(:url, 'should not be updated for existing videos') if url_changed? &&
                                                                     persisted?
  end

  def duration_unchanged
    errors.add(:duration, 'should not be updated for existing videos') if duration_changed? &&
                                                                          persisted?
  end
end
