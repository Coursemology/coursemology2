require 'rails_helper'

RSpec.describe Course::CoursesController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '#recent_activity_feeds' do
      let(:course) { create(:course) }
      let!(:activity_feeds) do
        create_list(:course_notification, 2, course: course, notification_type: :feed)
      end

      subject do
        allow(controller).to receive(:current_course).and_return(course)
        controller.recent_activity_feeds.count
      end

      it 'returns the count number of activity feeds' do
        is_expected.to eq(2)
      end
    end
  end
end
