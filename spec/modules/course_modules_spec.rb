require 'rails_helper'

RSpec.describe 'Course Modules', type: :controller do
  EXPECTED_SIDEBAR_ITEM = {
    title: 'DummyCourseModule',
    unread: -1
  }

  controller(Course::ModuleController) do
  end

  class DummyCourseModule
    include Course::CoursesController::Module

    sidebar do
      [EXPECTED_SIDEBAR_ITEM]
    end
  end

  it 'gathers all modules\' sidebar callbacks' do
    expect(controller.sidebar).to include(EXPECTED_SIDEBAR_ITEM)
  end
end
