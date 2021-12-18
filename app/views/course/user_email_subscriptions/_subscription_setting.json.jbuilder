# frozen_string_literal: true
json.settings @email_settings do |email_setting|
  if (@course_user.phantom && email_setting.phantom) || (!@course_user.phantom && email_setting.regular)
    json.component email_setting.component
    json.component_title email_setting.title
    json.course_assessment_category_id email_setting.course_assessment_category_id
    json.setting email_setting.setting
    json.enabled !@unsubscribed_course_settings_email_id.include?(email_setting.id)
  end
end
json.subscription_page_filter do
  json.show_all_settings @show_all_settings
  json.component params['component']
  json.category_id params['category_id']
  json.setting params['setting']
  json.unsubscribe_successful @unsubscribe_successful if @unsubscribe_successful
end
