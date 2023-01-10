# frozen_string_literal: true
namespace :db do
  task add_missing_email_settings: :environment do
    def create_default_assessment_email_settings(category_ids)
      assessment_categories = Course::Assessment::Category.where(id: category_ids)
      default_email_assessment_settings = Course::Settings::Email::DEFAULT_EMAIL_COURSE_ASSESSMENT_SETTINGS
      new_email_settings = []

      assessment_categories.each do |assessment_cat|
        default_email_assessment_settings.each do |default_email_assessment_setting|
          component = default_email_assessment_setting.keys[0]
          setting = default_email_assessment_setting[component]
          new_email_settings << Course::Settings::Email.new(
            course_id: assessment_cat.course_id,
            course_assessment_category_id: assessment_cat.id,
            component: component,
            setting: setting,
            phantom: true,
            regular: true
          )
        end
      end
      Course::Settings::Email.import! new_email_settings, validate: false
    end

    # Non-assessment
    def create_default_email_settings # rubocop:disable Metrics/MethodLength
      course_with_email_settings = Course.includes(:setting_emails).
                                   joins("LEFT JOIN course_settings_emails \
                                    ON course_settings_emails.course_id = courses.id \
                                    AND course_settings_emails.course_assessment_category_id IS NULL")
      default_email_settings = Course::Settings::Email::DEFAULT_EMAIL_COURSE_SETTINGS

      new_email_settings = []
      course_with_email_settings.each do |course|
        existing_email_settings = course.setting_emails.pluck(:component, :setting).map do |setting|
          setting.join('#')
        end.to_set
        default_email_settings.each do |default_email_setting|
          component = default_email_setting.keys[0]
          setting = default_email_setting[component]

          next if existing_email_settings.include?("#{component}##{setting}")

          new_email_settings << Course::Settings::Email.new(
            course_id: course.id,
            component: component,
            setting: setting,
            phantom: true,
            regular: true
          )
        end
      end
      Course::Settings::Email.import! new_email_settings, validate: false
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
      create_default_assessment_email_settings(assessment_category_ids)

      create_default_email_settings
    end
  end
end
