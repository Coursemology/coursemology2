# frozen_string_literal: true
class Course::Material::TextChunkJob < ApplicationJob
  include TrackableJob
  queue_as :default

  protected

  def perform_tracked(material_ids, current_user)
    materials = Course::Material.where(id: material_ids)
    materials.update_all(workflow_state: 'chunking')

    ActiveRecord::Base.transaction do
      materials.each do |material|
        material.build_text_chunks(current_user)
      end
      materials.update_all(workflow_state: 'chunked')
    end
  rescue StandardError => e
    materials.update_all(workflow_state: 'not_chunked')
    # re-raise error to make the job have an error
    raise e
  end
end
