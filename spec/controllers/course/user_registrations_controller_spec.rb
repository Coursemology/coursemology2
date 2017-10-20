# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserRegistrationsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, :enrollable) }
    describe '#create' do
      before { sign_in(user) }
      subject { post :create, params: { course_id: course, registration: registration_params } }

      context 'when no registration code is specified' do
        let(:registration_params) { { code: '' } }

        context 'when the user is already registered' do
          context 'when the user is a student of the course' do
            let!(:course_student) { create(:course_student, course: course, user: user) }

            it { expect { subject }.not_to change { course.course_users.count } }
            it { is_expected.to redirect_to(course_path(course)) }
            it 'sets the proper flash message' do
              subject
              expect(flash[:info]).to eq(I18n.t('course.users.new.already_registered'))
            end
          end

          context 'when the user is a manager of the course' do
            let!(:course_manager) { create(:course_manager, course: course, user: user) }

            it { expect { subject }.not_to change { course.course_users.reload.count } }
            it { is_expected.to redirect_to(course_path(course)) }
            it 'sets the proper flash message' do
              subject
              expect(flash[:info]).to eq(I18n.t('course.users.new.already_registered'))
            end
          end
        end
      end

      context 'when a registration code is specified' do
        let(:registration_params) { { code: registration_code } }

        context 'when a user registration code is specified' do
          let(:registration_code) { create(:course_user_invitation, course: course).invitation_key }

          context 'when the user is not in the course' do
            context 'when the course is open' do
              it 'registers the user' do
                expect { subject }.to change { course.course_users.count }.by(1)
              end
              it { is_expected.to redirect_to(course_path(course)) }
              it 'sets the proper flash message' do
                subject
                expect(flash[:success]).to eq(I18n.t('course.user_registrations.create.registered'))
              end
            end

            context 'when the course does not allow enrolment requests' do
              before { course.update_attributes!(enrollable: false) }
              it 'rejects the request' do
                expect { subject }.to change { course.course_users.count }.by(1)
              end
            end
          end

          context 'when the user is already registered' do
            let(:user) { create(:user) }
            let!(:course_user) { create(:course_student, user: user, course: course) }
            let(:invitation) { create(:course_user_invitation, email: user.email) }
            let(:registration_code) { invitation.invitation_key }

            it { expect { subject }.not_to change { course.course_users.reload.count } }
            it { is_expected.to redirect_to(course_path(course)) }
            it 'sets the proper flash message' do
              subject
              expect(flash[:info]).to eq(I18n.t('course.users.new.already_registered'))
            end
          end
        end

        context 'when a course registration code is specified' do
          let(:registration_code) do
            course.generate_registration_key
            course.save!
            course.registration_key
          end

          context 'when the user is not in the course' do
            context 'when the course is open' do
              it 'registers the user' do
                expect { subject }.to change { course.course_users.count }.by(1)
              end
              it { is_expected.to redirect_to(course_path(course)) }
              it 'sets the proper flash message' do
                subject
                expect(flash[:success]).to eq(I18n.t('course.user_registrations.create.registered'))
              end
            end

            context 'when the course does not allow enrolment requests' do
              before { course.update_attributes!(enrollable: false) }
              it 'rejects the request' do
                expect { subject }.to change { course.course_users.count }.by(1)
              end
            end
          end

          context 'when the user is already registered' do
            before { create(:course_student, course: course, user: user) }

            it { expect { subject }.not_to change { course.course_users.count } }
            it { is_expected.to redirect_to(course_path(course)) }
            it 'sets the proper flash message' do
              subject
              expect(flash[:info]).to eq(I18n.t('course.users.new.already_registered'))
            end
          end
        end

        context 'when an invalid registration code is specified' do
          let(:registration_code) { '*' }
          it 'rejects the request' do
            expect(subject).to render_template('course/courses/show')
          end
        end
      end
    end
  end
end
