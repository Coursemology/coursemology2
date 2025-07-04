# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Material::MaterialsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let!(:course_user) { create(:course_user, course: course, user: user) }
    let(:material_stub) do
      stub = create(:material, :not_chunked)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end
    let(:folder) { material_stub.folder }
    let(:course) { folder.course }

    before { controller_sign_in(controller, user) }

    describe '#show' do
      let(:material) { create(:material, folder: folder) }

      subject { get :show, params: { course_id: course, folder_id: folder, id: material } }

      it 'renders the attachment url' do
        subject
        expect(response.body).to include(material.attachment.url)
      end

      context 'when a Course Manager uploads a material for an assessment' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }

        let!(:course_user) { CourseUser.find_by(course: course, user: user) }
        let!(:assessment) do
          create(:assessment, :published, :with_all_question_types, :with_attachments, course: course,
                                                                                       session_password: 'super_secret')
        end
        let!(:folder_assessment) { assessment.folder }
        let!(:material_assessment) { folder_assessment.materials.first }

        subject { get :show, params: { course_id: course, folder_id: folder_assessment, id: material_assessment } }

        it 'creates a new submission' do
          subject
          expect(assessment.submissions.length).to eq(1)
          expect(assessment.submissions.first.answers.length).to eq(assessment.questions.length)
          expect(response.body).to include(material_assessment.attachment.url)
        end
      end

      context 'when a Course Owner uploads a material for an assessment' do
        let(:user) { create(:course_owner, course: course).user }
        before { controller_sign_in(controller, user) }

        let!(:course_user) { CourseUser.find_by(course: course, user: user) }
        let!(:assessment) do
          create(:assessment, :published, :with_all_question_types, :with_attachments, course: course,
                                                                                       session_password: 'super_secret')
        end
        let!(:folder_assessment) { assessment.folder }
        let!(:material_assessment) { folder_assessment.materials.first }

        subject { get :show, params: { course_id: course, folder_id: folder_assessment, id: material_assessment } }

        it 'creates a new submission' do
          subject
          expect(assessment.submissions.length).to eq(1)
          expect(assessment.submissions.first.answers.length).to eq(assessment.questions.length)
          expect(response.body).to include(material_assessment.attachment.url)
        end
      end
    end

    describe '#update' do
      let(:file) { fixture_file_upload('files/picture.jpg', 'image/jpeg') }
      let(:attributes) { attributes_for(:material, file: file) }
      subject do
        patch :update,
              params: { course_id: course, folder_id: folder, id: material_stub, material: attributes }
      end

      context 'when a different file is given' do
        it 'changes the file' do
          old_file_url = material_stub.attachment.url
          subject
          expect(material_stub.reload.attachment.url).not_to eq(old_file_url)
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, folder_id: folder, id: material_stub } }

      context 'when material cannot be destroyed' do
        before do
          controller.instance_variable_set(:@material, material_stub)
          subject
        end

        it { expect(response.status).to eq(400) }
      end
    end
  end
end
