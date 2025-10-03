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
    end
  end
end
