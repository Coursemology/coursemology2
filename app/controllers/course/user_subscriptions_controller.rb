# frozen_string_literal: true
class Course::UserSubscriptionsController < Course::ComponentController
  include Course::UsersBreadcrumbConcern

  load_resource :course_user, through: :course, id_param: :user_id

  before_action :add_breadcrumbs

  def edit # :nodoc:
    authorize!(:manage, Course::UserEmailUnsubscription.new(course_user: @course_user))
    load_subscription_settings
    respond_to do |format|
      format.html { render 'edit' }
      format.json { render partial: 'course/user_subscriptions/subscription_setting' }
    end
  end

  def update
    authorize!(:manage, Course::UserEmailUnsubscription.new(course_user: @course_user))
    update_subscription_setting
    load_subscription_settings
    render partial: 'course/user_subscriptions/subscription_setting'
  end

  private

  def add_breadcrumbs # :nodoc:
    add_breadcrumb @course_user.name, course_user_path(current_course, @course_user)
    add_breadcrumb :index
  end

  def email_setting_params
    params.require(:user_subscriptions).permit(:component, :course_assessment_category_id, :setting)
  end

  def subscription_params
    params.require(:user_subscriptions).permit(:enabled)
  end

  def email_setting_filter_params
    params.permit(:component, :course_assessment_category_id, :setting, :unsubscribe)
  end

  def update_subscription_setting
    email_setting = current_course.email_settings_with_enabled_components.where(email_setting_params).first
    if subscription_params['enabled'] == 'true' || subscription_params['enabled'] == true
      @course_user.email_unsubscriptions.where(course_settings_email_id: email_setting.id).first.destroy!
    else
      @course_user.email_unsubscriptions.create!(course_setting_email: email_setting)
    end
  end

  def load_subscription_settings
    @show_all_settings = true
    load_email_settings
    filter_subscription_settings if email_setting_filter_params['setting']
    unsubscribe if email_setting_filter_params['unsubscribe']
    @unsubscribed_course_settings_email_id = @course_user.email_unsubscriptions.pluck(:course_settings_email_id)
  end

  def load_email_settings
    @email_settings = if @course_user.student?
                        current_course.email_settings_with_enabled_components.student_setting
                      elsif @course_user.manager_or_owner?
                        current_course.email_settings_with_enabled_components.manager_setting
                      else
                        current_course.email_settings_with_enabled_components.teaching_staff_setting
                      end
    @email_settings = @email_settings.sorted_for_page_setting
  end

  def filter_subscription_settings
    @email_settings = if params['component']
                        @email_settings.where(component: params['component'],
                                              course_assessment_category_id: params['category_id'],
                                              setting: params['setting'])
                      else
                        # For consolidated emails, there are 3 different components (assessment, video and survey)
                        # As a result, we only pass opening_reminder through the params setting
                        @email_settings.where(setting: params['setting'])
                      end
    @show_all_settings = false
  end

  def unsubscribe
    @email_settings.find_each do |email_setting|
      @course_user.email_unsubscriptions.find_or_create_by(course_setting_email: email_setting)
    end
    @unsubscribe_successful = true
  end

  # @return [Course::UsersComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_users_component]
  end
end
