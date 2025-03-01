# frozen_string_literal: true
class Course::Forum::ImportingJob < ApplicationJob
  include TrackableJob
  queue_as :lowest

  protected

  def perform_tracked(forum_import_ids, current_user)
    forum_imports = Course::Forum::Import.where(id: forum_import_ids)
    # to immediately update workflow state for frontend tracking
    forum_imports.update_all(workflow_state: 'importing')

    ActiveRecord::Base.transaction do
      forum_imports.each do |forum_import|
        forum_import.build_discussions(current_user)
      end
      forum_imports.update_all(workflow_state: 'imported')
    end
  rescue StandardError => e
    forum_imports.update_all(workflow_state: 'not_imported')
    # re-raise error to make the job have an error
    raise e
  end
end
