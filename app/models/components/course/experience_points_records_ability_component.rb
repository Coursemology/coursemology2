module Course::ExperiencePointsRecordsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    # If administrators are not excluded, cancancan will throw an exception:
    # "Unable to merge an Active Record scope with other conditions..."
    if user && !user.administrator?
      allow_staff_manage_experience_points_records
      allow_staff_and_points_owner_read_experience_points_records
    end

    super
  end

  private

  def allow_staff_and_points_owner_read_experience_points_records
    accessible_records =
      Course::ExperiencePointsRecord.joins { course_user.course }.
      where do
        course_user.course_id.in(my { courses_with_user_as_approved_staff }) |
          (course_user.user_id == my { user.id })
      end

    can :read, Course::ExperiencePointsRecord, accessible_records do |record|
      course_user = get_course_user(record)
      course_user && ((course_user.id == record.course_user_id) || approved_staff(course_user))
    end
  end

  def allow_staff_manage_experience_points_records
    accessible_records =
      Course::ExperiencePointsRecord.
      joins { course_user.course }.
      where { course_user.course_id.in(my { courses_with_user_as_approved_staff }) }

    can [:create, :update, :destroy], Course::ExperiencePointsRecord, accessible_records do |record|
      course_user = get_course_user(record)
      course_user && approved_staff(course_user)
    end
  end

  def get_course_user(record)
    user.course_users.find_by(course_id: record.course_user.course_id)
  end

  def approved_staff(course_user)
    course_user.staff? && course_user.workflow_state == 'approved'
  end

  def courses_with_user_as_approved_staff
    user.course_users.staff.with_approved_state.select(:course_id)
  end
end
