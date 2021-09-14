# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Material, type: :model do
  it { is_expected.to belong_to(:folder).inverse_of(:materials) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    context 'when two materials have the same name' do
      let(:folder) { create(:folder) }
      let!(:material) { create(:material, folder: folder, name: 'Mixed Case') }
      subject { build(:material, folder: folder, name: material.name) }

      it 'is not valid' do
        expect(subject).to be_invalid

        subject.name.upcase!
        expect(subject).to be_invalid
      end
    end

    context 'when folder and material have the same name' do
      let(:parent_folder) { create(:folder) }
      let!(:folder) { create(:folder, parent: parent_folder, name: 'Mixed Case') }
      subject { build(:material, folder: parent_folder, name: folder.name) }

      it 'is not valid' do
        expect(subject).to be_invalid

        subject.name.upcase!
        expect(subject).to be_invalid
      end
    end

    describe '#next_valid_name' do
      let(:common_name) { 'Common Name' }
      let(:parent_folder) { create(:folder) }
      let(:material) { build(:material, folder: parent_folder, name: common_name) }

      let(:other_material) { build(:material, folder: parent_folder, name: common_name.downcase) }
      let(:sibling_folder) { build(:folder, parent: parent_folder, name: "#{common_name} (0)") }

      it 'returns a unique name' do
        # When there are no name conflicts
        expect(material.send(:next_valid_name)).to eq(common_name)

        # When there is a name conflict with another material
        other_material.save
        expect(material.send(:next_valid_name)).to eq("#{common_name} (0)")

        # When there is another name conflict with a sibling folder
        sibling_folder.save!
        expect(material.send(:next_valid_name)).to eq("#{common_name} (1)")
      end
    end
  end
end
