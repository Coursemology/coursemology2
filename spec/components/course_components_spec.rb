require 'rails_helper'

RSpec.describe 'Course Modules', type: :controller do
  NORMAL_SIDEBAR_ITEM = {
    title: 'DummyCourseModule',
    type: :normal,
    unread: -1
  }

  ADMIN_SIDEBAR_ITEM = {
    title: 'DummyCourseModule',
    type: :admin,
    unread: -1
  }

  EXPECTED_SETTINGS_ITEM = {
    title: 'DummyCourseModule',
    controller: :'course/admin/admin',
    action: :index
  }

  controller(Course::ComponentController) do
  end

  class DummyCourseModule
    include Course::ComponentHost::Component

    sidebar do
      [NORMAL_SIDEBAR_ITEM, ADMIN_SIDEBAR_ITEM]
    end

    settings do
      [EXPECTED_SETTINGS_ITEM]
    end
  end

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { allow(controller).to receive(:current_course).and_return(course) }

    it 'gathers all modules\' sidebar callbacks' do
      expect(controller.sidebar(:normal)).to include(NORMAL_SIDEBAR_ITEM)
      expect(controller.sidebar(:normal)).not_to include(ADMIN_SIDEBAR_ITEM)
      expect(controller.sidebar(:admin)).to include(ADMIN_SIDEBAR_ITEM)
      expect(controller.sidebar(:admin)).not_to include(NORMAL_SIDEBAR_ITEM)
    end

    it 'gathers all modules\' settings callback' do
      expect(controller.settings).to include(EXPECTED_SETTINGS_ITEM)
    end
  end
end
