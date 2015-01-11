require 'rails_helper'

describe 'Inherited Nested Layouts', type: :controller do
  class ControllerA < ApplicationController
    layout 'testA'
  end

  class ControllerB < ControllerA
    layout :get_layout

    def get_layout
      'testB'
    end
  end

  controller(ControllerB) do
  end

  it 'gets the correct current layout' do
    expect(controller.current_layout).to eq('testB')
  end

  it 'gets the correct parent layout' do
    expect(controller.parent_layout).to eq('testA')
  end
end
