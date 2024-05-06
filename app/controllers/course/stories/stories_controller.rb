# frozen_string_literal: true
class Course::Stories::StoriesController < Course::ComponentController
  include Signals::EmissionConcern
  include Course::CikgoChatsConcern

  signals :cikgo_open_threads_count, after: [:learn]

  def learn
    head :not_found and return unless push_key

    url, @open_threads_count = find_or_create_room(current_course_user)

    render json: { redirectUrl: url }
  end

  private

  def push_key
    current_course.settings(:course_stories_component).push_key
  end

  def component
    current_component_host[:course_stories_component]
  end
end
