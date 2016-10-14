class MigrateGradedSubmissionsToPublished < ActiveRecord::Migration
  def up
    Course::Assessment::Submission.where(workflow_state: 'graded').
      update_all(workflow_state: 'published')
  end
end
