# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::CoursesController, type: :controller do
  let(:instance) { Instance.default }
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

    describe '#index' do
      context 'when there is no user logged in' do
        it 'allows unauthenticated access' do
          get :index
          expect(response).to be_successful
        end
      end

      context 'when the user is logged in' do
        let(:user) { create(:administrator) }

        it 'allows access' do
          sign_in(user)
          get :index
          expect(response).to be_successful
        end
      end
    end
  end
end
