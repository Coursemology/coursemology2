require 'rails_helper'

RSpec.describe 'Inherited Nested Layouts', type: :controller do
  class ControllerA < ApplicationController
    layout 'testA'
  end

  class ControllerB < ControllerA
    layout :controller_b_layout

    def controller_b_layout
      'testB'
    end
  end

  class ControllerC < ControllerB
    layout 'testC'
  end

  controller(ControllerC) do
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
end
