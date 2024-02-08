# frozen_string_literal: true
class Course::Admin::StoriesSettingsController < Course::Admin::Controller
  EXPORTABLE_LESSON_PLAN_ITEM_TYPES = ['Assessment', 'Video', 'Survey'].to_set

  before_action :ping_remote_course, only: [:edit]

  def edit
    # TODO: Remove this
    push_lesson_plan_items_to_remote_course
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

  def should_push_lesson_plan_item?(item)
    actable = item.actable
    kind = actable.class.name.demodulize
    EXPORTABLE_LESSON_PLAN_ITEM_TYPES.include?(kind) && item.published?
  end

  def push_lesson_plan_items_to_remote_course
    repository = {}
    repository[:id] = "coursemology##{current_course.id}"
    repository[:name] = current_course.title
    repository[:sourceUrl] = course_url(current_course)
    repository[:resources] = []

    current_course.lesson_plan_items.includes(:actable).each do |item|
      actable = item.actable
      kind = actable.class.name.demodulize
      next unless should_push_lesson_plan_item?(item)

      repository[:resources] << {
        id: item.id.to_s,
        kind: kind,
        name: item.title,
        description: item.description,
        url: send("course_#{kind.underscore}_url", current_course, actable)
      }
    end

    CikgoApiService.push(@settings.push_key, repository)
  end

  def ping_remote_course
    result = CikgoApiService.ping(@settings.push_key)
    @ping_status = result[:status]
    @remote_course_name = result[:name]
    @remote_course_url = result[:url]
  end

  def stories_settings_params
    params.require(:settings_stories_component).permit(:push_key)
  end

  def component
    current_component_host[:course_stories_component]
  end
end
