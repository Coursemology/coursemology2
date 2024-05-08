# frozen_string_literal: true
class Course::Admin::StoriesSettingsController < Course::Admin::Controller
  include Course::CikgoPushConcern

  before_action :ping_remote_course, only: [:edit]
  after_action :push_lesson_plan_items_to_remote_course, only: [:update], if: -> { @settings.push_key }

  def edit
  end

  def update
    updated = @settings.update(stories_settings_params)
    ping_remote_course

    if updated && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  private

  def ping_remote_course
    return unless @settings.push_key

    result = Cikgo::ResourcesService.ping(@settings.push_key)
    @ping_status = result[:status]
    @remote_course_name = result[:name]
    @remote_course_url = result[:url]
  end

  def stories_settings_params
    params.require(:settings_stories_component).permit(:push_key, :title)
  end

  def component
    current_component_host[:course_stories_component]
  end
end
