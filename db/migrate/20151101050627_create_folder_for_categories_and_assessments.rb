# frozen_string_literal: true
class CreateFolderForCategoriesAndAssessments < ActiveRecord::Migration[4.2]
  def up
    # Create folders for categories
    categories_without_folder = exec_query(<<-SQL)
      SELECT c.*
      FROM course_assessment_categories c
      LEFT OUTER JOIN course_material_folders f
        ON c.id = f.owner_id AND f.owner_type = 'Course::Assessment::Category'
      WHERE f.owner_id is NULL
    SQL

    categories_without_folder.each do |category|
      # Set parent folder to course.root_folder
      parent_folder = exec_query(<<-SQL).first
        SELECT f.id
        FROM course_material_folders f
        WHERE f.course_id = #{category['course_id']}
          AND f.parent_id IS NULL LIMIT 1
      SQL

      execute(<<-SQL)
        INSERT INTO course_material_folders
                     (course_id,
                      parent_id,
                      owner_id,
                      owner_type,
                      name,
                      start_at,
                      creator_id,
                      updater_id,
                      created_at,
                      updated_at)
         VALUES      (#{category['course_id']},
                      #{parent_folder['id']},
                      #{category['id']},
                      'Course::Assessment::Category',
                      #{quote(category['title'])},
                      NOW(),
                      #{category['creator_id']},
                      #{category['updater_id']},
                      NOW(),
                      NOW())
      SQL
    end

    # Create folders for assessments
    assessments_without_folder = exec_query(<<-SQL)
      SELECT a.*, i.title, i.course_id
      FROM course_assessments a
      INNER JOIN course_lesson_plan_items i
        ON i.actable_id = a.id AND i.actable_type = 'Course::Assessment'
      LEFT OUTER JOIN course_material_folders f
        ON a.id = f.owner_id AND f.owner_type = 'Course::Assessment'
      WHERE f.owner_id IS NULL
    SQL

    assessments_without_folder.each do |assessment|
      # Set parent folder to assessment.tab.category.folder
      parent_folder = exec_query(<<-SQL).first
        SELECT f.id
        FROM course_material_folders f
        INNER JOIN course_assessment_categories c
          ON c.id = f.owner_id AND f.owner_type = 'Course::Assessment::Category'
        INNER JOIN course_assessment_tabs t
          ON t.category_id = c.id
        WHERE t.id = #{assessment['tab_id']} LIMIT 1
      SQL

      execute(<<-SQL)
        INSERT INTO course_material_folders
                     (course_id,
                      parent_id,
                      owner_id,
                      owner_type,
                      name,
                      start_at,
                      creator_id,
                      updater_id,
                      created_at,
                      updated_at)
         VALUES      (#{assessment['course_id']},
                      #{parent_folder['id']},
                      #{assessment['id']},
                      'Course::Assessment',
                      #{quote(assessment['title'])},
                      NOW(),
                      #{assessment['creator_id']},
                      #{assessment['updater_id']},
                      NOW(),
                      NOW())
      SQL
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
