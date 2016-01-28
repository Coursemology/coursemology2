# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ApplicationCocoonHelper, type: :helper do
  describe '#link_to_add_association' do
    let(:course_group) { Course::Group.new }
    let(:form_object) { double(object: course_group, object_name: course_group.class.name) }
    let(:html_options) do
      {
        find_using: 'next',
        selector: 'tbody',
        insert_using: 'append'
      }
    end

    let(:expected_options) do
      {
        'data-association-insertion-traversal' => 'next',
        'data-association-insertion-node' => 'tbody',
        'data-association-insertion-method' => 'append'
      }
    end

    before do
      allow(view).to receive(:render_association).and_return('form<tag>')
    end

    context 'when block it not given' do
      let(:args) { ['Add User', form_object, :group_users] }
      subject { view.link_to_add_association(*args, html_options) }

      it 'generates the correct options and the name' do
        expect(subject).to have_tag('a', with: expected_options) do
          with_text 'Add User'
        end
      end
    end

    context 'when a block is given' do
      let(:block_args) { [form_object, :group_users] }

      subject do
        view.link_to_add_association(*block_args, html_options) do
          'New Name'
        end
      end

      it 'generates the correct options and the name' do
        expect(subject).to have_tag('a', with: expected_options) do
          with_text 'New Name'
        end
      end
    end
  end
end
