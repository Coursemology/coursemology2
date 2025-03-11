# frozen_string_literal: true
module Course::LessonPlan::Item::CikgoPushConcern
  extend ActiveSupport::Concern
  include Rails.application.routes.url_helpers
  include Cikgo::PushableItemConcern

  included do
    after_save :persist_dirty_states

    # We use `after_commit`s for these because we want to only push after the transaction succeeds.
    after_create_commit -> { push(:create) }, if: -> { published? }
    after_update_commit -> { push(:create) }, if: -> { @did_change_published && published? }

    after_update_commit -> { push(:delete) }, if: -> { @did_change_published && !published? }
    after_destroy_commit -> { push(:delete) }, if: -> { published? }

    after_update_commit -> { push(:update) }, if: (lambda do
      published? && (@did_change_title || @did_change_description)
    end)
  end

  private

  # We do this because these `saved_change_to_*?` are not available in `after_commit`. Presumably, the
  # dirty states have been replaced by the update to `updated_at`.
  def persist_dirty_states
    return unless saved_change_to_title? || saved_change_to_description? || saved_change_to_published?

    @did_change_title = saved_change_to_title?
    @did_change_description = saved_change_to_description?
    @did_change_published = saved_change_to_published?
  end

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

    Cikgo::ResourcesService.push_resources!(course, [{ method: method, id: id.to_s }.merge(send("#{method}_payload"))])
  rescue StandardError => e
    Rails.logger.error("Cikgo: Cannot push lesson plan item #{id}: #{e}")
    Rails.env.production? ? return : raise
  end
end
