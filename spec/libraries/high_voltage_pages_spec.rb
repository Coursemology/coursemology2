# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extension: High Voltage Page Action Class', type: :controller do
  controller(HighVoltage::PagesController) do
    def action_has_layout?
      false
    end
  end

  it 'gets the correct action class' do
    get :show, params: { id: 'home' }
    expect(controller.view_context.page_action_class).to eq('home')
  end
end
