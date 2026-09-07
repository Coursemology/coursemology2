# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::AdminController do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { controller_sign_in(controller, user) }

    describe '#index' do
      subject { get :index, as: :json, params: { course_id: course } }

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it { is_expected.to render_template(:index) }
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#update' do
      let(:title) { 'New Title' }
      subject { patch :update, params: { course_id: course, course: { title: title }, format: :json } }

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it { is_expected.to render_template(:index) }

        it 'changes the title' do
          subject

          expect(course.reload.title).to eq(title)
        end
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#update withtime_offset' do
      let!(:initial_start_at) { course.start_at }
      let!(:assessment) { create(:assessment, course: course) }
      let!(:video) { create(:video, course: course) }
      let!(:survey) { create(:survey, course: course) }

      subject do
        patch :update,
              params: { course_id: course,
                        course: { start_at: initial_start_at + 1.day,
                                  time_offset: { days: 1, hours: 0, minutes: 0 } },
                        format: :json }
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it { is_expected.to render_template(:index) }

        it 'changes the start_at date and all the items dates' do
          assessment_initial_start_at = assessment.start_at
          video_initial_start_at = video.start_at
          survey_initial_start_at = survey.start_at

          subject

          expect(course.reload.start_at).to be_within(1.second).of initial_start_at + 1.day
          expect(assessment.reload.start_at).to be_within(1.second).of assessment_initial_start_at + 1.day
          expect(video.reload.start_at).to be_within(1.second).of video_initial_start_at + 1.day
          expect(survey.reload.start_at).to be_within(1.second).of survey_initial_start_at + 1.day
        end
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe 'model configuration authorization' do
      # The course creator is an owner, not an instance or system admin.
      let(:owner) { create(:course_owner, course: course).user }
      let(:instance_admin) do
        create(:user).tap { |u| u.instance_users.find_by(instance: instance).update!(role: :administrator) }
      end

      describe '#authorize_model_configuration' do
        subject { patch :authorize_model_configuration, params: { course_id: course } }

        context 'when the user is a System Administrator' do
          let(:user) { create(:administrator) }

          it 'opens the model settings to course staff' do
            subject
            expect(course.reload.is_model_configuration_authorized).to be true
          end
        end

        context 'when the user is an Instance Administrator' do
          # Deliberately not enough: the model settings are a system-level lever.
          let(:user) { instance_admin }

          it 'declines' do
            expect { subject }.to raise_exception(CanCan::AccessDenied)
            expect(course.reload.is_model_configuration_authorized).to be false
          end
        end

        context 'when the user is a Course Owner' do
          let(:user) { owner }

          it 'declines, so staff cannot grant themselves access' do
            expect { subject }.to raise_exception(CanCan::AccessDenied)
            expect(course.reload.is_model_configuration_authorized).to be false
          end
        end
      end

      describe '#revoke_model_configuration' do
        let(:course) { create(:course, is_model_configuration_authorized: true) }
        subject { patch :revoke_model_configuration, params: { course_id: course } }

        context 'when the user is a System Administrator' do
          let(:user) { create(:administrator) }

          it 'closes the model settings to course staff' do
            subject
            expect(course.reload.is_model_configuration_authorized).to be false
          end
        end

        context 'when the user is a Course Owner' do
          # Being granted access does not include the power to keep or extend it.
          let(:user) { owner }

          it 'declines' do
            expect { subject }.to raise_exception(CanCan::AccessDenied)
            expect(course.reload.is_model_configuration_authorized).to be true
          end
        end
      end
    end

    describe '#suspend' do
      subject { patch :suspend, params: { course_id: course } }

      context 'when the user is a Course Owner' do
        let(:user) { create(:course_owner, course: course).user }

        it 'suspends the course' do
          subject
          expect(course.reload.is_suspended).to be true
        end
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it 'suspends the course' do
          subject
          expect(course.reload.is_suspended).to be true
        end
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#unsuspend' do
      let(:course) { create(:course, is_suspended: true) }
      subject { patch :unsuspend, params: { course_id: course } }

      context 'when the user is a Course Owner' do
        let(:user) { create(:course_owner, course: course).user }

        it 'unsuspends the course' do
          subject
          expect(course.reload.is_suspended).to be false
        end
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it 'unsuspends the course' do
          subject
          expect(course.reload.is_suspended).to be false
        end
      end

      context 'when the user is a Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course } }
      before { controller.instance_variable_set(:@course, course) }

      context 'when the user is a Course Owner' do
        let(:user) { create(:course_owner, course: course).user }

        it 'allows the owner to destroy the course' do
          subject
          expect(controller.current_course).to be_destroyed
        end

        it { is_expected.to have_http_status(:ok) }

        context 'when the course cannot be destroyed' do
          before do
            allow(course).to receive(:destroy).and_return(false)
            subject
          end

          it 'returns bad_request with errors' do
            expect(subject).to have_http_status(:bad_request)
            expect(JSON.parse(subject.body)['errors']).not_to be_nil
          end
        end
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }

        it 'does not destroy the course' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
          expect(Course.exists?(course.id)).to be_truthy
        end
      end

      context 'when the user is an Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }

        it 'does not destroy the course' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
          expect(Course.exists?(course.id)).to be_truthy
        end
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }

        it 'does not destroy the course' do
          expect { subject }.to raise_exception(CanCan::AccessDenied)
          expect(Course.exists?(course.id)).to be_truthy
        end
      end
    end
  end
end
