# frozen_string_literal: true
require 'rails_helper'

RSpec.describe User::RegistrationsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#new' do
      context 'when there is no invitation key' do
        requires_login
        subject { get :new }

        it 'succeeds with no response body' do
          subject
          expect(response.status).to eq(204)
          expect(response.body).to be_empty
        end
      end

      context 'when there is an invitation key' do
        requires_login
        subject { get :new, params: { invitation: invitation_key } }

        context 'when the key is invalid' do
          let(:invitation_key) { '#########' }
          it 'succeeds with no response body' do
            subject
            expect(response.status).to eq(204)
            expect(response.body).to be_empty
          end
        end

        context 'when the key is a valid course invitation' do
          let(:course) { create(:course) }
          let(:invitation) { create(:course_user_invitation, course: course) }
          let(:invitation_key) { invitation.invitation_key }
          it 'succeeds and returns course details' do
            subject
            expect(response.status).to eq(200)
            response_body = JSON.parse(response.body)
            expect(response_body['courseId']).to eq(course.id)
            expect(response_body['courseTitle']).to eq(course.title)
            expect(response_body['name']).to eq(invitation.name)
            expect(response_body['email']).to eq(invitation.email)
          end
        end

        context 'when the key is a valid instance invitation' do
          let(:invitation) { create(:instance_user_invitation, instance: instance) }
          let(:invitation_key) { invitation.invitation_key }
          it 'succeeds and returns instance details' do
            subject
            expect(response.status).to eq(200)

            response_body = JSON.parse(response.body)
            expect(response_body['instanceName']).to eq(Instance.default.name)
            expect(response_body['instanceHost']).to eq(Instance.default.host)
            expect(response_body['name']).to eq(invitation.name)
            expect(response_body['email']).to eq(invitation.email)
          end
        end
      end
    end

    describe '#create' do
      subject do
        valid_user = attributes_for(:user).reverse_merge(email: generate(:email))
        post :create, params: {
          user: {
            name: valid_user[:name],
            email: valid_user[:email],
            password: valid_user[:password],
            password_confirmation: valid_user[:password]
          }
        }
      end

      context 'user registration is successful' do
        requires_login

        it 'creates a new account' do
          allow(controller).to receive(:verify_recaptcha).and_return(true)
          expect { subject }.to change { User.count }.by(1)
        end
      end

      context 'recaptcha is not validated' do
        requires_login

        it 'does not register any new users' do
          allow(controller).to receive(:verify_recaptcha).and_return(false)
          expect { subject }.to change { User.count }.by(0)
        end
      end

      context 'when enrol_course_id is provided' do
        requires_login

        let(:valid_user_params) do
          valid_user = attributes_for(:user).reverse_merge(email: generate(:email))
          {
            user: {
              name: valid_user[:name],
              email: valid_user[:email],
              password: valid_user[:password],
              password_confirmation: valid_user[:password]
            }
          }
        end

        before { allow(controller).to receive(:verify_recaptcha).and_return(true) }

        context 'when the course does not exist' do
          it 'returns 404' do
            post :create, params: valid_user_params.merge(enrol_course_id: 0)
            expect(response.status).to eq(404)
          end
        end

        context 'when the course exists but is not published or enrollable' do
          let(:course) { create(:course) }

          it 'returns 403' do
            post :create, params: valid_user_params.merge(enrol_course_id: course.id)
            expect(response.status).to eq(403)
          end
        end

        context 'when the course is published and enrollable' do
          let(:course) { create(:course, :published, :enrollable) }

          it 'creates a pending enrol request for the new user' do
            expect do
              post :create, params: valid_user_params.merge(enrol_course_id: course.id)
            end.to change(Course::EnrolRequest, :count).by(1)

            new_user = User.order(:created_at).last
            enrol_request = Course::EnrolRequest.find_by(course: course, user: new_user)
            expect(enrol_request).to be_present
            expect(enrol_request.workflow_state).to eq('pending')
          end

          context 'when the course has auto-approve enabled' do
            let(:course) { create(:course, :published, :enrollable, enrol_auto_approve: true) }

            it 'auto-approves the request and creates a CourseUser' do
              post :create, params: valid_user_params.merge(enrol_course_id: course.id)

              new_user = User.order(:created_at).last
              enrol_request = Course::EnrolRequest.find_by(course: course, user: new_user)
              expect(enrol_request.workflow_state).to eq('approved')
              expect(CourseUser.find_by(course: course, user: new_user)).to be_present
            end
          end
        end
      end
    end
  end
end
