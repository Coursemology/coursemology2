require 'rails_helper'

RSpec.describe 'Course Modules', type: :controller do
  NORMAL_SIDEBAR_ITEM = {
    key: :normal_item,
    title: 'DummyCourseModule',
    type: :normal,
    weight: 1,
    unread: -1
  }

  ADMIN_SIDEBAR_ITEM = {
    key: :admin_item,
    title: 'DummyCourseModule',
    type: :admin,
    weight: 10,
    unread: -1
  }

  SETTINGS_SIDEBAR_ITEM = {
    title: 'DummyCourseModule',
    type: :settings,
    controller: :'course/admin/admin',
    action: :index,
    weight: 1
  }

  controller(Course::ComponentController) do
  end

  class DummyCourseModule
    include Course::ComponentHost::Component

    def initialize(*)
    end

    def sidebar_items
      [NORMAL_SIDEBAR_ITEM, ADMIN_SIDEBAR_ITEM, SETTINGS_SIDEBAR_ITEM]
    end
  end

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { allow(controller).to receive(:current_course).and_return(course) }

    it 'gathers all modules\' sidebar callbacks' do
      expect(controller.sidebar_items(type: :normal)).to include(NORMAL_SIDEBAR_ITEM)
      expect(controller.sidebar_items(type: :normal)).not_to include(ADMIN_SIDEBAR_ITEM)
      expect(controller.sidebar_items(type: :normal)).not_to include(SETTINGS_SIDEBAR_ITEM)
      expect(controller.sidebar_items(type: :admin)).to include(ADMIN_SIDEBAR_ITEM)
      expect(controller.sidebar_items(type: :admin)).not_to include(NORMAL_SIDEBAR_ITEM)
      expect(controller.sidebar_items(type: :admin)).not_to include(SETTINGS_SIDEBAR_ITEM)
      expect(controller.sidebar_items(type: :settings)).to include(SETTINGS_SIDEBAR_ITEM)
      expect(controller.sidebar_items(type: :settings)).not_to include(ADMIN_SIDEBAR_ITEM)
      expect(controller.sidebar_items(type: :settings)).not_to include(NORMAL_SIDEBAR_ITEM)
    end
  end
end
