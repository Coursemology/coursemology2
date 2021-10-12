# frozen_string_literal: true
namespace :db do
  task migrate_email_settings: :environment do
    def create_default_email_settings(course)
      default_email_settings = [{ announcements: :new_announcement },
                                { forums: :new_topic },
                                { forums: :post_replied },
                                { surveys: :opening_reminder },
                                { surveys: :closing_reminder },
                                { surveys: :closing_reminder_summary },
                                { videos: :opening_reminder },
                                { videos: :closing_reminder },
                                { users: :new_enrol_request }]

      default_email_settings.each do |default_email_setting|
        component = default_email_setting.keys[0]
        setting = default_email_setting[component]
        course.setting_emails.create!(component: component, setting: setting)
      end

      course.assessment_categories.find_each do |assessment_cat|
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
