require 'rails_helper'

RSpec.describe Course::Material, type: :model do
  it { is_expected.to belong_to(:creator) }

  let!(:instance) { create(:instance) }
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
  end
end
