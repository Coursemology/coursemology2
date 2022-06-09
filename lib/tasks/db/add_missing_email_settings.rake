# frozen_string_literal: true
namespace :db do
  task add_missing_email_settings: :environment do
    def create_default_email_settings(category_ids)
      assessment_categories = Course::Assessment::Category.where(id: category_ids)
      assessment_categories.each do |assessment_cat|
        default_email_settings = [{ assessments: :opening_reminder },
                                  { assessments: :closing_reminder },
                                  { assessments: :closing_reminder_summary },
                                  { assessments: :grades_released },
                                  { assessments: :new_comment },
                                  { assessments: :new_submission }]

        default_email_settings.each do |default_email_setting|
          component = default_email_setting.keys[0]
          setting = default_email_setting[component]
          assessment_cat.setting_emails.create!(course: assessment_cat.course, component: component, setting: setting)
        end
      end
    end

    ActsAsTenant.without_tenant do
      connection = ActiveRecord::Base.connection
      assessment_categories_with_missing_email_settings = connection.exec_query(<<-SQL)
        SELECT cac.id FROM course_assessment_categories cac
        LEFT JOIN course_settings_emails cse
        ON cac.id = cse.course_assessment_category_id
        WHERE cse.id IS NULL
      SQL
      assessment_category_ids = assessment_categories_with_missing_email_settings.pluck('id')
      create_default_email_settings(assessment_category_ids)
    end
  end
end
