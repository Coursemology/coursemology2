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
  def update_personalized_timeline_for(course_user, timeline_algorithm = nil)
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
    strategy.execute(course_user, precomputed_data)
  end
end
