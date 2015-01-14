require 'rails_helper'

describe 'High Voltage Pages Action Class', type: :controller do
  controller(HighVoltage::PagesController) do
    def action_has_layout?
      false
    end
  end

  it 'gets the correct action class' do
    get :show, id: 'home'
    expect(controller.view_context.page_action_class).to eq('home')
  end
end
