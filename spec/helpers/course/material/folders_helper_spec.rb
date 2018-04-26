# frozen_string_literal: true
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

  let(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#show_sdl_warning?' do
      let(:course) { build(:course, advance_start_at_duration_days: 3) }
      subject { helper.show_sdl_warning?(folder) }

      context 'when folder starts after the self directed learning period' do
        let(:folder) { build(:folder, course: course, start_at: 7.days.from_now) }

        it { is_expected.to be false }
      end

      context 'when folder starts in the self directed learning period' do
        let(:folder) { build(:folder, course: course, start_at: 2.days.from_now) }

        it { is_expected.to be true }
      end

      context 'when folder has already started' do
        let(:folder) { build(:folder, course: course, start_at: 7.days.ago) }

        it { is_expected.to be false }
      end
    end
  end
end
