# frozen_string_literal: true
module Course::LessonPlan::PersonalizationConcern
  extend ActiveSupport::Concern

  # Dispatches the call to the correct personalization algorithm strategy.
  # If the algorithm takes too long (e.g. voodoo AI magic), it is responsible for scheduling an async job.
  #
  # Some properties for the algorithms:
  # - We don't shift personal dates that have already passed. This is to prevent items becoming locked
  #   when students are switched between different algos. There are thus quite a few checks for
  #   > Time.zone.now. The only exception is the backwards-shifting of already-past deadlines, which
  #   allows students to slow down their learning more effectively.
  # - We don't shift closing dates forward when the item has already opened for the student. This is to
  #   prevent students from being shocked that their deadlines have shifted forward suddenly.
  #
  # @param [CourseUser] course_user The user to update the personalized timeline for.
  # @param [String|nil] timeline_algorithm The timeline algorithm to run. If not provided, the user's timeline algorithm
  #   is used.
  # @param [Set<Number>|nil] items_to_shift A set of lesson plan item IDs to shift. If not in this set, the item won't
  #   be shifted.
  def update_personalized_timeline_for_user(course_user, timeline_algorithm = nil, items_to_shift = nil)
    timeline_algorithm ||= course_user.timeline_algorithm

    strategy = case timeline_algorithm
               when 'otot'
                 Course::LessonPlan::Strategies::OtotPersonalizationStrategy.new
               when 'fomo'
                 Course::LessonPlan::Strategies::FomoPersonalizationStrategy.new
               when 'stragglers'
                 Course::LessonPlan::Strategies::StragglersPersonalizationStrategy.new
               else
                 # Default to fixed.
                 Course::LessonPlan::Strategies::FixedPersonalizationStrategy.new
               end

    precomputed_data = strategy.precompute_data(course_user)
    strategy.execute(course_user, precomputed_data, items_to_shift)
  end

  # Updates the personalized timeline for all course users in the course of the given lesson plan item.
  # Only the timing for the lesson plan item will be shifted. Generally, you should only call this if the timing of the
  # lesson plan item has shifted, or other personalized timeline related changes have been made for a specific item.
  def update_personalized_timeline_for_item(lesson_plan_item)
    course = Course.includes(:course_users).find(lesson_plan_item.course_id)
    course.course_users.each do |course_user|
      update_personalized_timeline_for_user(course_user, nil, Set[lesson_plan_item.id])
    end
  end
end
