class AddSkippableToAssessments < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessments, :skippable, :boolean, default: false
    # Set all autograded worksheet assessments to skippable
    Course::Assessment.where(mode: 0, autograded: true).update_all(skippable: true)
  end
end
