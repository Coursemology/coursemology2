# frozen_string_literal: true
module Course::MaterialsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if course_user
      allow_show_materials
      allow_upload_materials
      allow_staff_read_materials if course_user.staff?
      allow_teaching_staff_manage_materials if course_user.teaching_staff?
      disallow_text_chunking if course_user.teaching_staff?
      manage_text_chunking if course_user.manager_or_owner?
    end

    disallow_superusers_change_root_and_linked_folders
    super
  end

  private

  def material_course_hash
    { folder: { course_id: course.id } }
  end

  def allow_show_materials
    if course_user.student?
      valid_materials_hashes.each do |properties|
        can :read, Course::Material, material_course_hash.deep_merge(properties)
      end

      opened_material_hashes.each do |properties|
        can [:read, :download],
            Course::Material::Folder, { course_id: course.id }.reverse_merge(properties)
      end
    end

    can :read_owner, Course::Material::Folder do |folder|
      # Different types of owners should define their own versions of `read_material`.
      folder.concrete? || can?(:read_material, folder.owner)
    end
  end

  def allow_upload_materials
    alias_action :upload_materials, to: :upload
    can :upload, Course::Material::Folder, { course_id: course.id }.
      reverse_merge(can_student_upload: true)
    can :manage, Course::Material, creator: user
  end

  def manage_text_chunking
    can :create_text_chunks, Course::Material, material_course_hash
    can :destroy_text_chunks, Course::Material, material_course_hash
  end

  def disallow_text_chunking
    cannot :create_text_chunks, Course::Material, material_course_hash
    cannot :destroy_text_chunks, Course::Material, material_course_hash
  end

  def allow_staff_read_materials
    can :read, Course::Material, material_course_hash
    can [:read, :download], Course::Material::Folder, { course_id: course.id }
  end

  def allow_teaching_staff_manage_materials
    can :manage, Course::Material, material_course_hash

    can :upload, Course::Material::Folder, { course_id: course.id }
    can :manage, Course::Material::Folder,
        { course_id: course.id }.reverse_merge(concrete_folder_hash)
  end

  def disallow_superusers_change_root_and_linked_folders
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
    max_start_at += course.advance_start_at_duration || 0 if course

    # Add materials with parent assessments that open early due to personalized timeline
    # Dealing with personal times is too complicated to represent as a hash of conditions
    # Instead, we eagerly fetch all the ids we want and return a trivial hash that matches these ids
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
