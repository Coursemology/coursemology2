# frozen_string_literal: true
module Course::LessonPlan::Item::GeniePushConcern
  extend ActiveSupport::Concern
  include Rails.application.routes.url_helpers

  included do
    after_create :push_create, if: -> { published? }
    after_update :push_create, if: -> { saved_change_to_published? && published? }

    after_update :push_destroy, if: -> { saved_change_to_published? && !published? }
    after_destroy :push_destroy

    after_update :push_update, if: -> { saved_change_to_title? || saved_change_to_description? }
  end

  private

  def push_create
    kind = actable.class.name.demodulize

    push_item(:create, {
      kind: kind,
      name: title,
      description: description,
      url: send("course_#{kind.underscore}_url", course_id, actable_id)
    })
  end

  def push_destroy
    push_item(:delete)
  end

  def push_update
    push_item(:update, {
      name: title,
      description: description
    })
  end

  def push_item(method, item = {})
    GenieApiService.push_item(push_key, {
      id: repository_id,
      resources: [{ method: method, id: id.to_s }.merge(item)]
    })
  end

  def repository_id
    "coursemology##{course.id}"
  end

  def push_key
    stories_settings = course.settings.course_stories_component
    return unless stories_settings

    stories_settings['push_key']
  end
end
