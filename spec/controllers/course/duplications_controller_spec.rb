# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::DuplicationsController, type: :controller do
  let(:instance) { Instance.default }
  let(:destination_instance) { create(:instance) }
  let(:destination_instance_admin) { create(:instance_user, :instructor, instance: destination_instance).user }

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
        before { sign_in(instance_admin_course_user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when course manager in a course which is instance normal wants to duplicate to other instance' do
        let(:instance_normal_user) do
          ActsAsTenant.without_tenant do
            create(:instance_user, user: destination_instance_admin, instance: instance).user
          end
        end
        let!(:instance_course_manager) { create(:course_manager, user: instance_normal_user, course: course).user }
        before { sign_in(instance_course_manager) }

        it 'expects the duplication to be successful' do
          subject
          expect(response).to be_successful
        end
      end

      context 'when admin user wants to duplicate course to another instance' do
        let(:admin) { create(:administrator) }
        let(:admin_course_user) { create(:course_manager, user: admin, course: course).user }
        before { sign_in(admin_course_user) }

        it 'expects the duplication to be successful' do
          subject
          expect(response).to be_successful
        end
      end
    end
  end
end
