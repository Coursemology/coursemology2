# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::VirtualClassroomsHelper do
  describe '#virtual_classrooms_title' do
    let(:settings_with_default_title) { OpenStruct.new(title: nil) }
    let(:settings_with_given_title) { OpenStruct.new(title: 'The title') }

    before do
      helper.extend(ApplicationFormattersHelper)
    end

    context 'when the title is blank' do
      before do
        helper.instance_variable_set(:@settings, settings_with_default_title)
      end

      it 'returns nil' do
        expect(helper.virtual_classrooms_title).to be_nil
      end
    end

    context 'when the title is set' do
      before do
        helper.instance_variable_set(:@settings, settings_with_given_title)
      end

      it 'returns a string' do
        expect(helper.virtual_classrooms_title).to eq(settings_with_given_title.title)
      end
    end
  end
end
