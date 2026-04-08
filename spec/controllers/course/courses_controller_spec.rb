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

    describe '#show' do
      run_rescue
      render_views

      let(:user) { create(:user) }
      let(:course) { create(:course, published: true) }
      subject { get :show, as: :json, params: { id: course } }

      context 'when the user is an active enrolled student' do
        before { controller_sign_in(controller, user) }
        let!(:course_user) { create(:course_student, course: course, user: user) }

        it { is_expected.to have_http_status(:ok) }

        it 'renders full course data' do
          subject
          expect(JSON.parse(response.body).dig('course', 'isSuspendedUser')).to be false
        end
      end

      context 'when the user is a suspended student' do
        before { controller_sign_in(controller, user) }
        let(:course) { create(:course, published: true, user_suspension_message: 'You are suspended.') }
        let!(:course_user) { create(:course_student, :suspended, course: course, user: user) }

        it { is_expected.to have_http_status(:ok) }

        it 'sets isSuspendedUser in the response body' do
          subject
          expect(JSON.parse(response.body).dig('course', 'isSuspendedUser')).to be true
        end

        it 'includes the suspension message in the response body' do
          subject
          expect(JSON.parse(response.body).fetch('course')).to have_key('userSuspensionMessage')
        end
      end

      context 'when the course is suspended and the user is a student' do
        before { controller_sign_in(controller, user) }
        let(:course) do
          create(
            :course,
            published: true,
            is_suspended: true,
            course_suspension_message: 'This course is suspended.'
          )
        end
        let!(:course_user) { create(:course_student, course: course, user: user) }

        it { is_expected.to have_http_status(:ok) }

        it 'sets isSuspended and isSuspendedUser in the response body' do
          subject
          course_data = JSON.parse(response.body).fetch('course')
          expect(course_data['isSuspended']).to be true
          expect(course_data['isSuspendedUser']).to be true
        end

        it 'includes the course suspension message in the response body' do
          subject
          expect(JSON.parse(response.body).fetch('course')).to have_key('courseSuspensionMessage')
        end
      end

      context 'when the course is suspended and the user is a manager' do
        before { controller_sign_in(controller, user) }
        let(:course) { create(:course, published: true, is_suspended: true) }
        let!(:course_user) { create(:course_manager, course: course, user: user) }

        it { is_expected.to have_http_status(:ok) }

        it 'sets isSuspended but not isSuspendedUser in the response body' do
          subject
          course_data = JSON.parse(response.body).fetch('course')
          expect(course_data['isSuspended']).to be true
          expect(course_data['isSuspendedUser']).to be false
        end
      end

      context 'when the user is not enrolled' do
        before { controller_sign_in(controller, user) }

        context 'when the course is published' do
          it { is_expected.to have_http_status(:ok) }
        end

        context 'when the course is not published' do
          let(:course) { create(:course, published: false) }

          it { is_expected.to have_http_status(:forbidden) }
        end
      end

      context 'when the user is not logged in' do
        context 'when the course is published' do
          it { is_expected.to have_http_status(:ok) }
        end

        context 'when the course is not published' do
          let(:course) { create(:course, published: false) }

          it { is_expected.to have_http_status(:unauthorized) }
        end
      end
    end

    describe '#index' do
      context 'when there is no user logged in' do
        it 'allows unauthenticated access' do
          get :index, as: :json
          expect(response).to be_successful
        end
      end

      context 'when the user is logged in' do
        let(:user) { create(:administrator) }

        it 'allows access' do
          controller_sign_in(controller, user)
          get :index, as: :json
          expect(response).to be_successful
        end
      end
    end
  end
end
