require 'rails_helper'

RSpec.describe Course::Material::FoldersHelper, type: :helper do
  describe '#display_folder' do
    let(:root_folder) { OpenStruct.new(root?: true, name: 'Root') }
    let(:normal_folder) { OpenStruct.new(root?: false, name: 'Folder') }
    before do
      def helper.component
        OpenStruct.new(settings: OpenStruct.new(title: 'Custom title'))
      end
    end

    context 'when folder is root' do
      subject { helper.display_folder(root_folder) }

      it 'displays the name from settings' do
        expect(subject).to eq('Custom title')
      end
    end

    context 'when folder is not root' do
      subject { helper.display_folder(normal_folder) }

      it 'displays the folder name' do
        expect(subject).to eq(normal_folder.name)
      end
    end
  end
end
