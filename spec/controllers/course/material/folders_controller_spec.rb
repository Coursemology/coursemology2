# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Material::FoldersController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let(:folder_stub) { create(:folder, course: course, parent: create(:folder, course: course)) }
    let(:root_folder) { course.root_folder }

    before { controller_sign_in(controller, user) }

    describe '#show' do
      render_views
      subject { get :show, as: :json, params: { course_id: course, id: folder_stub } }

      context 'when folder exists' do
        it 'responds with 200 and folder_stub json' do
          expect(subject.status).to eq(200)
          expect(JSON.parse(subject.body)['currFolderInfo']['id']).to eq(folder_stub.id)
        end
      end

      context 'when folder does not exist' do
        run_rescue
        before do
          folder_stub.destroy
        end

        it 'responds with 404 and root folder json' do
          expect(subject.status).to eq(404)
          expect(JSON.parse(subject.body)['currFolderInfo']['id']).to eq(root_folder.id)
        end
      end
    end

    describe '#index' do
      render_views
      subject { get :index, as: :json, params: { course_id: course } }

      context 'when root folder exists' do
        it 'responds with 200 and root folder json' do
          expect(subject.status).to eq(200)
          expect(JSON.parse(subject.body)['currFolderInfo']['id']).to eq(root_folder.id)
        end
      end

      context 'when root folder does not exist' do
        before { course.root_folder.destroy }

        it 'responds with 404' do
          expect(subject.status).to eq(404)
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: folder_stub } }

      context 'when folder cannot be destroyed' do
        before do
          allow(folder_stub).to receive(:destroy).and_return(false)
          controller.instance_variable_set(:@folder, folder_stub)
        end
        it 'returns an error' do
          expect(subject.status).to eq(400)
        end
      end
    end

    describe '#upload_materials' do
      let(:file) { Rack::Test::UploadedFile.new(Rails.root.join('spec', 'fixtures', 'files', 'text.txt')) }
      subject do
        patch :upload_materials, as: :json,
                                 params: { course_id: course,
                                           id: folder_stub,
                                           material_folder: { files_attributes: [file] } }
      end

      context 'when files cannot be uploaded' do
        before do
          allow(folder_stub).to receive(:save).and_return(false)
          controller.instance_variable_set(:@folder, folder_stub)
        end
        it 'returns an error' do
          expect(subject.status).to eq(400)
        end
      end
    end

    describe '#download' do
      let(:folder) { create(:folder, course: course, parent: course.root_folder) }
      let!(:material) { create(:course_material, folder: folder) }

      subject { get :download, as: :json, params: { course_id: course, id: folder } }

      it 'downloads all the files in current folder' do
        subject
        expect(controller.instance_variable_get(:@materials)).to contain_exactly(material)
      end

      context 'when the user is a Course Student' do
        let(:user) { create(:course_student, course: course).user }
        before do
          controller_sign_in(controller, user)
          subject
        end

        it 'downloads all the files in current folder' do
          expect(response).to have_http_status(:ok)
          expect(controller.instance_variable_get(:@materials)).to contain_exactly(material)
        end
      end

      context 'when the user is a Course Manager' do
        let(:user) { create(:course_manager, course: course).user }
        before do
          controller_sign_in(controller, user)
          subject
        end

        it 'downloads all the files in current folder' do
          expect(response).to have_http_status(:ok)
          expect(controller.instance_variable_get(:@materials)).to contain_exactly(material)
        end
      end

      context 'when the user is a Course Owner' do
        let(:user) { create(:course_owner, course: course).user }
        before do
          controller_sign_in(controller, user)
          subject
        end

        it 'downloads all the files in current folder' do
          expect(response).to have_http_status(:ok)
          expect(controller.instance_variable_get(:@materials)).to contain_exactly(material)
        end
      end

      context 'when the user is a Course Teaching Assistant' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before do
          controller_sign_in(controller, user)
          subject
        end

        it 'downloads all the files in current folder' do
          expect(response).to have_http_status(:ok)
          expect(controller.instance_variable_get(:@materials)).to contain_exactly(material)
        end
      end
    end

    describe '#breadcrumbs' do
      let!(:ancestor) { create(:folder, course: course, parent: course.root_folder) }
      let!(:folder) { create(:folder, course: course, parent: ancestor) }
      render_views

      subject(:member_request) do
        get :breadcrumbs, as: :json, params: { course_id: course, id: folder.id }
      end

      subject(:collection_request) do
        get :breadcrumbs, as: :json, params: { course_id: course }
      end

      context 'when a Course Student fetches breadcrumbs' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }

        it 'returns 200 for a specific folder (member route)' do
          member_request
          expect(response).to have_http_status(:ok)
          breadcrumb_ids = JSON.parse(response.body)['breadcrumbs'].map { |b| b['id'] }
          expect(breadcrumb_ids).to eq([course.root_folder.id, ancestor.id, folder.id])
        end

        it 'returns 200 for a root folder (collection route)' do
          collection_request
          expect(response).to have_http_status(:ok)
          breadcrumb_ids = JSON.parse(response.body)['breadcrumbs'].map { |b| b['id'] }
          expect(breadcrumb_ids).to eq([course.root_folder.id])
        end
      end

      context 'when a Course Manager fetches breadcrumbs' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }

        it 'returns 200 for a specific folder (member route)' do
          member_request
          expect(response).to have_http_status(:ok)
          breadcrumb_ids = JSON.parse(response.body)['breadcrumbs'].map { |b| b['id'] }
          expect(breadcrumb_ids).to eq([course.root_folder.id, ancestor.id, folder.id])
        end

        it 'returns 200 for a root folder (collection route)' do
          collection_request
          expect(response).to have_http_status(:ok)
          breadcrumb_ids = JSON.parse(response.body)['breadcrumbs'].map { |b| b['id'] }
          expect(breadcrumb_ids).to eq([course.root_folder.id])
        end
      end

      context 'when a Course Owner fetches breadcrumbs' do
        let(:user) { create(:course_owner, course: course).user }
        before { controller_sign_in(controller, user) }

        it 'returns 200 for a specific folder (member route)' do
          member_request
          expect(response).to have_http_status(:ok)
          breadcrumb_ids = JSON.parse(response.body)['breadcrumbs'].map { |b| b['id'] }
          expect(breadcrumb_ids).to eq([course.root_folder.id, ancestor.id, folder.id])
        end

        it 'returns 200 for a root folder (collection route)' do
          collection_request
          expect(response).to have_http_status(:ok)
          breadcrumb_ids = JSON.parse(response.body)['breadcrumbs'].map { |b| b['id'] }
          expect(breadcrumb_ids).to eq([course.root_folder.id])
        end
      end

      context 'when a Course Teaching Assistant fetches breadcrumbs' do
        let(:user) { create(:course_teaching_assistant, course: course).user }
        before { controller_sign_in(controller, user) }

        it 'returns 200 for a specific folder (member route)' do
          member_request
          expect(response).to have_http_status(:ok)
          breadcrumb_ids = JSON.parse(response.body)['breadcrumbs'].map { |b| b['id'] }
          expect(breadcrumb_ids).to eq([course.root_folder.id, ancestor.id, folder.id])
        end

        it 'returns 200 for a root folder (collection route)' do
          collection_request
          expect(response).to have_http_status(:ok)
          breadcrumb_ids = JSON.parse(response.body)['breadcrumbs'].map { |b| b['id'] }
          expect(breadcrumb_ids).to eq([course.root_folder.id])
        end
      end
    end
  end
end
