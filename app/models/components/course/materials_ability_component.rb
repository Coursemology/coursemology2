# frozen_string_literal: true
module Course::MaterialsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_students_show_materials
      allow_students_upload_materials
      allow_staff_read_materials
      allow_teaching_staff_manage_materials
    end

    super
  end

  private

  def material_all_course_users_hash
    { folder: course_all_course_users_hash }
  end

  def material_course_staff_hash
    { folder: course_staff_hash }
  end

  def material_course_teaching_staff_hash
    { folder: course_teaching_staff_hash }
  end

  def allow_students_show_materials
    valid_materials_hashes.each do |properties|
      can :read, Course::Material, material_all_course_users_hash.deep_merge(properties)
    end

    opened_material_hashes.each do |properties|
      can [:read, :download],
          Course::Material::Folder, course_all_course_users_hash.reverse_merge(properties)
    end

    can :read_owner, Course::Material::Folder do |folder|
      # Different types of owners should define their own versions of `read_material`.
      folder.concrete? || can?(:read_material, folder.owner)
    end
  end

  def allow_students_upload_materials
    alias_action :new_materials, :upload_materials, to: :upload
    can :upload, Course::Material::Folder, course_all_course_users_hash.
      reverse_merge(can_student_upload: true)
    can :manage, Course::Material, creator: user
  end

  def allow_staff_read_materials
    can :read, Course::Material, material_course_staff_hash
    can [:read, :download], Course::Material::Folder, course_staff_hash
  end

  def allow_teaching_staff_manage_materials
    can :manage, Course::Material, material_course_teaching_staff_hash

    can :upload, Course::Material::Folder, course_teaching_staff_hash
    can :manage, Course::Material::Folder,
        course_teaching_staff_hash.reverse_merge(concrete_folder_hash)
    # Do not allow admin to edit linked folders
    cannot [:update, :destroy], Course::Material::Folder do |folder|
      folder.owner_id.present?
    end
    # Root folders are not editable
    cannot [:create, :update, :destroy], Course::Material::Folder, parent: nil
  end

  def valid_materials_hashes
    opened_material_hashes.map do |valid_time_hash|
      { folder: valid_time_hash }
    end
  end

  def concrete_folder_hash
    # Linked folders(folders with owners) are not manageable
    { owner_id: nil }
  end

  # Involve Course#advance_start_at_duration when calculating the start_at time.
  def opened_material_hashes
    max_start_at = Time.zone.now
    # Extend start_at time with self directed time from course settings.
    max_start_at += (course.advance_start_at_duration || 0) if course

    # Add materials with parent assessments that open early due to personalized timeline
    # Dealing with personal times is too complicated to represent as a hash of conditions
    # Instead, we eagerly fetch all the ids we want and return a trivial hash that matches these ids
    course_user = user && course && course.course_users.find_by(user: user)
    personal_times_opened_folder_hash =
      course_user &&
      {
        id: Course::Material::Folder.where(
          owner_type: Course::Assessment.name,
          owner_id: Course::LessonPlan::Item.where(
            id: course_user.personal_times.where(start_at: (Time.min..max_start_at)).select(:lesson_plan_item_id),
            actable_type: Course::Assessment.name
          ).select(:actable_id)
        ).select(:id).pluck(:id)
      }

    [
      {
        start_at: (Time.min..max_start_at),
        end_at: nil
      },
      {
        start_at: (Time.min..max_start_at),
        end_at: (Time.zone.now..Time.max)
      },
      personal_times_opened_folder_hash
    ].compact
  end
end
