FactoryGirl.define do
  factory :course_material_folder, class: Course::Material::Folder.name, aliases: [:folder] do
    course
    sequence(:name) { |n| "Folder #{n}" }
    sequence(:description) { |n| "Folder Description #{n}" }
    start_at Time.zone.now
    end_at 3.days.from_now
  end
end
