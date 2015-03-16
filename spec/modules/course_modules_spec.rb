require 'rails_helper'

RSpec.describe 'Course Modules', type: :controller do
  EXPECTED_SIDEBAR_ITEM = {
    title: 'DummyCourseModule',
    unread: -1
  }

  EXPECTED_SETTINGS_ITEM = {
    title: 'DummyCourseModule',
    controller: :course_settings,
    action: :index
  }

  controller(Course::ModuleController) do
  end

  class DummyCourseModule
    include Course::CoursesController::Module

    sidebar do
      [EXPECTED_SIDEBAR_ITEM]
    end

    settings do
      [EXPECTED_SETTINGS_ITEM]
    end
  end

  it 'gathers all modules\' sidebar callbacks' do
    expect(controller.sidebar).to include(EXPECTED_SIDEBAR_ITEM)
  end

  it 'gathers all modules\' settings callback' do
    expect(controller.settings).to include(EXPECTED_SETTINGS_ITEM)
  end
end
