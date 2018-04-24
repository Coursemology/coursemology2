class RemoveDisbursementComponentSettings < ActiveRecord::Migration[5.1]
  def up
    # Although CoursesComponent has been renamed to SettingsComponent,
    # we don't need a migration because the component cannot be disabled,
    # so no setting for it is persisted under courses settings.

    # PointsDisburementComponent has been renamed at ExperiencePointsComponent.
    # Since it is much more generic now, we remove the setting which leaves
    # it enabled by default.
    ActsAsTenant.without_tenant do
      Course.all.each do |course|
        course.settings(:components).course_points_disbursement_component = nil
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
