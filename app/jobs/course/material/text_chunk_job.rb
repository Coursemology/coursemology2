# frozen_string_literal: true
class Course::Material::TextChunkJob < ApplicationJob
  include TrackableJob
  queue_as :default

  protected

  def perform_tracked(material, current_user)
    material.build_text_chunks(current_user)
    material.finish_chunking!
    material.save!
  rescue StandardError => e
    material.cancel_chunking!
    material.save!
    # re-raise error to make the job have an error
    raise e
  end
end
