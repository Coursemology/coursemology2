require 'rails_helper'

RSpec.describe Course::EnrolRequestsController, :type => :controller do
  before do
    ActsAsTenant.current_tenant = Instance.default
  end

  let!(:user) { create(:user) }
  let!(:course) { create(:course, status: :opened) }
  let!(:student_request) { create(:course_enrol_request, course: course, user: create(:user),
                                  role: :student) }
  let!(:student_request2) { create(:course_enrol_request, course: course, user: create(:user),
                                  role: :student) }
  let!(:staff_request) { create(:course_enrol_request, course: course, user: create(:user),
                                role: :teaching_assistant) }
  let!(:staff_request2) { create(:course_enrol_request, course: course, user: create(:user),
                                 role: :manager) }

  describe '#index' do
    context 'user can manage the course' do
      before do
        sign_in(create(:administrator))
      end

      context 'request html' do
        subject { get :index, course_id: course.id }
        it 'renders index template' do
          subject
          expect(response).to render_template(:index)
          expect(assigns(:student_requests)).to contain_exactly(student_request, student_request2)
          expect(assigns(:staff_requests)).to contain_exactly(staff_request, staff_request2)
        end
      end
    end
  end

  describe '#new' do
    subject { get :new, course_id: course, role: :student }

    context 'user is signed in' do
      before do
        sign_in(user)
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
          expect(flash[:error]).to match(I18n.t('course.enrol_requests.new.course_not_open'))
        end
      end

      context 'already registered' do
        before do
          create(:course_student, course: course, user: user)
        end

        it 'redirects to course page' do
          subject
          expect(response).to redirect_to(course_path(course))
          expect(flash[:error]).to(
            match(I18n.t('course.enrol_requests.new.already_registered_format') %
                    { role: :student }))

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

  describe '#process_multiple' do
    before do
      sign_in(create(:administrator))
    end

    context 'approve selected student' do
      subject { post :process_multiple, course_id: course.id, approve_selected_student: '',
                     enrol_request_ids: [student_request.id] }

      it 'creates a course user and destroy the enrol request' do
        expect{ subject }.to change(CourseUser, :count).by(1).and change(Course::EnrolRequest,
                                                                         :count).by(-1)
        expect(response).to redirect_to(course_enrol_requests_path(course))
        expect(flash[:notice]).to match(I18n.t('course.enrol_requests.approve_message_format') %
                                          { count: 1 })
      end
    end

    context 'delete selected student' do
      subject { get :process_multiple, course_id: course.id, delete_selected_studenet: '',
                    enrol_request_ids: [student_request.id] }

      it 'destroys the enrol request' do
        expect{ subject }.to change(CourseUser, :count).by(0).and change(Course::EnrolRequest,
                                                                         :count).by(-1)
        expect(response).to redirect_to(course_enrol_requests_path(course))
        expect(flash[:notice]).to match(I18n.t('course.enrol_requests.delete_message_format') %
                                          { count: 1 })
      end
    end

    context 'approve all student' do
      subject { post :process_multiple, course_id: course.id, approve_all_student: '' }

      it 'create course users for all student enrol requests and destroy the requests' do
        expect{ subject }.to change(CourseUser, :count).by(2).and change(Course::EnrolRequest,
                                                                         :count).by(-2)
        expect(response).to redirect_to(course_enrol_requests_path(course))
        expect(flash[:notice]).to match(I18n.t('course.enrol_requests.approve_message_format') %
                                          { count: 2 })
      end
    end

    context 'approve all staff' do
      subject { post :process_multiple, course_id: course.id, approve_all_staff: '' }

      it 'create course users for all staff enrol requests and destroy the requests' do
        expect{ subject }.to change(CourseUser, :count).by(2).and change(Course::EnrolRequest,
                                                                         :count).by(-2)
        expect(response).to redirect_to(course_enrol_requests_path(course))
        expect(flash[:notice]).to match(I18n.t('course.enrol_requests.approve_message_format') %
                                          { count: 2 })
      end
    end
  end

end
