require 'rails_helper'

RSpec.describe Course::CoursesController, type: :controller do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    describe '#recent_activities' do
      before do
        Notification.notify(nil, course, nil, activity: :created, types: [:activity_feed])
        Notification.notify(nil, course, nil, activity: :created, types: [:activity_feed])
      end

      it 'returns recent activities' do
        get(:show, id: course.id)
        expect(controller.recent_activities(course).count).to eq(2)
        expect(controller.recent_activities(course, count: 1).count).to eq(1)
      end
    end
  end
end
