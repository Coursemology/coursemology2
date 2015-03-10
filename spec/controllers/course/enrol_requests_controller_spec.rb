require 'rails_helper'

RSpec.describe Course::EnrolRequestsController, :type => :controller do
  before do
    ActsAsTenant.current_tenant = Instance.default
  end

  let!(:course) { create(:course, status: :opened) }

  describe '#index' do
    subject { get :index, course_id: course }

    context 'user can manage the course' do
      it 'should render index template' do
        subject
        expect(response).to render_template(:index)
      end
    end

    context 'user cannot manage the course' do
      # TODO
    end
  end

  describe '#new' do
    subject { get :new, course_id: course, role: :student }

    context 'user is signed in' do
      before do
        sign_in(create(:user))
      end

      context 'course is open' do
        it 'creates a new request after first attempt' do
          subject
          expect(response).to render_template(:new)
        end
      end

      context 'course is closed' do
        before do
          course.status = :published
          course.save!
        end
        it 'redirects to course page' do
          subject
          expect(response).to redirect_to(course_path(course))
        end
      end
    end

    context 'user is not signed in' do
      it 'redirects user to sign in page' do
        subject
        expect(response).to redirect_to(new_user_session_path)
      end
    end
  end
end
