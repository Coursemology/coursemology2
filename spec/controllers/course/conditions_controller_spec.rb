# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ConditionsController, type: :controller do
  controller(Course::ConditionsController) do
  end

  describe '#success_action' do
    it { expect { controller.success_action }.to raise_error(NotImplementedError) }
  end

  describe '#set_conditional' do
    it { expect { controller.set_conditional }.to raise_error(NotImplementedError) }
  end
end
