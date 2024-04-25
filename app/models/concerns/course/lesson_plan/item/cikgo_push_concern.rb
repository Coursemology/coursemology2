# frozen_string_literal: true
module Course::LessonPlan::Item::CikgoPushConcern
  extend ActiveSupport::Concern
  include Rails.application.routes.url_helpers
  include Cikgo::PushableItemConcern

  included do
    after_create_commit -> { push(:create) }, if: -> { published? }
    after_update_commit -> { push(:create) }, if: -> { saved_change_to_published? && published? }

    after_update_commit -> { push(:delete) }, if: -> { saved_change_to_published? && !published? }
    after_destroy_commit -> { push(:delete) }, if: -> { published? }

    after_update_commit -> { push(:update) }, if: (lambda do
      published? && (saved_change_to_title? || saved_change_to_description?)
    end)
  end

  private

  def create_payload
    kind = actable.class.name.demodulize

    {
      kind: kind,
      name: title,
      description: description,
      url: send("course_#{kind.underscore}_url", course_id, actable_id, host: course.instance.host, protocol: :https)
    }
  end

  def delete_payload
    {}
  end

  def update_payload
    {
      name: title,
      description: description
    }
  end

  def push(method)
    return unless pushable?(actable) && course.component_enabled?(Course::StoriesComponent)

    Cikgo::ResourcesService.push_resources(course, [{ method: method, id: id.to_s }.merge(send("#{method}_payload"))])
  rescue StandardError
    Rails.env.production? ? return : raise
  end
end
