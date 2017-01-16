# frozen_string_literal: true
class Course::Video < ActiveRecord::Base
  acts_as_lesson_plan_item has_todo: true

  include Course::ReminderConcern
  include Course::Video::UrlConcern

  after_initialize :set_defaults, if: :new_record?

  has_many :submissions, class_name: Course::Video::Submission.name,
                         inverse_of: :video, dependent: :destroy

  # TODO: Refactor this together with assessments.
  # @!method self.ordered_by_date
  #   Orders the videos by the starting date.
  scope :ordered_by_date, (lambda do
    select('course_videos.*').
      select('course_lesson_plan_items.start_at').
      joins { lesson_plan_item }.
      merge(Course::LessonPlan::Item.ordered_by_date)
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

  def self.use_relative_model_naming?
    true
  end

  def to_partial_path
    'course/video/videos/video'.freeze
  end

  private

  def set_defaults
    self.published = false
  end
end
