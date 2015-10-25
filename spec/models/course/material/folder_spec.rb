require 'rails_helper'

RSpec.describe Course::Material::Folder, type: :model do
  it { is_expected.to have_many(:materials).autosave(true) }
  it { is_expected.to have_many(:children).dependent(:destroy) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    context 'when two subfolders have the same name' do
      let(:parent) { create(:course_material_folder) }
      let(:child) { create(:course_material_folder, parent: parent, name: 'example folder') }
      subject { build(:course_material_folder, parent: parent, name: child.name) }

      it 'is not valid' do
        expect(subject).to be_invalid

        subject.name = child.name.upcase
        expect(subject).to be_invalid
      end
    end

    context 'after course was created' do
      let(:course) { build(:course) }

      it 'creates a root folder' do
        expect { course.save }.to change(course.material_folders, :count).by(1)
        expect(course.root_folder).to be_present
      end
    end
  end
end
