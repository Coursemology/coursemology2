class MigrateGradedSubmissionsToPublished < ActiveRecord::Migration[4.2]
  def up
    Course::Assessment::Submission.where(workflow_state: 'graded').
      update_all(workflow_state: 'published')
  end
end
