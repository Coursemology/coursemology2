# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::DuplicationsController, type: :controller do
  let(:instance) { Instance.default }
  let(:destination_instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#create' do
      subject do
        post :create, format: :json, params: {
          course_id: course.id, duplication: {
            destination_instance_id: destination_instance.id, new_title: 'abcd', new_start_at: Time.now
          }
        }
      end

      context 'when instance admin of only one instance wants to duplicate course to another instance' do
        let(:instance_admin_user) { create(:instance_administrator).user }
        let(:instance_admin_course_user) { create(:course_manager, user: instance_admin_user, course: course).user }
        before { controller_sign_in(controller, instance_admin_course_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when admin user wants to duplicate course to another instance' do
        let(:admin) { create(:administrator) }
        let(:admin_course_user) { create(:course_manager, user: admin, course: course).user }
        before { controller_sign_in(controller, admin_course_user) }

        it 'expects the duplication to be successful' do
          subject
          expect(response).to be_successful
        end
      end

      context 'when a course manager (without instance instructor role) duplicates to the same instance' do
        let(:course_manager_user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, course_manager_user) }

        subject do
          post :create, format: :json, params: {
            course_id: course.id, duplication: {
              destination_instance_id: instance.id, new_title: 'Copy', new_start_at: Time.now
            }
          }
        end

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a user is instructor in the destination instance but not the source instance' do
        let(:dest_instructor_user) do
          user = create(:user)
          create(:course_manager, course: course, user: user)
          ActsAsTenant.with_tenant(destination_instance) { create(:instance_user, :instructor, user: user) }
          user
        end
        before { controller_sign_in(controller, dest_instructor_user) }

        it 'allows duplication to the destination instance' do
          subject
          expect(response).to be_successful
        end
      end
    end
  end
end
