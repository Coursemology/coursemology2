# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: Inherited Nested Layouts', type: :controller do
  class self::ControllerA < ApplicationController
    prepend_view_path File.join(__dir__, '../fixtures/libraries/inherited_nested_layouts')
    layout 'testA'

    protected

    def publicly_accessible?
      true
    end
  end

  class self::ControllerB < self::ControllerA
    layout :controller_b_layout

    def controller_b_layout
      'testB'
    end
  end

  class self::ControllerC < self::ControllerB
    layout 'testC'
  end

  controller(self::ControllerC) do
    def index
      render template: 'content', layout: 'test_layout'
    end
  end

  it 'gets the correct current layout' do
    expect(controller.current_layout).to eq('testC')
  end

  it 'gets the correct parent layout' do
    expect(controller.parent_layout).to eq('testB')
  end

  it 'gets the correct parent layout of the specified parent' do
    expect(controller.parent_layout(of_layout: 'testB')).to eq('testA')
  end

  it 'gets the correct layout hierarchy' do
    expect(controller.layout_hierarchy).to eq([
                                                'default',
                                                'testA',
                                                'testB',
                                                'testC'
                                              ])
  end

  describe '#render' do
    context 'when rendering with an explicit :layout' do
      it 'gets the correct layout hierarchy' do
        get :index
        expect(controller.layout_hierarchy).to eq([
                                                    'default',
                                                    'testA',
                                                    'testB',
                                                    'testC',
                                                    'test_layout'
                                                  ])
      end
    end
  end
end
