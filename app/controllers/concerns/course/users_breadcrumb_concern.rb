# frozen_string_literal: true
module Course::UsersBreadcrumbConcern
  extend ActiveSupport::Concern

  included do
    add_breadcrumb I18n.t('breadcrumbs.course.users.index'), :course_users_path
  end
end
