# frozen_string_literal: true
namespace :db do
  task migrate_email_settings: :environment do
    def create_default_email_settings(course)
      default_email_settings = Course::Settings::Email::DEFAULT_EMAIL_COURSE_SETTINGS
      default_email_assessment_settings = Course::Settings::Email::DEFAULT_EMAIL_COURSE_ASSESSMENT_SETTINGS
      new_email_settings = []

      default_email_settings.each do |default_email_setting|
        component = default_email_setting.keys[0]
        setting = default_email_setting[component]
        new_email_settings << Course::Settings::Email.new(
          course_id: course.id,
          component: component,
          setting: setting,
          phantom: true,
          regular: true
        )
      end

      course.assessment_categories.find_each do |assessment_cat|
        default_email_assessment_settings.each do |default_email_setting|
          component = default_email_setting.keys[0]
          setting = default_email_setting[component]
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

    ActsAsTenant.without_tenant do
      Course::Settings::Email.delete_all
      Course.find_each do |course|
        create_default_email_settings(course)
        setting_emails = course.setting_emails

        # each element of setting mapping contains [[old_component, old setting], [new_component, new_setting]]
        setting_mapping = [[[:course_announcements_component, :new_announcement], [:announcements, :new_announcement]],
                           [[:course_forums_component, :topic_created], [:forums, :new_topic]],
                           [[:course_forums_component, :post_replied], [:forums, :post_replied]],
                           [[:course_survey_component, :survey_opening], [:surveys, :opening_reminder]],
                           [[:course_survey_component, :survey_closing], [:surveys, :closing_reminder]],
                           [[:course_users_component, :new_enrol_request], [:users, :new_enrol_request]],
                           [[:course_videos_component, :video_opening], [:videos, :opening_reminder]],
                           [[:course_videos_component, :video_closing], [:videos, :closing_reminder]]]

        setting_mapping.each do |item|
          enabled = course.settings(item[0][0], :emails, item[0][1]).enabled
          next unless enabled == false

          setting_emails.
            where(component: item[1][0], setting: item[1][1]).
            first.
            update!(phantom: false, regular: false)
        end

        # Assessment
        course.assessment_categories.find_each do |assessment_cat|
          assessment_cat_id = assessment_cat.id
          assessment_setting_mapping = [[:assessment_opening, :opening_reminder],
                                        [:assessment_closing, :closing_reminder],
                                        [:grades_released, :grades_released],
                                        [:new_comment, :new_comment],
                                        [:new_submission, :new_submission]]
          assessment_setting_mapping.each do |item|
            enabled = course.settings(:course_assessments_component, assessment_cat_id.to_s, :emails, item[0]).enabled
            next unless enabled == false

            setting_emails.
              where(component: :assessments, course_assessment_category_id: assessment_cat_id, setting: item[1]).
              first.
              update!(phantom: false, regular: false)
          end
        end
      end
    end
  end
end
