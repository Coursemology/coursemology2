require 'rails_helper'

RSpec.describe Course::EnrolRequestsController, :type => :controller do
  before do
    ActsAsTenant.current_tenant = Instance.default
  end

  let!(:user) { create(:user) }
  let!(:course) { create(:course, status: :opened) }
  let!(:student_request) {create(:course_enrol_request, course: course, user: create(:user),
                                 role: :student)}
  let!(:staff_request) {create(:course_enrol_request, course: course, user: create(:user),
                               role: :teaching_assistant)}

  describe '#index' do
    context 'user can manage the course' do
      before do
        student_request
        staff_request
        sign_in(create(:administrator))
      end

      context 'request html' do
        subject { get :index, course_id: course.id }
        it 'renders index template' do
          subject
          expect(response).to render_template(:index)
          expect(assigns(:student_requests)).to contain_exactly(student_request)
          expect(assigns(:staff_requests)).to contain_exactly(staff_request)
        end
      end

      context 'request json' do
        subject { get :index, format: 'json', course_id: course.id }
        it 'renders index json' do
          subject
          expect(response).to have_http_status(:ok)
        end
      end
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

  describe '#approve_seleced' do
    before do
      sign_in(create(:administrator))
    end

    context 'existing enrol request' do
      subject { get :approve_selected, format: 'json', course_id: course.id,
                    enrol_request_ids: [student_request.id] }

      it 'creates a course_user and destroy the enrol request' do
        expect{ subject }.to change(CourseUser, :count).by(1).and change(Course::EnrolRequest,
                                                                         :count).by(-1)
        expect(response).to have_http_status(:ok)
      end
    end

    context 'non-existing enrol request' do
      subject { get :approve_selected, format: 'json', course_id: course.id,
                    enrol_request_ids: [student_request.id * 10]}

      it 'responds with bad request status' do
        expect{ subject }.to change(CourseUser, :count).by(0).and change(Course::EnrolRequest,
                                                                         :count).by(0)
        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe '#delete_selected' do
    subject { get :delete_selected, format: 'json', course_id: course.id,
                  enrol_request_ids: [student_request.id] }

    before do
      sign_in(create(:administrator))
    end

    it 'destroys the enrol request' do
      expect{ subject }.to change(CourseUser, :count).by(0).and change(Course::EnrolRequest,
                                                                       :count).by(-1)
      expect(response).to have_http_status(:ok)
    end
  end
end
