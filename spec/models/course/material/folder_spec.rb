# frozen_string_literal: true
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

    context 'when folder and material have the same name' do
      let(:parent_folder) { create(:folder) }
      let(:material) { create(:material, folder: parent_folder, name: 'Mixed Case') }
      subject { build(:folder, parent: parent_folder, name: material.name) }

      it 'is not valid' do
        expect(subject).to be_invalid

        subject.name.upcase!
        expect(subject).to be_invalid
      end
    end

    describe '.after_course_initialize' do
      let(:course) { build(:course) }

      it 'builds only one root folder' do
        expect(course.material_folders.length).to eq(1)

        # Call the callback one more time
        Course::Material::Folder.after_course_initialize(course)
        expect(course.material_folders.length).to eq(1)

        course.save
        expect(course.root_folder).to be_persisted
      end
    end

    describe '#next_valid_name' do
      let(:common_name) { 'This Is A Folder' }
      let(:parent_folder) { create(:folder) }
      let(:folder) { build(:folder, parent: parent_folder, name: common_name) }

      let(:other_child_folder) { build(:folder, parent: parent_folder, name: common_name.downcase) }
      let(:material) { build(:material, folder: parent_folder, name: common_name + ' (0)') }

      subject { folder.next_valid_name }
      it 'finds the proper name' do
        # When there is no name conflicts
        expect(folder.send(:next_valid_name)).to eq(common_name)

        # When is is a name conflict
        other_child_folder.save
        expect(folder.send(:next_valid_name)).to eq(common_name + ' (0)')

        # When there is another name conflict with lower case
        material.save
        expect(folder.send(:next_valid_name)).to eq(common_name + ' (1)')
      end
    end
  end
end
