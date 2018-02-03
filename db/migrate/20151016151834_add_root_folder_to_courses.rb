# frozen_string_literal: true
class AddRootFolderToCourses < ActiveRecord::Migration[4.2]
  # Create root folders for existing courses
  def up
    all_courses = exec_query('SELECT * FROM courses')
    valid_course_ids = exec_query(
      'SELECT course_id
       FROM course_material_folders
       WHERE parent_id IS NULL'
    ).map { |r| r['course_id'] }

    invalid_courses = all_courses.select { |c| !valid_course_ids.include?(c['id']) }
    invalid_courses.each do |course|
      execute(
        "INSERT INTO course_material_folders
                     (course_id,
                      name,
                      start_at,
                      creator_id,
                      updater_id,
                      created_at,
                      updated_at)
         VALUES      (#{course['id']},
                      'Root',
                      '#{Time.zone.now.to_s(:db)}',
                      #{course['creator_id']},
                      #{course['updater_id']},
                      '#{Time.zone.now.to_s(:db)}',
                      '#{Time.zone.now.to_s(:db)}')"
      )
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
