class AddAwardedAtAndDraftExpToCourseExperiencePointsRecords < ActiveRecord::Migration[4.2]
  def change
    add_column :course_experience_points_records, :draft_points_awarded, :integer
    add_column :course_experience_points_records, :awarded_at, :datetime
    add_column :course_experience_points_records, :awarder_id, :integer,
               foreign_key: { references: :users }

    Course::Assessment::Submission.joins(:experience_points_record).
      where(workflow_state: ['attempting', 'submitted', 'graded']).find_each do |submission|

      # Shift exp to draft exp
      points_awarded = submission.points_awarded
      submission.experience_points_record.update_columns(
        draft_points_awarded: points_awarded, points_awarded: nil
      )
    end

    Course::Assessment::Submission.joins(:experience_points_record).
      where(workflow_state: 'published').find_each do |submission|

      # Update awarded_at and awarder_id
      awarded_at = submission.experience_points_record.updated_at
      awarder_id = submission.experience_points_record.updater_id
      submission.experience_points_record.update_columns(
        awarded_at: awarded_at, awarder_id: awarder_id
      )
    end
  end
end
