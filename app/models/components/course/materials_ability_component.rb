module Course::MaterialsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_students_show_materials
      allow_students_upload_materials
      allow_staff_manage_materials
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

  def allow_students_show_materials
    valid_materials_hashes.each do |properties|
      can :read, Course::Material, material_all_course_users_hash.deep_merge(properties)
    end

    currently_valid_hashes.each do |properties|
      can :read, Course::Material::Folder, course_all_course_users_hash.reverse_merge(properties)
    end
  end

  def allow_students_upload_materials
    alias_action :new_materials, :upload_materials, to: :upload
    can :upload, Course::Material::Folder, course_all_course_users_hash.
      reverse_merge(can_student_upload: true)
    can :manage, Course::Material, creator: user
  end

  def allow_staff_manage_materials
    can :read, Course::Material, material_course_staff_hash
    can :manage, Course::Material, material_course_staff_hash.deep_merge(concrete_material_hash)

    can :read, Course::Material::Folder, course_staff_hash
    can :manage, Course::Material::Folder, course_staff_hash.reverse_merge(concrete_folder_hash)
    # Root folders are not editable
    cannot [:create, :edit, :destroy], Course::Material::Folder, parent: nil
  end

  def valid_materials_hashes
    currently_valid_hashes.map do |valid_time_hash|
      { folder: valid_time_hash }
    end
  end

  def concrete_folder_hash
    # Linked folders(folders with owners) are not manageable
    { owner_id: nil }
  end

  def concrete_material_hash
    { folder: { owner_id: nil } }
  end
end
