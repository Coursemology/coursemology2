require 'rails_helper'

RSpec.describe Course::Material::FoldersController, type: :controller do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }
    let(:folder_stub) do
      stub = create(:folder, course: course, parent: create(:folder, course: course))
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    before { sign_in(user) }

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: folder_stub }

      context 'when folder cannot be destroyed' do
        before do
          controller.instance_variable_set(:@folder, folder_stub)
          subject
        end

        it { is_expected.to redirect_to(course_material_folder_path(course, folder_stub.parent)) }

        it 'shows a flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.material.folders.destroy.failure'))
        end
      end
    end
  end
end
