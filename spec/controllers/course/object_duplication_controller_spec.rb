# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ObjectDuplicationsController do
  let(:admin) { create(:administrator) }
  let(:json_response) { JSON.parse(response.body) }
  let(:instance) { Instance.default }
  let(:other_instance) { create(:instance) }
  let!(:other_instance_course) do
    ActsAsTenant.with_tenant(other_instance) { create(:course, creator: admin) }
  end

  with_tenant(:instance) do
    let(:course) { create(:course, creator: admin) }
    let(:assessment) { create(:course_assessment_assessment, course: course) }
    let(:unenrolled_course) { create(:course) }
    let(:unenrolled_course_assessment) { create(:course_assessment_assessment, course: unenrolled_course) }

    let(:user) { admin }
    let(:instance_admin_user) { create(:instance_administrator).user }
    let(:instance_admin_course_user) { create(:course_manager, user: instance_admin_user, course: course).user }
    before { controller_sign_in(controller, user) }

    describe '#new' do
      render_views

      subject { get :new, format: :json, params: { course_id: course.id } }

      context 'when admin fetches the possible destination courses and instances' do
        before do
          controller_sign_in(controller, user)
          subject
        end

        it "includes user's courses from other instances in destinationCourses" do
          course_ids = json_response['destinationCourses'].map { |course| course['id'] }
          expect(course_ids).to contain_exactly(course.id, other_instance_course.id)
        end

        it 'includes all the existing instances' do
          instance_ids = json_response['destinationInstances'].map { |instance| instance['id'] }
          expect(instance_ids).to contain_exactly(*Instance.all.map(&:id))
        end
      end

      context 'when instance admin fetches the possible destination courses and instances' do
        before do
          controller_sign_in(controller, instance_admin_course_user)
          subject
        end

        it 'includes only course within the current instance in which they are manager' do
          course_ids = json_response['destinationCourses'].map { |course| course['id'] }
          expect(course_ids).to contain_exactly(course.id)
        end

        it 'includes only the current instance in which they are either instructor or administrator' do
          instance_ids = json_response['destinationInstances'].map { |instance| instance['id'] }
          expect(instance_ids).to contain_exactly(instance.id)
        end
      end
    end

    describe '#create' do
      subject do
        post :create, as: :json, params: {
          course_id: course.id, object_duplication: {
            destination_course_id: other_instance_course.id, items: items_params
          }
        }
      end

      context 'when valid parameters are provided' do
        let(:items_params) { { 'ASSESSMENT' => [assessment.id] } }

        it 'duplicates selected items' do
          expect do
            subject
            wait_for_job
          end.to change { other_instance_course.assessments.count }.by(1)
        end
      end

      context 'when invalid assessment id is provided' do
        let(:items_params) { { 'ASSESSMENT' => [unenrolled_course_assessment.id] } }

        it 'does not duplicate selected item' do
          expect do
            subject
            wait_for_job
          end.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      context 'when virtual folder id is provided but not its owner' do
        let(:items_params) { { 'FOLDER' => [assessment.folder.id] } }

        it 'does not duplicate selected item' do
          expect do
            subject
            wait_for_job
          end.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end
  end
end
