module Course::MaterialsAbilityComponent
  include AbilityHost::Component

  def define_permissions
    if user
      allow_students_show_materials
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

  def valid_materials_hashes
    currently_valid_hashes.map do |valid_time_hash|
      { folder: valid_time_hash }
    end
  end
end
