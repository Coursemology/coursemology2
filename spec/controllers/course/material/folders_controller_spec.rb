# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Material::FoldersController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let(:folder_stub) do
      stub = create(:folder, course: course, parent: create(:folder, course: course))
      allow(stub).to receive(:destroy).and_return(false)
      allow(stub).to receive(:update).and_return(false)
      allow(stub).to receive(:save).and_return(false)
      stub
    end

    before { controller_sign_in(controller, user) }

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: folder_stub } }

      context 'when folder cannot be destroyed' do
        before do
          controller.instance_variable_set(:@folder, folder_stub)
          subject
        end
        it 'returns an error' do
          expect(response.status).to eq(400)
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
          controller.instance_variable_set(:@folder, folder_stub)
          subject
        end
        it 'returns an error' do
          expect(response.status).to eq(400)
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

      context 'when the user is a student' do
        let(:user) { create(:course_student, course: course).user }

        it 'downloads all the files in current folder' do
          subject
          expect(controller.instance_variable_get(:@materials)).to contain_exactly(material)
        end
      end
    end
  end
end
